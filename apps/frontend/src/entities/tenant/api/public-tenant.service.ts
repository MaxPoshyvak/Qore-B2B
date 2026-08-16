import { apiClient } from '@/lib/api-client';
import type { PublicTenantResponse, SuccessResponse } from '@my-app/types';

const PUBLIC_TENANT_URL = '/tenants/public';

/** Reads a venue's public profile by slug. Unauthenticated (no JWT required). */
export class PublicTenantService {
    static async getBySlug(slug: string): Promise<PublicTenantResponse> {
        const res = await apiClient<PublicTenantResponse>(
            `${PUBLIC_TENANT_URL}/${slug}`,
            { method: 'GET' },
            // The tenants module wraps results in the `SuccessResponse` envelope.
            true,
        );
        return res.data;
    }
}
