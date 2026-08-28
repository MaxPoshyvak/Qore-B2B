import { apiClient } from '@/lib/api-client';
import type { PublicOrderResponse } from '@my-app/types';

const ORDERS_URL = '/orders';

/**
 * Публічний трекінг замовлення: GET /api/orders/public/:orderId.
 * Не вимагає автентифікації (orderId — непередбачуваний cuid).
 */
export class OrderTrackingApi {
    static async getPublicOrder(orderId: string): Promise<PublicOrderResponse> {
        const res = await apiClient<PublicOrderResponse>(`${ORDERS_URL}/public/${orderId}`);
        return res.data;
    }
}
