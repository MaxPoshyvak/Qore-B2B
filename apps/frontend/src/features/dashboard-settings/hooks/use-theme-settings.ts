'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ThemeConfig, UpdateTenantThemeDto, GenerateThemeInput } from '@my-app/types';
import { DEFAULT_THEME_CONFIG } from '@my-app/types';
import { ThemeApi } from '../api/theme.api';

export function useThemeSettings(slug: string, initialConfig?: ThemeConfig | null) {
    const queryClient = useQueryClient();

    const themeQuery = useQuery({
        queryKey: ['tenant-theme', slug],
        queryFn: () => ThemeApi.get(slug),
        initialData: initialConfig ?? DEFAULT_THEME_CONFIG,
        staleTime: 1000 * 60 * 5,
    });

    const updateThemeMutation = useMutation({
        mutationFn: (dto: UpdateTenantThemeDto) => ThemeApi.update(slug, dto),
        onSuccess: (res) => {
            queryClient.setQueryData(['tenant-theme', slug], res.themeConfig);
            void queryClient.invalidateQueries({ queryKey: ['tenants', 'public', slug] });
            void queryClient.invalidateQueries({ queryKey: ['menu', 'public', slug] });
            void queryClient.invalidateQueries({ queryKey: ['tenants', slug] });
            void queryClient.invalidateQueries({ queryKey: ['tenant-by-slug', slug] });
            void queryClient.invalidateQueries({ queryKey: ['tenant-theme', slug] });
        },
    });

    const generateThemeMutation = useMutation({
        mutationFn: (dto: GenerateThemeInput) => ThemeApi.generate(dto),
    });

    return {
        theme: themeQuery.data ?? initialConfig ?? DEFAULT_THEME_CONFIG,
        isLoading: themeQuery.isLoading,
        updateTheme: updateThemeMutation.mutateAsync,
        isUpdating: updateThemeMutation.isPending,
        generateTheme: generateThemeMutation.mutateAsync,
        isGenerating: generateThemeMutation.isPending,
    };
}
