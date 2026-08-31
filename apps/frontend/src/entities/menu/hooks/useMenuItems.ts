'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateMenuItemDTO, MenuCategoryWithItemsResponse, UpdateMenuItemDTO } from '@my-app/types';

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

/**
 * "86 list" тумблер доступності страви. Оптимістично інвертує `isActive`
 * просто в кеші категорій (позиції вкладені у категорії), тож картка
 * перемальовується миттєво без мерехтіння. Після успіху синхронізуємо
 * точне значення з сервера, а за помилки — відкочуємо.
 */
export const useToggleMenuItem = () => {
    const queryClient = useQueryClient();

    const flipInCache = (id: string, isActive: boolean) =>
        queryClient.setQueriesData<MenuCategoryWithItemsResponse[]>(
            { queryKey: menuKeys.categories() },
            (old) =>
                old
                    ? old.map((category) => ({
                          ...category,
                          items: category.items.map((item) =>
                              item.id === id ? { ...item, isActive } : item,
                          ),
                      }))
                    : old,
        );

    return useMutation({
        mutationFn: (id: string) => MenuItemService.toggle(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: menuKeys.categories() });

            const previous = queryClient.getQueriesData<MenuCategoryWithItemsResponse[]>({
                queryKey: menuKeys.categories(),
            });

            // Оптимістично інвертуємо поточне значення.
            queryClient.setQueriesData<MenuCategoryWithItemsResponse[]>(
                { queryKey: menuKeys.categories() },
                (old) =>
                    old
                        ? old.map((category) => ({
                              ...category,
                              items: category.items.map((item) =>
                                  item.id === id ? { ...item, isActive: !item.isActive } : item,
                              ),
                          }))
                        : old,
            );

            return { previous };
        },
        onError: (_err, _id, context) => {
            context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
        },
        onSuccess: (data) => {
            flipInCache(data.id, data.isActive);
        },
    });
};
