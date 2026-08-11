import { apiClient } from '@/lib/api-client';
import type { CreateMenuItemDTO, MenuItemResponse, UpdateMenuItemDTO } from '@my-app/types';

const ITEMS_URL = '/menu/items';

/**
 * Menu item data access.
 *
 * Items are always read through `CategoryService.getByTenant` (the API nests
 * them inside their category), so only write operations live here.
 * As with categories, responses are unwrapped — hence `useBaseResType: false`.
 */
export class MenuItemService {
    static async create(dto: CreateMenuItemDTO): Promise<MenuItemResponse> {
        return apiClient<MenuItemResponse>(
            ITEMS_URL,
            { method: 'POST', body: JSON.stringify(dto) },
            false,
        );
    }

    static async update(id: string, dto: UpdateMenuItemDTO): Promise<MenuItemResponse> {
        return apiClient<MenuItemResponse>(
            `${ITEMS_URL}/${id}`,
            { method: 'PATCH', body: JSON.stringify(dto) },
            false,
        );
    }

    static async remove(id: string): Promise<MenuItemResponse> {
        return apiClient<MenuItemResponse>(`${ITEMS_URL}/${id}`, { method: 'DELETE' }, false);
    }
}
