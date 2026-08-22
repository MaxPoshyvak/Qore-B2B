import { apiClient } from '@/lib/api-client';
import { type ResolvedTableDto } from '@my-app/types';

/** Public, unauthenticated QR resolution — returns the minimal table + tenant payload. */
export class PublicTableResolveApi {
    static async resolve(qrToken: string): Promise<ResolvedTableDto> {
        const res = await apiClient<ResolvedTableDto>(`/tables/public/resolve/${qrToken}`);
        return res.data;
    }
}
