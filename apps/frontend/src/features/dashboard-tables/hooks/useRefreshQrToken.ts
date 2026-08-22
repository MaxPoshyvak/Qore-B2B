'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TablesApi } from '../api/tables.api';
import { toast } from '../components/Toaster';

export const useRefreshQrToken = (slug: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tableId: string) => TablesApi.refreshQr(slug, tableId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables', slug] });
            toast.success('QR code regenerated');
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to regenerate QR code');
        },
    });
};
