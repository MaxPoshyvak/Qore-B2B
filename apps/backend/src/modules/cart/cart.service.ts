import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, CartItem, CartSession } from '@my-app/database';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AddCartItemDto, SuccessResponse, UpdateCartItemDto } from '@my-app/types';
import { OrdersService } from 'src/modules/orders/orders.service';

export type CartSessionWithItems = Prisma.CartSessionGetPayload<{
    include: { items: { include: { menuItem: true } } };
}>;

@Injectable()
export class CartService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly orderService: OrdersService,
    ) {}

    /**
     * Resolves the cart session for a table.
     * - When `reopen` is false (read path), returns the latest session — even a
     *   closed one — so the client can detect a completed order. Creates one only
     *   if the table has never had a session.
     * - When `reopen` is true (mutations), ensures an ACTIVE session exists,
     *   reopening a fresh one if the previous order was already placed.
     * Verifies the table exists first so we never hit a FK violation.
     */
    private async resolveActiveSession(tableId: string, reopen = false): Promise<CartSessionWithItems> {
        const table = await this.prisma.table.findUnique({
            where: { id: tableId },
            select: { id: true },
        });
        if (!table) {
            throw new NotFoundException('Table not found');
        }

        const active = await this.prisma.cartSession.findFirst({
            where: { tableId, isActive: true },
            // Deterministic pick: if two guests reopened the table at the same instant,
            // every client must converge on the very same session.
            orderBy: { createdAt: 'asc' },
            include: { items: { include: { menuItem: true } } },
        });
        if (active) return active;

        if (!reopen) {
            const latest = await this.prisma.cartSession.findFirst({
                where: { tableId },
                orderBy: { createdAt: 'desc' },
                include: { items: { include: { menuItem: true } } },
            });
            if (latest) return latest;
        }

        return this.prisma.cartSession.create({
            data: { tableId },
            include: { items: { include: { menuItem: true } } },
        });
    }

    async getSessionForTable(tableId: string): Promise<SuccessResponse<CartSessionWithItems>> {
        const session = await this.resolveActiveSession(tableId);
        return { success: true, data: session };
    }

    /**
     * "Start a new order" from the guest UI: guarantees an ACTIVE (empty) session for
     * the table. Needed because the read path deliberately keeps returning the last
     * CLOSED session so every guest can see the "order placed" confirmation — without
     * this, nothing would ever flip the table back into an orderable state until
     * someone added an item.
     */
    async startNewSessionForTable(tableId: string): Promise<SuccessResponse<CartSessionWithItems>> {
        const session = await this.resolveActiveSession(tableId, true);
        return { success: true, data: session };
    }

    async getSessionById(sessionId: string): Promise<SuccessResponse<CartSessionWithItems>> {
        const session = await this.prisma.cartSession.findUnique({
            where: { id: sessionId },
            include: { items: { include: { menuItem: true } } },
        });
        if (!session) {
            throw new NotFoundException('Cart session not found');
        }
        return { success: true, data: session };
    }

    async createTakeawaySession(): Promise<SuccessResponse<CartSessionWithItems>> {
        const session = await this.prisma.cartSession.create({
            data: { isTakeaway: true },
            include: { items: { include: { menuItem: true } } },
        });
        return { success: true, data: session };
    }

    /** Shared add-to-cart logic used by both table and takeaway sessions. */
    private async applyAddItem(session: CartSessionWithItems, dto: AddCartItemDto): Promise<CartSessionWithItems> {
        const existingItem = await this.prisma.cartItem.findFirst({
            where: {
                cartSessionId: session.id,
                menuItemId: dto.menuItemId,
                guestSessionId: dto.guestSessionId,
            },
        });

        if (existingItem) {
            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + dto.quantity },
            });
        } else {
            await this.prisma.cartItem.create({
                data: {
                    cartSessionId: session.id,
                    menuItemId: dto.menuItemId,
                    quantity: dto.quantity,
                    guestSessionId: dto.guestSessionId,
                    guestName: dto.guestName,
                },
            });
        }

        return (await this.prisma.cartSession.findUnique({
            where: { id: session.id },
            include: { items: { include: { menuItem: true } } },
        }))!;
    }

    async addItem(tableId: string, dto: AddCartItemDto): Promise<SuccessResponse<CartSessionWithItems>> {
        const session = await this.resolveActiveSession(tableId, true);
        const updated = await this.applyAddItem(session, dto);
        return { success: true, data: updated };
    }

    async addItemForSession(sessionId: string, dto: AddCartItemDto): Promise<SuccessResponse<CartSessionWithItems>> {
        const session = await this.prisma.cartSession.findUnique({
            where: { id: sessionId },
            include: { items: { include: { menuItem: true } } },
        });
        if (!session) {
            throw new NotFoundException('Cart session not found');
        }
        const updated = await this.applyAddItem(session, dto);
        return { success: true, data: updated };
    }

    async updateItem(itemId: string, dto: UpdateCartItemDto): Promise<SuccessResponse<CartItem | null>> {
        const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
        if (!item) {
            throw new NotFoundException('Cart item not found');
        }
        if (item.guestSessionId !== dto.guestSessionId) {
            throw new ForbiddenException('You can only modify your own items');
        }

        // Quantity 0 means "remove this item from the shared cart".
        if (dto.quantity === 0) {
            const deleted = await this.prisma.cartItem.delete({ where: { id: itemId } });
            return { success: true, data: deleted };
        }

        const updated = await this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: dto.quantity },
        });
        return { success: true, data: updated };
    }

    async removeItem(itemId: string, guestSessionId: string): Promise<SuccessResponse<CartItem>> {
        const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
        if (!item) {
            throw new NotFoundException('Cart item not found');
        }
        if (item.guestSessionId !== guestSessionId) {
            throw new ForbiddenException('You can only modify your own items');
        }

        const deleted = await this.prisma.cartItem.delete({ where: { id: itemId } });
        return { success: true, data: deleted };
    }

    async clearTable(tableId: string): Promise<SuccessResponse<{ cleared: number }>> {
        const session = await this.prisma.cartSession.findFirst({
            where: { tableId, isActive: true },
            select: { id: true },
        });
        if (!session) {
            return { success: true, data: { cleared: 0 } };
        }

        const { count } = await this.prisma.cartItem.deleteMany({
            where: { cartSessionId: session.id },
        });
        return { success: true, data: { cleared: count } };
    }

    async toggleReady(tableId: string, guestSessionId: string): Promise<SuccessResponse<CartSessionWithItems>> {
        const session = await this.resolveActiveSession(tableId, false);

        // Order already placed — nothing left to toggle.
        if (!session.isActive) {
            return { success: true, data: session };
        }

        const confirmed = session.confirmedGuests ?? [];
        const isNowConfirmed = !confirmed.includes(guestSessionId);

        const confirmedGuests = isNowConfirmed
            ? [...confirmed, guestSessionId]
            : confirmed.filter((id) => id !== guestSessionId);

        // Completion check only when a guest *adds* their confirmation.
        let isActive = true;
        if (isNowConfirmed) {
            const distinctGuests = Array.from(new Set(session.items.map((i) => i.guestSessionId)));
            const everyoneReady = distinctGuests.length > 0 && distinctGuests.every((g) => confirmedGuests.includes(g));
            if (everyoneReady && session.tableId) {
                isActive = false;
                // A CartSession has no direct `tenantId` — resolve it via its table.
                const table = await this.prisma.table.findUnique({
                    where: { id: session.tableId },
                    select: { tenantId: true },
                });
                if (!table) {
                    throw new NotFoundException('Table not found');
                }
                await this.orderService.createOrderFromCart({
                    cartSessionId: session.id,
                });
            }
        }

        const updated = await this.prisma.cartSession.update({
            where: { id: session.id },
            data: { confirmedGuests, isActive },
            include: { items: { include: { menuItem: true } } },
        });

        return { success: true, data: updated };
    }
}
