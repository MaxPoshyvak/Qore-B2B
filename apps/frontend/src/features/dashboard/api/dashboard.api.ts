import { apiClient } from '@/lib/api-client';
import type { DashboardTodayResponse } from '@my-app/types';

const DASHBOARD_URL = '/dashboard';

/** GET /dashboard/:tenantId/today — легкий зріз даних за день для дашборду. */
export class DashboardApi {
    static async getToday(tenantId: string): Promise<DashboardTodayResponse> {
        const res = await apiClient<DashboardTodayResponse>(`${DASHBOARD_URL}/${tenantId}/today`);
        return res.data;
    }
}
