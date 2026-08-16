import { apiClient } from '@/lib/api-client';
import type { PublicMenuResponseDTO } from '@my-app/types';

const PUBLIC_MENU_URL = '/menu/public';

/** Reads a venue's public menu by slug. Unauthenticated (no JWT required). */
export class PublicMenuService {
    static async getBySlug(slug: string): Promise<PublicMenuResponseDTO> {
        // The controller returns the global `SuccessResponse<T>` envelope, so we
        // resolve it via `apiClient` (default behaviour) and unwrap `data` here.
        const res = await apiClient<PublicMenuResponseDTO>(`${PUBLIC_MENU_URL}/${slug}`, {
            method: 'GET',
        });
        return res.data;
    }
}
