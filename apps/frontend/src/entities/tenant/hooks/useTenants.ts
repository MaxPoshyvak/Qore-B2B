'use client';

import { useQuery } from '@tanstack/react-query';
import { TenantService } from '../api/tenant.service';

export const useGetMyTenants = () => {
    return useQuery({
        queryKey: ['tenants', 'list'],
        queryFn: () => TenantService.getMyTenants(),
    });
};

export const useGetTenantBySlug = (
    slug: string,
    options?: { refetchInterval?: number | false; enabled?: boolean },
) => {
    return useQuery({
        queryKey: ['tenants', 'details', slug],
        queryFn: () => TenantService.getTenantBySlug(slug),
        enabled: options?.enabled !== undefined ? options.enabled : !!slug,
        refetchInterval: options?.refetchInterval,
    });
};
