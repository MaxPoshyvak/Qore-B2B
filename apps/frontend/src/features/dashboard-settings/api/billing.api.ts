import { apiClient } from '@/lib/api-client';
import type { CheckoutSessionResponse, PortalSessionResponse, VerifyCheckoutSessionResponse } from '@my-app/types';

export class BillingApi {
    static async createCheckout(tenantId: string, plan: 'pro' | 'business'): Promise<CheckoutSessionResponse> {
        const res = await apiClient<CheckoutSessionResponse>(`/billing/${tenantId}/checkout`, {
            method: 'POST',
            body: JSON.stringify({ plan }),
        });
        return res.data;
    }

    static async createPortal(tenantId: string): Promise<PortalSessionResponse> {
        const res = await apiClient<PortalSessionResponse>(`/billing/${tenantId}/portal`, {
            method: 'POST',
        });
        return res.data;
    }

    static async verifySession(tenantId: string, sessionId: string): Promise<VerifyCheckoutSessionResponse> {
        const res = await apiClient<VerifyCheckoutSessionResponse>(`/billing/${tenantId}/verify-session`, {
            method: 'POST',
            body: JSON.stringify({ sessionId }),
        });
        return res.data;
    }
}
