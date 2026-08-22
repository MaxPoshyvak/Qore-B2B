'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type CreateTableDto } from '@my-app/types';
import { TablesApi } from '../api/tables.api';
import { toast } from '../components/Toaster';

export const useCreateTable = (slug: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateTableDto) => TablesApi.create(slug, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables', slug] });
            toast.success('Table created');
        },
        onError: (error) => {
            toast.error(getDuplicateMessage(error));
        },
    });
};

/** Normalises a backend 409 (duplicate name) into a friendly message. */
function getDuplicateMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : 'Failed to create table';
    if (/already exists/i.test(message)) {
        return 'A table with this name already exists';
    }
    return message;
}
