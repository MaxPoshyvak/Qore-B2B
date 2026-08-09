'use client';

import { TenantService } from '@/features/onboarding/api/tenants.service';
import { CreateTenantDTO } from '@my-app/types/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateTenant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateTenantDTO) => TenantService.createTenant(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
        },
    });
};
