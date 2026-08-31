import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@my-app/database';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
    CreateOrderDto,
    HappyHourRuleResponse,
    OrderResponse,
    PublicOrderResponse,
    UpdateOrderStatusDto,
    parseSelectedModifiers,
    sumModifierAdjustments,
    type SelectedModifier,
} from '@my-app/types';
import { HappyHourService } from 'src/modules/happy-hour/happy-hour.service';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly happyHour: HappyHourService,
    ) {}

    async resolveKdsToken(token: string): Promise<string> {
        const tenantSettings = await this.prisma.tenantSettings.findUnique({
            where: { kdsToken: token },
        });

        if (!tenantSettings) {
            throw new NotFoundException('KDS token not found or invalid');
        }

        return tenantSettings.tenantId;
    }

    async createOrderFromCart(dto: CreateOrderDto): Promise<OrderResponse> {
        const session = await this.prisma.cartSession.findUnique({
            where: { id: dto.cartSessionId },
            include: {
                table: true,
                items: { include: { menuItem: true } },
            },
        });

        if (!session) {
            throw new NotFoundException('Cart session not found');
        }

        if (!session.isActive) {
            throw new BadRequestException('This cart session has already been closed');
        }

        if (session.items.length === 0) {
            throw new BadRequestException('Cannot create an order from an empty cart');
        }

        // "86 list" захист на етапі оформлення: якщо хоч одна позиція в кошику
        // стала неактивною після додавання — замовлення відхиляємо.
        const soldOutItem = session.items.find((item) => item.menuItem && item.menuItem.isActive === false);
        if (soldOutItem) {
            throw new BadRequestException('This item is currently sold out');
        }

        const tenantId = session.table?.tenantId ?? session.items[0]?.menuItem?.tenantId;
        if (!tenantId) {
            throw new BadRequestException('Could not resolve a tenant for this cart session');
        }

        // Динамічно застосовуємо активні знижки Happy Hour до кожної позиції.
        // Ціни зберігаються як `priceAtOrder`, а підсумок — з урахуванням знижки.
        const activeRules = await this.happyHour.getActiveRulesForTenant(tenantId);

        /*
         * Ціноутворення виконується ВИКЛЮЧНО на сервері.
         *
         * Для кожного рядка кошика:
         *   1) читаємо базову ціну страви з БД;
         *   2) перечитуємо надбавки обраних опцій з `ModifierOption` за їх ID
         *      (знімок у кошику — лише кеш; джерело істини завжди БД);
         *   3) Subtotal = base + Σ adjustments;
         *   4) Happy Hour застосовуємо до SUBTOTAL, а не до базової ціни.
         */
        const pricedItems = await Promise.all(
            session.items.map(async (item) => {
                const snapshot = parseSelectedModifiers(item.selectedModifiers);
                const modifiers = await this.resolveTrustedModifiers(item.menuItemId, snapshot);

                const basePrice = item.menuItem ? Number(item.menuItem.price) : 0;
                const subtotal = (Number.isFinite(basePrice) ? basePrice : 0) + sumModifierAdjustments(modifiers);
                const unitPrice = item.menuItem
                    ? this.applyHappyHourToSubtotal(item.menuItem, subtotal, activeRules)
                    : 0;

                return {
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    unitPrice,
                    modifiers,
                    guestSessionId: item.guestSessionId,
                    guestName: item.guestName,
                };
            }),
        );

        const totalAmount = pricedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

        const pickupAt = dto.pickupTime ? this.toPickupDateTime(dto.pickupTime) : null;

        const order = await this.prisma.$transaction(async (tx) => {
            const created = await tx.order.create({
                data: {
                    tenantId,
                    tableId: session.tableId,
                    isOrderAhead: session.isTakeaway,
                    customerName: dto.customerName ?? null,
                    pickupAt,
                    totalAmount: new Prisma.Decimal(totalAmount),
                    status: OrderStatus.new,
                    paymentStatus: PaymentStatus.pending,
                    items: {
                        create: pricedItems.map((item) => ({
                            menuItemId: item.menuItemId,
                            quantity: item.quantity,
                            priceAtOrder: new Prisma.Decimal(item.unitPrice),
                            // Історичний знімок: чек не «поїде» після правок меню.
                            selectedModifiers: item.modifiers,
                            guestSessionId: item.guestSessionId,
                            guestName: item.guestName,
                        })),
                    },
                },
                include: { items: { include: { menuItem: true } }, table: true },
            });

            await tx.cartSession.update({
                where: { id: session.id },
                data: { isActive: false },
            });

            return created;
        });

        return order as unknown as OrderResponse;
    }

    /**
     * Перечитує обрані опції з БД, щоб ціна не залежала від клієнтського знімка.
     *
     * Якщо опцію вже видалили з меню — лишаємо історичний запис зі знімка, бо
     * гість справді її замовив і вона мусить залишитись у чеку. А якщо таблиці
     * модифікаторів ще немає в БД (міграцію не накатано) — повертаємо знімок
     * як є, щоб чек все одно сформувався за збереженою ціною.
     */
    private async resolveTrustedModifiers(
        menuItemId: string,
        snapshot: SelectedModifier[],
    ): Promise<SelectedModifier[]> {
        if (snapshot.length === 0) return [];

        try {
            const options = await this.prisma.modifierOption.findMany({
                where: { id: { in: snapshot.map((modifier) => modifier.id) }, group: { menuItemId } },
            });

            const byId = new Map(options.map((option) => [option.id, option]));

            return snapshot.map((modifier) => {
                const fresh = byId.get(modifier.id);
                if (!fresh) return modifier;

                return {
                    id: fresh.id,
                    name: fresh.name,
                    priceAdjustment: Number(fresh.priceAdjustment),
                };
            });
        } catch {
            return snapshot;
        }
    }

    private toPickupDateTime(value: string): Date {
        const asTime = /^([01]?\d|2[0-3]):[0-5]\d$/.test(value.trim());
        if (asTime) {
            const [h, m] = value.trim().split(':').map(Number);
            const at = new Date();
            at.setHours(h, m, 0, 0);
            return at;
        }
        return new Date(value);
    }

    /**
     * Застосовує найкращу (найвигіднішу) активну знижку Happy Hour до вже
     * порахованого `subtotal` (база + модифікатори).
     *
     * Знижка ЗАВЖДИ вважається від повної конфігурації: гість, який узяв каву
     * з подвійним сиропом, отримує -20% і на сироп теж. Якщо жодне правило не
     * підходить — повертаємо `subtotal` без змін.
     */
    private applyHappyHourToSubtotal(
        menuItem: { id: string; categoryId: string },
        subtotal: number,
        rules: HappyHourRuleResponse[],
    ): number {
        let best = subtotal;

        for (const rule of rules) {
            const matchesItem = rule.items.some((i) => i.id === menuItem.id);
            const matchesCategory = rule.categories.some((c) => c.id === menuItem.categoryId);
            const appliesToAll = rule.items.length === 0 && rule.categories.length === 0;
            if (!matchesItem && !matchesCategory && !appliesToAll) continue;

            const discounted =
                rule.discountType === 'PERCENTAGE'
                    ? Math.max(0, subtotal * (1 - Math.min(100, Math.max(0, rule.discountValue)) / 100))
                    : Math.max(0, subtotal - rule.discountValue);

            if (discounted < best) best = discounted;
        }

        return best;
    }

    async getActiveOrders(tenantId: string): Promise<OrderResponse[]> {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const orders = await this.prisma.order.findMany({
            where: {
                tenantId: tenantId,
                status: { notIn: [OrderStatus.delivered, OrderStatus.cancelled] },
                createdAt: { gte: yesterday },
            },
            include: { items: { include: { menuItem: true } }, table: true },
            orderBy: { createdAt: 'desc' },
        });

        return orders as unknown as OrderResponse[];
    }

    /**
     * Публічне отримання замовлення для сторінки трекінгу гостя.
     * Повертає лише базові дані (статус, сума, позиції) — без конфіденційних полів.
     * orderId є непередбачуваним cuid, тому ендпоінт залишається публічним.
     */
    async getPublicOrderById(orderId: string): Promise<PublicOrderResponse> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { menuItem: true } } },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return {
            id: order.id,
            status: order.status,
            totalAmount: Number(order.totalAmount),
            items: order.items.map((item) => ({
                id: item.id,
                menuItemName: item.menuItem?.name ?? 'Item',
                quantity: item.quantity,
                priceAtOrder: Number(item.priceAtOrder),
                selectedModifiers: parseSelectedModifiers(item.selectedModifiers),
            })),
            createdAt: order.createdAt.toISOString(),
        };
    }

    async updateOrderStatus(tenantId: string, orderId: string, dto: UpdateOrderStatusDto): Promise<OrderResponse> {
        const existing = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { menuItem: true } }, table: true },
        });

        if (!existing) {
            throw new NotFoundException('Order not found');
        }

        if (existing.tenantId !== tenantId) {
            throw new BadRequestException('Order does not belong to this venue');
        }

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: dto.status as OrderStatus },
            include: { items: { include: { menuItem: true } }, table: true },
        });

        return updated as unknown as OrderResponse;
    }
}
