import { apiClient } from '@/lib/api-client';
import type {
    CreateEqualSplitPaymentDto,
    CreateItemSplitPaymentDto,
    CreateOrderPaymentDto,
    OrderBillStatusResponse,
    OrderPaymentSessionResponse,
    VerifyOrderPaymentDto,
    VerifyPaymentResponse,
} from '@my-app/types';

export class PaymentsApi {
    static async getBillStatus(orderId: string, guestSessionId?: string): Promise<OrderBillStatusResponse> {
        const query = guestSessionId ? `?guestSessionId=${encodeURIComponent(guestSessionId)}` : '';
        const res = await apiClient<OrderBillStatusResponse>(`/payments/orders/${orderId}/bill${query}`);
        return res.data;
    }

    static async payFull(orderId: string, dto: CreateOrderPaymentDto): Promise<OrderPaymentSessionResponse> {
        const res = await apiClient<OrderPaymentSessionResponse>(`/payments/orders/${orderId}/pay`, {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async splitEqual(orderId: string, dto: CreateEqualSplitPaymentDto): Promise<OrderPaymentSessionResponse> {
        const res = await apiClient<OrderPaymentSessionResponse>(`/payments/orders/${orderId}/split/equal`, {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async splitByItems(orderId: string, dto: CreateItemSplitPaymentDto): Promise<OrderPaymentSessionResponse> {
        const res = await apiClient<OrderPaymentSessionResponse>(`/payments/orders/${orderId}/split/items`, {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async unlockItems(orderId: string, guestSessionId: string): Promise<{ unlocked: number }> {
        const res = await apiClient<{ unlocked: number }>(`/payments/orders/${orderId}/split/unlock`, {
            method: 'POST',
            body: JSON.stringify({ guestSessionId }),
        });
        return res.data;
    }

    static async verifySession(orderId: string, dto: VerifyOrderPaymentDto): Promise<VerifyPaymentResponse> {
        const res = await apiClient<VerifyPaymentResponse>(`/payments/orders/${orderId}/verify-session`, {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return res.data;
    }
}
