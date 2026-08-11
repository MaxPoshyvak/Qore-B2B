import { apiClient } from '@/lib/api-client';
import type { PublicMenuResponseDTO } from '@my-app/types';

const PUBLIC_MENU_URL = '/menu/public';

/** Reads a venue's public menu by slug. Unauthenticated (no JWT required). */
export class PublicMenuService {
    static async getBySlug(slug: string): Promise<PublicMenuResponseDTO> {
        // The endpoint is public, so bypass the `SuccessResponse<T>` envelope and
        // the session token lookup — the payload comes back unwrapped.
        return apiClient<PublicMenuResponseDTO>(`${PUBLIC_MENU_URL}/${slug}`, { method: 'GET' }, false);
    }
}
