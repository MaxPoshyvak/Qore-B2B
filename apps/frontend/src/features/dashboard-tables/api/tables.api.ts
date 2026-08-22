import { apiClient } from '@/lib/api-client';
import { type CreateTableDto, type UpdateTableDto } from '@my-app/types';
import { type Table } from '@my-app/database';

const TABLES_URL = '/tables';

/** B2B Tables API — all responses are unwrapped from `SuccessResponse<T>`. */
export class TablesApi {
    static async getBySlug(slug: string): Promise<Table[]> {
        const res = await apiClient<Table[]>(`${TABLES_URL}/${slug}`);
        return res.data;
    }

    static async create(slug: string, dto: CreateTableDto): Promise<Table> {
        const res = await apiClient<Table>(`${TABLES_URL}/${slug}`, {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async update(slug: string, tableId: string, dto: UpdateTableDto): Promise<Table> {
        const res = await apiClient<Table>(`${TABLES_URL}/${slug}/${tableId}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async delete(slug: string, tableId: string): Promise<Table> {
        const res = await apiClient<Table>(`${TABLES_URL}/${slug}/${tableId}`, {
            method: 'DELETE',
        });
        return res.data;
    }

    static async refreshQr(slug: string, tableId: string): Promise<Table> {
        const res = await apiClient<Table>(`${TABLES_URL}/${slug}/${tableId}/refresh-qr`, {
            method: 'POST',
        });
        return res.data;
    }
}
