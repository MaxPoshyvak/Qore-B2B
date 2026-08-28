import { z } from 'zod';

/* ------------------------------------------------------------------ */
/*  Analytics query DTOs                                               */
/* ------------------------------------------------------------------ */

// Допоміжна функція: перевіряє, що рядок є валідною датою (ISO або YYYY-MM-DD)
const isValidDateString = (value: string): boolean => !Number.isNaN(Date.parse(value));

// Схема фільтрації аналітики за періодом (опціональні дати у ISO-форматі)
export const analyticsQuerySchema = z.object({
    startDate: z
        .string()
        .refine(isValidDateString, 'startDate must be a valid date string')
        .optional(),
    endDate: z
        .string()
        .refine(isValidDateString, 'endDate must be a valid date string')
        .optional(),
});

export type AnalyticsQueryDto = z.infer<typeof analyticsQuerySchema>;

/* ------------------------------------------------------------------ */
/*  Analytics response contracts                                       */
/* ------------------------------------------------------------------ */

// Загальні показники (виручка, кількість замовлень, середній чек, перегляди меню)
export const overviewMetricsResponseSchema = z.object({
    totalRevenue: z.number(),
    totalOrders: z.number(),
    averageOrderValue: z.number(),
    menuViews: z.number(),
    // Щоденна розбивка виручки та замовлень (останні 7 днів або вибраний діапазон)
    timeline: z.array(
        z.object({
            date: z.string(),
            revenue: z.number(),
            orders: z.number(),
        }),
    ),
});

export type OverviewMetricsResponse = z.infer<typeof overviewMetricsResponseSchema>;

// Топ-позиції меню за кількістю продажів + позиції без продажів (dead stock)
export const salesPerformanceResponseSchema = z.object({
    topItems: z.array(
        z.object({
            name: z.string(),
            quantity: z.number(),
            revenue: z.number(),
        }),
    ),
    deadStock: z.array(
        z.object({
            name: z.string(),
            price: z.number(),
        }),
    ),
});

export type SalesPerformanceResponse = z.infer<typeof salesPerformanceResponseSchema>;

// Розподіл замовлень: з собою (takeaway) проти на місці (dine-in),
// а також конверсія меню -> замовлення та статистика бронювань.
export const trafficMetricsResponseSchema = z.object({
    takeawayCount: z.number(),
    dineInCount: z.number(),
    totalViews: z.number(),
    totalOrders: z.number(),
    completedReservations: z.number(),
    cancelledReservations: z.number(),
});

export type TrafficMetricsResponse = z.infer<typeof trafficMetricsResponseSchema>;
