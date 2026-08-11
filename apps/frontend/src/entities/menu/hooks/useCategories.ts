'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateCategoryDTO, UpdateCategoryDTO } from '@my-app/types';

import { CategoryService } from '../api/category.service';
import { menuKeys } from './menu.keys';

export const useGetCategories = (tenantId: string) => {
    return useQuery({
        queryKey: menuKeys.categoriesByTenant(tenantId),
        queryFn: () => CategoryService.getByTenant(tenantId),
        enabled: !!tenantId,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateCategoryDTO) => CategoryService.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuKeys.categories() });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDTO }) => CategoryService.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuKeys.categories() });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => CategoryService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuKeys.categories() });
        },
    });
};
