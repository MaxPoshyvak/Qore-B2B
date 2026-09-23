import { apiClient } from '@/lib/api-client';
import {
    type AddCartItemDto,
    type CartItemResponse,
    type CartSessionResponse,
    type CartUpsellInput,
    type CartUpsellResponse,
    type CartUpsellResponseData,
    type UpdateCartItemDto,
} from '@my-app/types';

const CART_URL = '/cart';

/**
 * B2C shared cart API. All responses are unwrapped from the global
 * `SuccessResponse<T>` envelope via `apiClient`.
 */
export class CartApi {
    static async getSession(tableId: string): Promise<CartSessionResponse> {
        const res = await apiClient<CartSessionResponse>(`${CART_URL}/table/${tableId}`);
        return res.data;
    }

    static async getSessionById(sessionId: string): Promise<CartSessionResponse> {
        const res = await apiClient<CartSessionResponse>(`${CART_URL}/session/${sessionId}`);
        return res.data;
    }

    static async createTakeawaySession(): Promise<CartSessionResponse> {
        const res = await apiClient<CartSessionResponse>(`${CART_URL}/takeaway`, {
            method: 'POST',
            body: JSON.stringify({}),
        });
        return res.data;
    }

    /** Reopens the table with a fresh ACTIVE session after an order was placed. */
    static async startNewSession(tableId: string): Promise<CartSessionResponse> {
        const res = await apiClient<CartSessionResponse>(`${CART_URL}/table/${tableId}/new-session`, {
            method: 'POST',
            body: JSON.stringify({}),
        });
        return res.data;
    }

    static async addItem(tableId: string, dto: AddCartItemDto): Promise<CartSessionResponse> {
        const res = await apiClient<CartSessionResponse>(`${CART_URL}/table/${tableId}/items`, {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async addItemBySession(sessionId: string, dto: AddCartItemDto): Promise<CartSessionResponse> {
        const res = await apiClient<CartSessionResponse>(`${CART_URL}/${sessionId}/items`, {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async updateItem(itemId: string, dto: UpdateCartItemDto): Promise<CartItemResponse | null> {
        const res = await apiClient<CartItemResponse | null>(`${CART_URL}/items/${itemId}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        });
        return res.data;
    }

    static async removeItem(itemId: string, guestSessionId: string): Promise<CartItemResponse> {
        const res = await apiClient<CartItemResponse>(
            `${CART_URL}/items/${itemId}?guestSessionId=${encodeURIComponent(guestSessionId)}`,
            { method: 'DELETE' },
        );
        return res.data;
    }

    static async toggleCartReady(tableId: string, guestSessionId: string): Promise<CartSessionResponse> {
        const res = await apiClient<CartSessionResponse>(`${CART_URL}/table/${tableId}/toggle-ready`, {
            method: 'POST',
            body: JSON.stringify({ guestSessionId }),
        });
        return res.data;
    }

    static async getUpsellRecommendations(dto: CartUpsellInput): Promise<CartUpsellResponse> {
        const res = await apiClient<CartUpsellResponseData>('/ai/cart-upsell', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return res;
    }
}
