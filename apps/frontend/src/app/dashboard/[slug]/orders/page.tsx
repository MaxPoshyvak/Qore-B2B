'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ChefHat, History } from 'lucide-react';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { LiveOrdersBoard } from '@/features/dashboard-orders/components/LiveOrdersBoard';
import { OrderHistoryView } from '@/features/dashboard-orders/components/OrderHistoryView';
import { cn } from '@/shared/lib/utils';

export default function LiveOrdersPage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const { data, isLoading } = useGetTenantBySlug(resolvedSlug);
    const [tab, setTab] = useState<'live' | 'history'>('live');

    const tenant = data?.data;
    const tenantId = tenant?.id;
    const currency = tenant?.settings?.currency ?? 'USD';

    if (isLoading) {
        return <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">Loading venue…</p>;
    }

    if (!tenantId) {
        return <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">Venue not found.</p>;
    }

    return (
        <div className="space-y-6">
            {/* Top view switcher */}
            <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-4 dark:border-[#232327]">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setTab('live')}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer',
                            tab === 'live'
                                ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-sm'
                                : 'text-[#6B6A65] hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-white',
                        )}>
                        <ChefHat size={16} />
                        <span>Live Kitchen KDS</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTab('history')}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer',
                            tab === 'history'
                                ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-sm'
                                : 'text-[#6B6A65] hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-white',
                        )}>
                        <History size={16} />
                        <span>Order History & Archive</span>
                    </button>
                </div>
            </div>

            {tab === 'live' ? (
                <LiveOrdersBoard slug={resolvedSlug} tenantId={tenantId} />
            ) : (
                <OrderHistoryView slug={resolvedSlug} tenantId={tenantId} currency={currency} />
            )}
        </div>
    );
}
