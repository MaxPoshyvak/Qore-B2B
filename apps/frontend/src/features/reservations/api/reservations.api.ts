import { apiClient } from '@/lib/api-client';
import {
    type AvailabilitySlot,
    type CreateReservationDto,
    type ReservationResponse,
    type UpdateReservationDto,
} from '@my-app/types';

const RESERVATIONS_URL = '/reservations';

/** Reservation API — all responses are unwrapped from `SuccessResponse<T>`. */
export class ReservationsApi {
    static async getAvailability(slug: string, date: string): Promise<AvailabilitySlot[]> {
        const res = await apiClient<AvailabilitySlot[]>(
            `${RESERVATIONS_URL}/public/${slug}/availability?date=${encodeURIComponent(date)}`,
        );
        return res.data;
    }

    static async create(slug: string, dto: CreateReservationDto): Promise<ReservationResponse> {
        const res = await apiClient<ReservationResponse>(`${RESERVATIONS_URL}/public/${slug}`, {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async cancel(id: string): Promise<ReservationResponse> {
        const res = await apiClient<ReservationResponse>(`${RESERVATIONS_URL}/public/cancel/${id}`, {
            method: 'PATCH',
        });
        return res.data;
    }

    static async getByTenant(tenantId: string): Promise<ReservationResponse[]> {
        const res = await apiClient<ReservationResponse[]>(`${RESERVATIONS_URL}/${tenantId}`);
        return res.data;
    }

    static async update(
        tenantId: string,
        id: string,
        dto: UpdateReservationDto,
    ): Promise<ReservationResponse> {
        const res = await apiClient<ReservationResponse>(`${RESERVATIONS_URL}/${tenantId}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async getTableUpcoming(slug: string, tableId: string): Promise<ReservationResponse | null> {
        const res = await apiClient<ReservationResponse | null>(
            `${RESERVATIONS_URL}/public/${slug}/table/${tableId}/upcoming`,
        );
        return res.data;
    }
}
