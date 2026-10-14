'use client';

import { useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChefHat, History } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { LiveOrdersBoard } from '@/features/dashboard-orders/components/LiveOrdersBoard';
import { OrderHistoryView } from '@/features/dashboard-orders/components/OrderHistoryView';
import { cn } from '@/shared/lib/utils';

export default function LiveOrdersPage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('liveOrders');
    const tSidebar = useTranslations('dashboard.sidebar');

    const section = searchParams.get('section') || 'live';
    const isHistory = section === 'history';

    const { data, isLoading } = useGetTenantBySlug(resolvedSlug);
    const tenant = data?.data;
    const tenantId = tenant?.id;
    const currency = tenant?.settings?.currency ?? 'USD';

    function setTab(nextTab: 'live' | 'history') {
        router.replace(`/dashboard/${resolvedSlug}/orders?section=${nextTab}`, { scroll: false });
    }

    if (isLoading) {
        return <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">{t('loading')}</p>;
    }

    if (!tenantId) {
        return <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">Venue not found.</p>;
    }

    return (
        <div className="space-y-6">
            {/* Top view switcher (visible on mobile where sidebar submenu is hidden) */}
            <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-4 dark:border-[#232327] md:hidden">
                <div className="flex w-full items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setTab('live')}
                        className={cn(
                            'flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                            !isHistory
                                ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-sm'
                                : 'text-[#6B6A65] hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-white',
                        )}>
                        <ChefHat size={15} />
                        <span>{tSidebar('liveOrdersSub')}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTab('history')}
                        className={cn(
                            'flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                            isHistory
                                ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-sm'
                                : 'text-[#6B6A65] hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-white',
                        )}>
                        <History size={15} />
                        <span>{tSidebar('orderHistorySub')}</span>
                    </button>
                </div>
            </div>

            {!isHistory ? (
                <LiveOrdersBoard slug={resolvedSlug} tenantId={tenantId} />
            ) : (
                <OrderHistoryView slug={resolvedSlug} tenantId={tenantId} currency={currency} />
            )}
        </div>
    );
}
