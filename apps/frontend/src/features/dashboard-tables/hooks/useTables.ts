'use client';

import { useQuery } from '@tanstack/react-query';

import { TablesApi } from '../api/tables.api';

export const useTables = (slug: string) => {
    return useQuery({
        queryKey: ['tables', slug],
        queryFn: () => TablesApi.getBySlug(slug),
        enabled: !!slug,
    });
};
