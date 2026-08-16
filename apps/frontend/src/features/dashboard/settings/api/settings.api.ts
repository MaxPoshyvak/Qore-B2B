import { apiClient } from '@/lib/api-client';
import { type UpdateTenantSettingsDto } from '@my-app/types';
import { type Tenant } from '@my-app/database';

const SETTINGS_URL = '/tenants';

/** PATCH /tenants/:slug/settings — updates the venue and its settings row. */
export class SettingsApi {
    static async update(slug: string, data: UpdateTenantSettingsDto): Promise<Tenant> {
        const res = await apiClient<Tenant>(`${SETTINGS_URL}/${slug}/settings`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return res.data;
    }
}
