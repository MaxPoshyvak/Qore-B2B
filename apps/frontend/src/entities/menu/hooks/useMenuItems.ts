'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateMenuItemDTO, UpdateMenuItemDTO } from '@my-app/types';

import { MenuItemService } from '../api/menu-item.service';
import { menuKeys } from './menu.keys';

/**
 * Item mutations invalidate the *category* list because the API returns items
 * nested inside their category — there is no standalone menu item query.
 */
export const useCreateMenuItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateMenuItemDTO) => MenuItemService.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuKeys.categories() });
        },
    });
};

export const useUpdateMenuItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateMenuItemDTO }) => MenuItemService.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuKeys.categories() });
        },
    });
};

export const useDeleteMenuItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => MenuItemService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuKeys.categories() });
        },
    });
};
