'use client';

import { useParams } from 'next/navigation';

import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { SettingsForm } from '@/features/dashboard/settings/components/SettingsForm';
import type { PublicTenantResponse } from '@my-app/types';

export default function VenueSettingsPage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const { data, isLoading } = useGetTenantBySlug(resolvedSlug);

    if (isLoading) {
        return <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">Loading venue…</p>;
    }

    return (
        <SettingsForm
            slug={resolvedSlug}
            initialData={(data?.data as PublicTenantResponse) ?? ({} as PublicTenantResponse)}
        />
    );
}
