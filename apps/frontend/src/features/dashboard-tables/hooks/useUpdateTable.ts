'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type UpdateTableDto } from '@my-app/types';
import { TablesApi } from '../api/tables.api';
import { toast } from '../components/Toaster';

export const useUpdateTable = (slug: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tableId, dto }: { tableId: string; dto: UpdateTableDto }) =>
            TablesApi.update(slug, tableId, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables', slug] });
            toast.success('Table updated');
        },
        onError: (error) => {
            toast.error(getDuplicateMessage(error));
        },
    });
};

function getDuplicateMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : 'Failed to update table';
    if (/already exists/i.test(message)) {
        return 'A table with this name already exists';
    }
    return message;
}
