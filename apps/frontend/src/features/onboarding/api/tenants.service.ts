import { apiClient } from '@/lib/api-client';
import { CreateTenantDTO, SuccessResponse } from '@my-app/types';
import { Tenant } from '@my-app/database';

export class TenantService {
    static async createTenant(dto: CreateTenantDTO): Promise<SuccessResponse<Tenant>> {
        return apiClient<Tenant>('/tenants', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
    }
}
