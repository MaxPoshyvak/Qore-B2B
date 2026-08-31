import { apiClient } from '@/lib/api-client';
import type {
    CreateHappyHourDto,
    HappyHourRuleResponse,
    UpdateHappyHourDto,
} from '@my-app/types';

const HAPPY_HOUR_URL = '/happy-hour';

/** Happy Hour API — усі відповіді "розгортаються" з `SuccessResponse<T>`. */
export class HappyHourApi {
    /** GET /api/happy-hour/:tenantId — усі правила веню для дашборду. */
    static async getRules(tenantId: string): Promise<HappyHourRuleResponse[]> {
        const res = await apiClient<HappyHourRuleResponse[]>(`${HAPPY_HOUR_URL}/${tenantId}`);
        return res.data;
    }

    /** POST /api/happy-hour/:tenantId — створення нового правила. */
    static async createRule(tenantId: string, data: CreateHappyHourDto): Promise<HappyHourRuleResponse> {
        const res = await apiClient<HappyHourRuleResponse>(`${HAPPY_HOUR_URL}/${tenantId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return res.data;
    }

    /** PATCH /api/happy-hour/:tenantId/:id — оновлення правила. */
    static async updateRule(
        tenantId: string,
        id: string,
        data: UpdateHappyHourDto,
    ): Promise<HappyHourRuleResponse> {
        const res = await apiClient<HappyHourRuleResponse>(`${HAPPY_HOUR_URL}/${tenantId}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return res.data;
    }

    /** DELETE /api/happy-hour/:tenantId/:id — видалення правила. */
    static async deleteRule(tenantId: string, id: string): Promise<{ id: string }> {
        const res = await apiClient<{ id: string }>(`${HAPPY_HOUR_URL}/${tenantId}/${id}`, {
            method: 'DELETE',
        });
        return res.data;
    }
}
