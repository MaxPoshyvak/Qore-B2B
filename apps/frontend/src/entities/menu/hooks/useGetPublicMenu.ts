'use client';

import { useQuery } from '@tanstack/react-query';

import type { PublicMenuResponseDTO } from '@my-app/types';
import { PublicMenuService } from '../api/public-menu.service';

export const useGetPublicMenu = (slug: string, initialData?: PublicMenuResponseDTO | null) => {
    return useQuery({
        queryKey: ['menu', 'public', slug],
        queryFn: () => PublicMenuService.getBySlug(slug),
        enabled: !!slug,
        initialData: initialData ?? undefined,
        staleTime: 30_000,
    });
};
