import { apiClient } from '@/lib/api-client';
import { type CreateOrderDto, type OrderResponse, type OrderStatusType } from '@my-app/types';

const ORDERS_URL = '/orders';

/** GET /orders/active/:tenantId — live (not delivered/cancelled) orders. */
export class OrdersApi {
    static async getActive(tenantId: string): Promise<OrderResponse[]> {
        const res = await apiClient<OrderResponse[]>(`${ORDERS_URL}/active/${tenantId}`);
        return res.data;
    }

    /** PATCH /orders/:tenantId/:id/status — advance an order's status. */
    static async updateStatus(
        tenantId: string,
        orderId: string,
        status: OrderStatusType,
    ): Promise<OrderResponse> {
        const res = await apiClient<OrderResponse>(`${ORDERS_URL}/${tenantId}/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        return res.data;
    }

    /** POST /orders/checkout — public guest checkout from a cart session (no auth). */
    static async createPublicOrder(dto: CreateOrderDto): Promise<OrderResponse> {
        const res = await apiClient<OrderResponse>(`${ORDERS_URL}/checkout`, {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    /** GET /orders/kds/:token — live orders for the isolated KDS board (token + PIN header). */
    static async getKdsOrders(token: string, pin: string): Promise<OrderResponse[]> {
        const res = await apiClient<OrderResponse[]>(`${ORDERS_URL}/kds/${token}`, {
            method: 'GET',
            headers: { 'x-kds-pin': pin },
            allow401: true,
        } as RequestInit);
        return res.data;
    }

    /** PATCH /orders/kds/:token/:orderId/status — advance an order from the KDS board. */
    static async updateKdsStatus(
        token: string,
        pin: string,
        orderId: string,
        status: OrderStatusType,
    ): Promise<OrderResponse> {
        const res = await apiClient<OrderResponse>(`${ORDERS_URL}/kds/${token}/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'x-kds-pin': pin },
            body: JSON.stringify({ status }),
            allow401: true,
        } as RequestInit);
        return res.data;
    }
}
