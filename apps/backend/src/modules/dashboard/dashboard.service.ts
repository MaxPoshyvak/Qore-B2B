import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@my-app/database';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { DashboardTodayResponse } from '@my-app/types';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Швидкий зріз даних за поточну добу для головного дашборду веню.
     * Межі доби рахуємо в UTC (як у AnalyticsService) для узгодженості агрегацій.
     */
    async getToday(tenantId: string): Promise<DashboardTodayResponse> {
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);

        const dateFilter: Prisma.DateTimeFilter = {
            gte: startOfDay,
            lte: endOfDay,
        };

        // 1. Виручка за день: замовлення зі статусом delivered (завершені).
        // Увага: у ТЗ згадано "completed", проте в enum OrderStatus немає такого
        // значення — термінальним успішним статусом є "delivered".
        const revenueAggregate = await this.prisma.order.aggregate({
            where: {
                tenantId,
                status: OrderStatus.delivered,
                createdAt: dateFilter,
            },
            _sum: { totalAmount: true },
        });
        const revenueToday = revenueAggregate._sum.totalAmount ? Number(revenueAggregate._sum.totalAmount) : 0;

        // 2. Активні замовлення: лише pending + preparing (без ready/delivered/cancelled)
        const activeOrders = await this.prisma.order.count({
            where: {
                tenantId,
                createdAt: dateFilter,
                status: { in: [OrderStatus.new, OrderStatus.preparing] },
            },
        });

        // 3. Бронювання на сьогодні
        const todayReservations = await this.prisma.reservation.count({
            where: {
                tenantId,
                reservedAt: dateFilter,
            },
        });

        // 4. Топ-страва: MenuItem з найбільшою кількістю у OrderItem за сьогодні
        const topItems = await this.prisma.orderItem.groupBy({
            by: ['menuItemId'],
            where: {
                order: {
                    tenantId,
                    createdAt: dateFilter,
                },
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 1,
        });

        let topDish: DashboardTodayResponse['topDish'] = null;
        if (topItems.length > 0) {
            const top = topItems[0];
            const menuItem = await this.prisma.menuItem.findUnique({
                where: { id: top.menuItemId },
                select: { name: true },
            });
            topDish = {
                name: menuItem?.name ?? 'Unknown item',
                sold: Number(top._sum.quantity ?? 0),
            };
        }

        return {
            revenueToday,
            activeOrders,
            todayReservations,
            topDish,
        };
    }
}
