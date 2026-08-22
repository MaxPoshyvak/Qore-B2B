'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TablesApi } from '../api/tables.api';
import { toast } from '../components/Toaster';

export const useDeleteTable = (slug: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tableId: string) => TablesApi.delete(slug, tableId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables', slug] });
            toast.success('Table deleted');
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to delete table');
        },
    });
};
