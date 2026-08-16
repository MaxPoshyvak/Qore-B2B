'use client';

import { useQuery } from '@tanstack/react-query';

import { PublicTenantService } from '../api/public-tenant.service';

export const useGetPublicTenant = (slug: string) => {
    return useQuery({
        queryKey: ['tenants', 'public', slug],
        queryFn: () => PublicTenantService.getBySlug(slug),
        enabled: !!slug,
    });
};
