import { z } from 'zod';

export const platformTrackHitSchema = z.object({
    path: z.string().min(1),
    visitorId: z.string().min(1),
    referrer: z.string().optional().nullable(),
    userAgent: z.string().optional().nullable(),
});

export type PlatformTrackHitInput = z.infer<typeof platformTrackHitSchema>;

export const platformLoginSchema = z.object({
    password: z.string().min(1, 'Password is required'),
});

export type PlatformLoginInput = z.infer<typeof platformLoginSchema>;

export interface PlatformTrafficSummary {
    totalPageviews: number;
    uniqueVisitors: number;
    todayPageviews: number;
    todayUniqueVisitors: number;
    activeVisitorsLast15m: number;
    topRoutes: Array<{
        path: string;
        pageviews: number;
        uniqueVisitors: number;
    }>;
    recentHits: Array<{
        id: string;
        path: string;
        visitorId: string;
        referrer: string | null;
        createdAt: string;
    }>;
}

export interface PlatformSubscriptionsSummary {
    mrr: number;
    totalRevenue: number;
    activeSubscribersCount: number;
    plansBreakdown: {
        free: number;
        pro: number;
        business: number;
    };
    paidTenants: Array<{
        id: string;
        name: string;
        slug: string;
        plan: 'free' | 'pro' | 'business';
        status: string | null;
        expiresAt: string | null;
        stripeSubscriptionId: string | null;
        owner: {
            id: string;
            name: string | null;
            email: string;
        };
        createdAt: string;
    }>;
}

export interface PlatformUsersSummary {
    totalUsers: number;
    newUsersLast7Days: number;
    totalTenants: number;
    recentUsers: Array<{
        id: string;
        email: string;
        name: string | null;
        createdAt: string;
        isEmailVerified: boolean;
        tenants: Array<{
            id: string;
            name: string;
            slug: string;
            subscriptionPlan: string;
        }>;
    }>;
}

export interface PlatformLeaderboard {
    topByMenuViews: Array<{
        id: string;
        name: string;
        slug: string;
        plan: string;
        viewsCount: number;
        ownerEmail: string;
    }>;
    topByOrders: Array<{
        id: string;
        name: string;
        slug: string;
        plan: string;
        ordersCount: number;
        totalSales: number;
        ownerEmail: string;
    }>;
}

export interface PlatformStatsResponse {
    traffic: PlatformTrafficSummary;
    subscriptions: PlatformSubscriptionsSummary;
    users: PlatformUsersSummary;
    leaderboard: PlatformLeaderboard;
    system: {
        dbConnected: boolean;
        nodeVersion: string;
        uptimeSeconds: number;
        serverTime: string;
    };
}

export const fastVenueItemSchema = z.object({
    name: z.string().min(1, 'Item name is required'),
    description: z.string().optional().nullable(),
    price: z.number().positive('Price must be greater than 0'),
    imageUrl: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
    allergens: z.array(z.string()).optional().default([]),
});

export const fastVenueCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    icon: z.string().optional().nullable(),
    items: z.array(fastVenueItemSchema).min(1, 'Category must have at least one item'),
});

export const fastVenueInputSchema = z.object({
    venue: z.object({
        name: z.string().min(1, 'Venue name is required'),
        slug: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        currency: z.string().optional().default('USD'),
        phone: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        instagramUrl: z.string().optional().nullable(),
        wifiSsid: z.string().optional().nullable(),
        wifiPassword: z.string().optional().nullable(),
        tablesCount: z.number().int().positive().optional().default(6),
        themePreset: z
            .enum([
                'modern-minimal',
                'tuscan-osteria',
                'monarch-luxury',
                'tokyo-cyber',
                'botanical-garden',
            ])
            .optional()
            .default('modern-minimal'),
        workingHours: z
            .record(
                z.string(),
                z.object({
                    isOpen: z.boolean(),
                    open: z.string(),
                    close: z.string(),
                }),
            )
            .optional()
            .default({}),
    }),
    categories: z.array(fastVenueCategorySchema).min(1, 'At least one menu category is required'),
});

export type FastVenueInput = z.infer<typeof fastVenueInputSchema>;

export interface FastVenueResultDTO {
    tenantId: string;
    venueName: string;
    slug: string;
    publicMenuUrl: string;
    venueLandingUrl: string;
    dashboardUrl: string;
    categoriesCreated: number;
    itemsCreated: number;
    tablesCreated: number;
    credentials: {
        email: string;
        password: string;
    };
}
