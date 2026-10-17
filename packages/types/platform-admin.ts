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
