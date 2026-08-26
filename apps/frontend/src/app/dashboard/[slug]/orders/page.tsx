'use client';

import { useParams } from 'next/navigation';

import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { LiveOrdersBoard } from '@/features/dashboard-orders/components/LiveOrdersBoard';

export default function LiveOrdersPage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const { data, isLoading } = useGetTenantBySlug(resolvedSlug);

    const tenantId = data?.data?.id;

    if (isLoading) {
        return <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">Loading venue…</p>;
    }

    if (!tenantId) {
        return <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">Venue not found.</p>;
    }

    return <LiveOrdersBoard slug={resolvedSlug} tenantId={tenantId} />;
}
