import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@my-app/database';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateOrderDto, OrderResponse, PublicOrderResponse, UpdateOrderStatusDto } from '@my-app/types';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) {}

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

        const tenantId = session.table?.tenantId ?? session.items[0]?.menuItem?.tenantId;
        if (!tenantId) {
            throw new BadRequestException('Could not resolve a tenant for this cart session');
        }

        const totalAmount = session.items.reduce((sum, item) => sum + item.quantity * Number(item.menuItem.price), 0);
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
                        create: session.items.map((item) => ({
                            menuItemId: item.menuItemId,
                            quantity: item.quantity,
                            priceAtOrder: item.menuItem.price,
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
