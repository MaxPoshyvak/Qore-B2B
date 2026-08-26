import { apiClient } from '@/lib/api-client';
import { type KdsAuthResponse } from '@my-app/types';

const TENANTS_URL = '/tenants';

/** POST /tenants/:id/kds-auth — generate a fresh KDS token + PIN (owner, JWT). */
export class KdsApi {
    static async generate(tenantId: string): Promise<KdsAuthResponse> {
        const res = await apiClient<KdsAuthResponse>(`${TENANTS_URL}/${tenantId}/kds-auth`, {
            method: 'POST',
        });
        return res.data;
    }

    /** DELETE /tenants/:id/kds-auth — revoke KDS access (owner, JWT). */
    static async revoke(tenantId: string): Promise<KdsAuthResponse> {
        const res = await apiClient<KdsAuthResponse>(`${TENANTS_URL}/${tenantId}/kds-auth`, {
            method: 'DELETE',
        });
        return res.data;
    }
}
