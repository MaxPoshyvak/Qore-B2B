import { apiClient } from '@/lib/api-client';
import type { HappyHourRuleResponse } from '@my-app/types';

const PUBLIC_HAPPY_HOUR_URL = '/public/happy-hour';

/**
 * Public Happy Hour API — використовується гостьовим меню.
 *
 * Контролер повертає `SuccessResponse<HappyHourRuleResponse[]>`, тому ми
 * викликаємо `apiClient` з дефолтною поведінкою і розгортаємо `data`.
 */
export class PublicHappyHourApi {
    /** GET /api/public/happy-hour/:slug — усі активні правила веню. */
    static async getActiveRules(slug: string): Promise<HappyHourRuleResponse[]> {
        const res = await apiClient<HappyHourRuleResponse[]>(`${PUBLIC_HAPPY_HOUR_URL}/${slug}`, {
            method: 'GET',
        });
        return res.data;
    }
}
