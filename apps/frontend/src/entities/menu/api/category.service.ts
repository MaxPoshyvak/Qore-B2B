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
 * The menu controllers return raw Prisma rows rather than the
 * `SuccessResponse<T>` envelope used by the tenants module, so every call
 * passes `useBaseResType: false` to get the payload back untouched.
 */
export class CategoryService {
    static async getByTenant(tenantId: string): Promise<MenuCategoryWithItemsResponse[]> {
        return apiClient<MenuCategoryWithItemsResponse[]>(
            `${CATEGORIES_URL}/${tenantId}`,
            { method: 'GET' },
            false,
        );
    }

    static async create(dto: CreateCategoryDTO): Promise<MenuCategoryResponse> {
        return apiClient<MenuCategoryResponse>(
            CATEGORIES_URL,
            { method: 'POST', body: JSON.stringify(dto) },
            false,
        );
    }

    static async update(id: string, dto: UpdateCategoryDTO): Promise<MenuCategoryResponse> {
        return apiClient<MenuCategoryResponse>(
            `${CATEGORIES_URL}/${id}`,
            { method: 'PATCH', body: JSON.stringify(dto) },
            false,
        );
    }

    static async remove(id: string): Promise<MenuCategoryResponse> {
        return apiClient<MenuCategoryResponse>(`${CATEGORIES_URL}/${id}`, { method: 'DELETE' }, false);
    }
}
