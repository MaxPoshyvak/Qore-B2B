import { apiClient } from '@/lib/api-client';
import { SuccessResponse, type PublicTenantResponse } from '@my-app/types';
import { Tenant } from '@my-app/database';

export class TenantService {
    static async getMyTenants(): Promise<SuccessResponse<Tenant[]>> {
        return apiClient<Tenant[]>('/tenants/my', {
            method: 'GET',
        });
    }

    static async getTenantBySlug(slug: string): Promise<SuccessResponse<PublicTenantResponse>> {
        return apiClient<PublicTenantResponse>(`/tenants/by-slug/${slug}`, {
            method: 'GET',
        });
    }
}

