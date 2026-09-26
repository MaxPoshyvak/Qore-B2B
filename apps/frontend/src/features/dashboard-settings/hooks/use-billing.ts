import { useMutation } from '@tanstack/react-query';
import { BillingApi } from '../api/billing.api';

export function useCreateCheckoutSession(tenantId: string) {
    return useMutation({
        mutationFn: (plan: 'pro' | 'business') => BillingApi.createCheckout(tenantId, plan),
    });
}

export function useCreatePortalSession(tenantId: string) {
    return useMutation({
        mutationFn: () => BillingApi.createPortal(tenantId),
    });
}
