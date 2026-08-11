'use client';

import { useQuery } from '@tanstack/react-query';

import { PublicMenuService } from '../api/public-menu.service';

export const useGetPublicMenu = (slug: string) => {
    return useQuery({
        queryKey: ['menu', 'public', slug],
        queryFn: () => PublicMenuService.getBySlug(slug),
        enabled: !!slug,
    });
};
