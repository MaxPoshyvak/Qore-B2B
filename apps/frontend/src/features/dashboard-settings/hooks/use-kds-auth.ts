'use client';

import { useQueryClient } from '@tanstack/react-query';

import { KdsApi } from '../api/kds.api';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';

/**
 * Owner-side KDS credential management. The tenant id is resolved from the slug (the
 * backend re-checks ownership), then we generate/revoke the Magic-Link token + PIN
 * and re-sync the tenant query so the board reflects the new state.
 */
export const useKdsAuth = (slug: string) => {
    const queryClient = useQueryClient();
    const { data } = useGetTenantBySlug(slug);
    const tenantId = data?.data?.id;

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tenants', 'details', slug] });

    const generate = async (): Promise<{ kdsToken: string; kdsPin: string }> => {
        if (!tenantId) throw new Error('Venue not ready');
        const res = await KdsApi.generate(tenantId);
        invalidate();
        return { kdsToken: res.kdsToken ?? '', kdsPin: res.kdsPin ?? '' };
    };

    const revoke = async (): Promise<void> => {
        if (!tenantId) throw new Error('Venue not ready');
        await KdsApi.revoke(tenantId);
        invalidate();
    };

    return { generate, revoke };
};
