import { apiClient } from '@/lib/api-client';
import type { CreateMenuItemDTO, MenuItemResponse, UpdateMenuItemDTO } from '@my-app/types';

const ITEMS_URL = '/menu/items';

/**
 * Menu item data access.
 *
 * Items are always read through `CategoryService.getByTenant` (the API nests
 * them inside their category), so only write operations live here.
 * The controllers return the global `SuccessResponse<T>` envelope, so we
 * resolve it via `apiClient` (default behaviour) and unwrap `data` here.
 */
export class MenuItemService {
    static async create(dto: CreateMenuItemDTO): Promise<MenuItemResponse> {
        const res = await apiClient<MenuItemResponse>(ITEMS_URL, {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async update(id: string, dto: UpdateMenuItemDTO): Promise<MenuItemResponse> {
        const res = await apiClient<MenuItemResponse>(`${ITEMS_URL}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async remove(id: string): Promise<MenuItemResponse> {
        const res = await apiClient<MenuItemResponse>(`${ITEMS_URL}/${id}`, { method: 'DELETE' });
        return res.data;
    }

    /** "86 list" тумблер: інвертує `isActive` страви на боці менеджера меню. */
    static async toggle(id: string): Promise<MenuItemResponse> {
        const res = await apiClient<MenuItemResponse>(`${ITEMS_URL}/${id}/toggle`, { method: 'PATCH' });
        return res.data;
    }
}
