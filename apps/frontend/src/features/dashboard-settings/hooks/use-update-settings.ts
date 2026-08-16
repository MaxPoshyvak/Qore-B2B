'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage, type UpdateTenantSettingsDto } from '@my-app/types';
import { SettingsApi } from '../api/settings.api';
import { toast } from '../components/Toaster';

export const useUpdateTenantSettings = (slug: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateTenantSettingsDto) => SettingsApi.update(slug, data),
        onSuccess: () => {
            // Refresh the tenant everywhere it is cached (sidebar, this page, …).
            queryClient.invalidateQueries({ queryKey: ['tenant', slug] });
            queryClient.invalidateQueries({ queryKey: ['tenants', 'details', slug] });
            toast.success('Venue settings updated');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
};
