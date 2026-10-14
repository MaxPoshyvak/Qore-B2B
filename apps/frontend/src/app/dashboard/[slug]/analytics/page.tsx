'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, Users, MessageSquareHeart } from 'lucide-react';

import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { cn } from '@/shared/lib/utils';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { Eyebrow } from '@/shared/ui/Eyebrow';
import { FeedbackView, GuestsView, OverviewView, SalesView } from '@/features/analytics';
import { useTranslations } from 'next-intl';

const TABS = [
    { value: 'overview', labelKey: 'overview', icon: LayoutDashboard },
    { value: 'sales', labelKey: 'sales', icon: ShoppingBag },
    { value: 'guests', labelKey: 'guests', icon: Users },
    { value: 'feedback', labelKey: 'feedback', icon: MessageSquareHeart },
] as const;

type TabValue = (typeof TABS)[number]['value'];

function isTabValue(value: string | null): value is TabValue {
    return TABS.some((tab) => tab.value === value);
}

export default function AnalyticsPage() {
    const tSidebar = useTranslations('dashboard.sidebar');
    const tAnalytics = useTranslations('dashboard.analytics');
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const requestedTab = searchParams.get('section');
    const [tab, setTab] = useState<TabValue>(isTabValue(requestedTab) ? requestedTab : 'overview');

    useEffect(() => {
        if (isTabValue(requestedTab) && requestedTab !== tab) setTab(requestedTab);
    }, [requestedTab, tab]);

    const changeTab = (value: TabValue) => {
        setTab(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set('section', value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const { data, isLoading } = useGetTenantBySlug(resolvedSlug);
    const tenantId = data?.data?.id;

    return (
        <div className="mx-auto max-w-6xl">
            <motion.header
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Eyebrow>{tAnalytics('title')}</Eyebrow>
                    <h1
                        className={`${display.className} mt-3 text-3xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-4xl`}>
                        Venue{' '}
                        <span className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                            Performance
                        </span>
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        {tAnalytics('subtitle')}
                    </p>
                </div>
            </motion.header>

            {/* Top tab navigation */}
            <div className="hide-scrollbar md:hidden -mx-1 mt-8 flex gap-2 overflow-x-auto px-1">
                {TABS.map((tTab) => {
                    const active = tab === tTab.value;
                    const Icon = tTab.icon;
                    return (
                        <button
                            key={tTab.value}
                            type="button"
                            onClick={() => changeTab(tTab.value)}
                            className={cn(
                                'flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-[14px] font-medium transition-colors',
                                active
                                    ? 'border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA]'
                                    : 'border-[#E7E5E0] bg-white/60 text-[#6B6A65] hover:border-[#3B82F6]/40 dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]',
                            )}>
                            <Icon size={16} strokeWidth={1.9} />
                            {tSidebar(tTab.labelKey)}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="mt-6">
                    {isLoading ? (
                        <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">Loading venue…</p>
                    ) : !tenantId ? (
                        <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">Venue not found.</p>
                    ) : tab === 'overview' ? (
                        <OverviewView
                            tenantId={tenantId}
                            currency={data?.data?.settings?.currency ?? 'USD'}
                        />
                    ) : tab === 'sales' ? (
                        <SalesView
                            tenantId={tenantId}
                            currency={data?.data?.settings?.currency ?? 'USD'}
                        />
                    ) : tab === 'guests' ? (
                        <GuestsView tenantId={tenantId} />
                    ) : (
                        <FeedbackView tenantId={tenantId} slug={resolvedSlug} subscriptionPlan={data?.data?.subscriptionPlan} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
