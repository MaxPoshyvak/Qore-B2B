import { apiClient } from '@/lib/api-client';
import type {
    OverviewMetricsResponse,
    SalesPerformanceResponse,
    TrafficMetricsResponse,
} from '@my-app/types';

export interface AnalyticsDateRange {
    startDate?: string;
    endDate?: string;
}

function buildQueryString(range?: AnalyticsDateRange): string {
    if (!range?.startDate && !range?.endDate) return '';
    const params = new URLSearchParams();
    if (range.startDate) params.set('startDate', range.startDate);
    if (range.endDate) params.set('endDate', range.endDate);
    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
}

export class AnalyticsApi {
    /** GET /analytics/:tenantId/overview — aggregated revenue, orders, AOV and menu views. */
    static async getOverview(tenantId: string, range?: AnalyticsDateRange): Promise<OverviewMetricsResponse> {
        const res = await apiClient<OverviewMetricsResponse>(
            `/analytics/${tenantId}/overview${buildQueryString(range)}`,
        );
        return res.data;
    }

    /** GET /analytics/:tenantId/sales — top performing menu items by quantity sold. */
    static async getSales(tenantId: string, range?: AnalyticsDateRange): Promise<SalesPerformanceResponse> {
        const res = await apiClient<SalesPerformanceResponse>(
            `/analytics/${tenantId}/sales${buildQueryString(range)}`,
        );
        return res.data;
    }

    /** GET /analytics/:tenantId/traffic — takeaway vs dine-in order split. */
    static async getTraffic(tenantId: string, range?: AnalyticsDateRange): Promise<TrafficMetricsResponse> {
        const res = await apiClient<TrafficMetricsResponse>(
            `/analytics/${tenantId}/traffic${buildQueryString(range)}`,
        );
        return res.data;
    }

    /**
     * POST /analytics/public/:slug/track-view — registers a public QR-menu view.
     * Fire-and-forget from the public menu; failures must not break the UX.
     */
    static async trackMenuView(slug: string, tableId?: string): Promise<void> {
        await apiClient(`/analytics/public/${slug}/track-view`, {
            method: 'POST',
            body: JSON.stringify(tableId ? { tableId } : {}),
        });
    }

    /** Downloads full orders & revenue history as an Excel-compatible UTF-8 CSV. */
    static async downloadOrdersCsv(tenantId: string, range?: AnalyticsDateRange): Promise<void> {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        const token = session?.accessToken as string | undefined;
        const query = buildQueryString(range);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiUrl}/analytics/${tenantId}/export/orders${query}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error(`Failed to export orders CSV (${res.status})`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `qore-orders-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /** Downloads item sales performance breakdown as an Excel-compatible UTF-8 CSV. */
    static async downloadSalesCsv(tenantId: string, range?: AnalyticsDateRange): Promise<void> {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        const token = session?.accessToken as string | undefined;
        const query = buildQueryString(range);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiUrl}/analytics/${tenantId}/export/sales${query}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error(`Failed to export sales CSV (${res.status})`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `qore-sales-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
