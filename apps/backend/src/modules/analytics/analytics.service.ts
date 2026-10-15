import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@my-app/database';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { OverviewMetricsResponse, SalesPerformanceResponse, TrafficMetricsResponse } from '@my-app/types';

// Статуси замовлень, що вважаються "завершеними" (реалізована виручка).
// У поточній схемі немає статусу 'completed' — завершеним вважаємо
// 'ready' (готове до видачі) та 'delivered' (видане гостю).
const COMPLETED_ORDER_STATUSES = [OrderStatus.ready, OrderStatus.delivered] as const;

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Формує Prisma-умову для замовлень конкретного tenant із опціональним
     * обмеженням по датах. Усі агрегації базуються на цій умові.
     */
    private buildOrderWhere(tenantId: string, startDate?: string, endDate?: string): Prisma.OrderWhereInput {
        const dateFilter: Prisma.DateTimeFilter = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        return {
            tenantId,
            status: { in: [...COMPLETED_ORDER_STATUSES] },
            ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        };
    }

    /**
     * Формує Prisma-фільтр діапазону дат для полів на кшталт `viewedAt`/`createdAt`.
     * Повертає порожній об'єкт, якщо діапазон не задано.
     */
    private buildDateFilter(startDate?: string, endDate?: string): Prisma.DateTimeFilter {
        const filter: Prisma.DateTimeFilter = {};
        if (startDate) filter.gte = new Date(startDate);
        if (endDate) filter.lte = new Date(endDate);
        return filter;
    }

    // Перетворює дату у ключ YYYY-MM-DD для групування по днях
    private toDateKey(date: Date): string {
        return date.toISOString().slice(0, 10);
    }

    /**
     * Реєструє перегляд QR-меню публічним гостем.
     * Знаходимо tenant за slug, створюємо запис MenuView.
     */
    async trackMenuView(slug: string, tableId?: string, userAgent?: string): Promise<{ id: string }> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        const view = await this.prisma.menuView.create({
            data: {
                tenantId: tenant.id,
                tableId: tableId ?? null,
                userAgent: userAgent ?? null,
            },
            select: { id: true },
        });

        return view;
    }

    /**
     * Загальні показники дашборду: виручка, кількість замовлень,
     * середній чек та кількість переглядів меню.
     * Усі суми рахуються на рівні БД через prisma.order.aggregate.
     */
    async getOverviewMetrics(tenantId: string, startDate?: string, endDate?: string): Promise<OverviewMetricsResponse> {
        const orderWhere = this.buildOrderWhere(tenantId, startDate, endDate);

        // 1. Формуємо дати ЖОРСТКО в UTC, щоб уникнути зсувів часових поясів
        const end = endDate ? new Date(endDate) : new Date();
        if (!endDate) {
            end.setUTCHours(23, 59, 59, 999); // Захоплюємо весь сьогоднішній день
        }

        const start = startDate
            ? new Date(startDate)
            : (() => {
                  const d = new Date(end);
                  d.setUTCHours(0, 0, 0, 0); // Початок доби в UTC
                  d.setUTCDate(d.getUTCDate() - 6); // Рівно 7 днів включно із сьогодні
                  return d;
              })();

        const [orderAggregate, menuViews, timelineOrders] = await Promise.all([
            this.prisma.order.aggregate({
                where: orderWhere,
                _sum: { totalAmount: true },
                _count: { id: true },
            }),
            this.prisma.menuView.count({
                where: {
                    tenantId,
                    ...(startDate || endDate ? { viewedAt: this.buildDateFilter(startDate, endDate) } : {}),
                },
            }),
            this.prisma.order.findMany({
                where: {
                    tenantId,
                    status: { in: [...COMPLETED_ORDER_STATUSES] },
                    createdAt: { gte: start, lte: end },
                },
                select: { createdAt: true, totalAmount: true },
            }),
        ]);

        const totalRevenue = orderAggregate._sum.totalAmount ? Number(orderAggregate._sum.totalAmount) : 0;
        const totalOrders = orderAggregate._count.id;
        const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

        // 2. Власна функція для формату YYYY-MM-DD суто в UTC (замінює this.toDateKey)
        const toDateString = (date: Date) => date.toISOString().split('T')[0];

        // 3. Генеруємо ключі для графіка (dayKeys)
        const dayKeys: string[] = [];
        const cursor = new Date(start);
        while (cursor <= end) {
            dayKeys.push(toDateString(cursor));
            cursor.setUTCDate(cursor.getUTCDate() + 1); // Використовуємо UTC дату
        }

        // 4. Ініціалізуємо кошики нулями
        const buckets = new Map<string, { revenue: number; orders: number }>();
        for (const key of dayKeys) {
            buckets.set(key, { revenue: 0, orders: 0 });
        }

        // 5. Розподіляємо реальні замовлення
        for (const order of timelineOrders) {
            const key = toDateString(order.createdAt); // Дата з Prisma вже в UTC
            const bucket = buckets.get(key);

            // Перевіряємо, чи попадає замовлення в наш згенерований день
            if (bucket) {
                bucket.revenue += Number(order.totalAmount);
                bucket.orders += 1;
            }
        }

        const timeline = dayKeys.map((key) => ({
            date: key,
            revenue: Number((buckets.get(key)?.revenue ?? 0).toFixed(2)),
            orders: buckets.get(key)?.orders ?? 0,
        }));

        return {
            totalRevenue: Number(totalRevenue.toFixed(2)),
            totalOrders,
            averageOrderValue,
            menuViews,
            timeline,
        };
    }

    /**
     * Топ-5 позицій меню за кількістю продажів.
     * Групування відбувається на рівні БД (prisma.orderItem.groupBy),
     * назви позицій та точна виручка добираються для відібраних топ-5.
     */
    async getSalesPerformance(
        tenantId: string,
        startDate?: string,
        endDate?: string,
    ): Promise<SalesPerformanceResponse> {
        const orderWhere = this.buildOrderWhere(tenantId, startDate, endDate);

        // Групуємо позиції на рівні БД за menuItemId, ранжуємо за кількістю
        const grouped = await this.prisma.orderItem.groupBy({
            by: ['menuItemId'],
            where: { order: orderWhere },
            _sum: { quantity: true },
        });

        const topGroups = grouped
            .sort((a, b) => Number(b._sum.quantity ?? 0) - Number(a._sum.quantity ?? 0))
            .slice(0, 5);

        if (topGroups.length === 0) {
            // Навіть без продажів повертаємо повний список позицій як dead stock
            const allItems = await this.prisma.menuItem.findMany({
                where: { tenantId },
                select: { id: true, name: true, price: true },
            });
            const deadStock = allItems.map((item) => ({
                name: item.name,
                price: Number(item.price),
            }));
            return { topItems: [], deadStock };
        }

        const topItemIds = topGroups.map((g) => g.menuItemId);

        // Точна виручка по кожній позиції: Σ(quantity * priceAtOrder)
        const orderItems = await this.prisma.orderItem.findMany({
            where: { menuItemId: { in: topItemIds }, order: orderWhere },
            select: { menuItemId: true, quantity: true, priceAtOrder: true },
        });

        const revenueByItem = new Map<string, number>();
        for (const item of orderItems) {
            const revenue =
                (revenueByItem.get(item.menuItemId) ?? 0) + Number(item.quantity) * Number(item.priceAtOrder);
            revenueByItem.set(item.menuItemId, revenue);
        }

        const menuItems = await this.prisma.menuItem.findMany({
            where: { id: { in: topItemIds } },
            select: { id: true, name: true },
        });
        const nameById = new Map(menuItems.map((m) => [m.id, m.name]));

        const topItems = topGroups.map((g) => ({
            name: nameById.get(g.menuItemId) ?? 'Unknown item',
            quantity: Number(g._sum.quantity ?? 0),
            revenue: Number((revenueByItem.get(g.menuItemId) ?? 0).toFixed(2)),
        }));

        // Dead Stock: усі позиції меню, що не потрапили в продажі за вибраний період
        const allItems = await this.prisma.menuItem.findMany({
            where: { tenantId },
            select: { id: true, name: true, price: true },
        });
        const soldIds = new Set(topGroups.map((g) => g.menuItemId));
        const deadStock = allItems
            .filter((item) => !soldIds.has(item.id))
            .map((item) => ({ name: item.name, price: Number(item.price) }));

        return { topItems, deadStock };
    }

    /**
     * Розподіл замовлень за типом: "з собою" (isOrderAhead = true)
     * проти "на місці" (isOrderAhead = false). Підрахунок на рівні БД.
     */
    async getTrafficMetrics(tenantId: string, startDate?: string, endDate?: string): Promise<TrafficMetricsResponse> {
        const orderWhere = this.buildOrderWhere(tenantId, startDate, endDate);
        const dateFilter = this.buildDateFilter(startDate, endDate);
        const viewWhere: Prisma.MenuViewWhereInput = {
            tenantId,
            ...(Object.keys(dateFilter).length ? { viewedAt: dateFilter } : {}),
        };
        const reservationWhere: Prisma.ReservationWhereInput = {
            tenantId,
            ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        };

        const [grouped, totalViews, totalOrders, reservations] = await Promise.all([
            this.prisma.order.groupBy({
                by: ['isOrderAhead'],
                where: orderWhere,
                _count: { _all: true },
            }),
            this.prisma.menuView.count({ where: viewWhere }),
            this.prisma.order.count({ where: orderWhere }),
            this.prisma.reservation.groupBy({
                by: ['status'],
                where: reservationWhere,
                _count: { _all: true },
            }),
        ]);

        let takeawayCount = 0;
        let dineInCount = 0;

        for (const row of grouped) {
            if (row.isOrderAhead) {
                takeawayCount += row._count._all;
            } else {
                dineInCount += row._count._all;
            }
        }

        // Бронювання: завершені проти скасованих
        let completedReservations = 0;
        let cancelledReservations = 0;
        for (const row of reservations) {
            if (row.status === 'completed') completedReservations += row._count._all;
            if (row.status === 'cancelled') cancelledReservations += row._count._all;
        }

        return {
            takeawayCount,
            dineInCount,
            totalViews,
            totalOrders,
            completedReservations,
            cancelledReservations,
        };
    }

    private escapeCsv(val: any): string {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    async exportOrdersToCsv(tenantId: string, startDate?: string, endDate?: string): Promise<string> {
        const dateFilter: Prisma.DateTimeFilter = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
            },
            include: {
                table: { select: { name: true } },
                items: {
                    include: {
                        menuItem: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const headers = [
            'Order ID',
            'Date & Time',
            'Type',
            'Table / Customer',
            'Items Summary',
            'Total Amount',
            'Paid Amount',
            'Payment Status',
            'Payment Method',
            'Order Status',
        ];

        const rows = orders.map((order) => {
            const shortId = `#${order.id.slice(-6).toUpperCase()}`;
            const dateStr = order.createdAt.toISOString().replace('T', ' ').slice(0, 19);
            const type = order.isOrderAhead ? 'Takeaway' : 'Dine-In';
            const location = order.isOrderAhead
                ? order.customerName
                    ? `${order.customerName} (Takeaway)`
                    : 'Takeaway'
                : order.table?.name
                  ? `Table ${order.table.name}`
                  : 'Unassigned';

            const itemsSummary = order.items
                .map((i) => `${i.menuItem?.name || 'Item'} (x${i.quantity})`)
                .join('; ');

            return [
                shortId,
                dateStr,
                type,
                location,
                itemsSummary,
                Number(order.totalAmount).toFixed(2),
                Number(order.paidAmount).toFixed(2),
                order.paymentStatus,
                order.paymentMethod || 'unspecified',
                order.status,
            ]
                .map((v) => this.escapeCsv(v))
                .join(',');
        });

        return [headers.join(','), ...rows].join('\r\n');
    }

    async exportSalesToCsv(tenantId: string, startDate?: string, endDate?: string): Promise<string> {
        const orderWhere = this.buildOrderWhere(tenantId, startDate, endDate);

        const orderItems = await this.prisma.orderItem.findMany({
            where: {
                order: orderWhere,
            },
            include: {
                menuItem: {
                    select: {
                        name: true,
                        category: { select: { name: true } },
                    },
                },
            },
        });

        const itemMap = new Map<string, { name: string; category: string; quantity: number; revenue: number }>();

        for (const item of orderItems) {
            const name = item.menuItem?.name ?? 'Unknown Item';
            const category = item.menuItem?.category?.name ?? 'Uncategorized';
            const price = Number(item.priceAtOrder);
            const lineRev = price * item.quantity;

            const existing = itemMap.get(name);
            if (existing) {
                existing.quantity += item.quantity;
                existing.revenue += lineRev;
            } else {
                itemMap.set(name, {
                    name,
                    category,
                    quantity: item.quantity,
                    revenue: lineRev,
                });
            }
        }

        const sorted = Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue);

        const headers = ['Item Name', 'Category', 'Quantity Sold', 'Total Revenue', 'Avg Unit Price'];
        const rows = sorted.map((row) => {
            const avgPrice = row.quantity > 0 ? (row.revenue / row.quantity).toFixed(2) : '0.00';
            return [
                row.name,
                row.category,
                row.quantity,
                row.revenue.toFixed(2),
                avgPrice,
            ]
                .map((v) => this.escapeCsv(v))
                .join(',');
        });

        return [headers.join(','), ...rows].join('\r\n');
    }
}
