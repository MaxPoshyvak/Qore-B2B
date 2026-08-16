import { apiClient } from '@/lib/api-client';
import type {
    CreateCategoryDTO,
    MenuCategoryResponse,
    MenuCategoryWithItemsResponse,
    UpdateCategoryDTO,
} from '@my-app/types';

const CATEGORIES_URL = '/menu/categories';

/**
 * Menu category data access.
 *
 * The menu controllers return the global `SuccessResponse<T>` envelope, so we
 * call `apiClient` with its default behaviour (which resolves the envelope) and
 * unwrap `data` here, exposing the raw payload to hooks and components.
 */
export class CategoryService {
    static async getByTenant(tenantId: string): Promise<MenuCategoryWithItemsResponse[]> {
        const res = await apiClient<MenuCategoryWithItemsResponse[]>(`${CATEGORIES_URL}/${tenantId}`, {
            method: 'GET',
        });
        return res.data;
    }

    static async create(dto: CreateCategoryDTO): Promise<MenuCategoryResponse> {
        const res = await apiClient<MenuCategoryResponse>(CATEGORIES_URL, {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async update(id: string, dto: UpdateCategoryDTO): Promise<MenuCategoryResponse> {
        const res = await apiClient<MenuCategoryResponse>(`${CATEGORIES_URL}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async remove(id: string): Promise<MenuCategoryResponse> {
        const res = await apiClient<MenuCategoryResponse>(`${CATEGORIES_URL}/${id}`, { method: 'DELETE' });
        return res.data;
    }
}
