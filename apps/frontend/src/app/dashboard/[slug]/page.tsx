'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    DollarSign,
    ClipboardList,
    CalendarDays,
    Coffee,
    ExternalLink,
    Bell,
    ChefHat,
    CalendarPlus,
} from 'lucide-react';

import { useTranslations } from 'next-intl';

import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { useDashboardToday } from '@/features/dashboard/hooks/useDashboardToday';
import { formatPrice } from '@/shared/lib/utils';
import { GlowCard } from '@/shared/ui/GlowCard';

const METRIC_SLOTS = [
    { key: 'revenue', labelKey: 'todaysRevenue', icon: DollarSign },
    { key: 'active', labelKey: 'activeOrders', icon: ClipboardList },
    { key: 'reservations', labelKey: 'todaysReservations', icon: CalendarDays },
    { key: 'topDish', labelKey: 'topDishToday', icon: Coffee },
] as const;

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};

const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function DashboardOverview() {
    const t = useTranslations('dashboard.overview');
    const { slug } = useParams<{ slug: string }>();
    const { data: tenant, isLoading: isTenantLoading } = useGetTenantBySlug(slug ?? '');
    const tenantId = tenant?.data?.id;

    const { data: today, isLoading: isTodayLoading } = useDashboardToday(tenantId);
    const isLoading = isTodayLoading || !today;

    const QUICK_ACTIONS: Array<{
        labelKey: 'liveOrders' | 'kitchenBoard' | 'newReservation';
        icon: typeof Bell;
        href: string;
        absolute?: boolean;
    }> = [
        { labelKey: 'liveOrders', icon: Bell, href: '/orders' },
        { labelKey: 'kitchenBoard', icon: ChefHat, href: '/settings?section=kds' },
        { labelKey: 'newReservation', icon: CalendarPlus, href: `/${slug}/book`, absolute: true },
    ];

    const metricValues: Record<(typeof METRIC_SLOTS)[number]['key'], { value: string; sub?: string }> = {
        revenue: { value: today ? formatPrice(today.revenueToday) : '' },
        active: { value: today ? String(today.activeOrders) : '' },
        reservations: { value: today ? String(today.todayReservations) : '' },
        topDish: {
            value: today?.topDish?.name ?? '—',
            sub: today?.topDish ? t('sold', { count: today.topDish.sold }) : undefined,
        },
    };

    return (
        <div className="mx-auto max-w-6xl">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/25 bg-[#10B981]/5 px-3 py-1 text-[12px] font-medium text-[#04916C] dark:text-[#10B981]">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                        {t('liveOrdersBadge')}
                    </span>
                    <Link
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E5E0]/80 bg-white/60 px-3 py-1 text-[12px] text-[#6B6A65] transition-colors hover:border-[#3B82F6]/40 hover:text-[#3B82F6] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D] dark:hover:text-[#3B82F6]">
                        <ExternalLink size={12} />
                        {t('viewPublicMenu')}
                    </Link>
                </div>
                <h1
                    className={`${display.className} mt-4 text-[32px] font-bold tracking-tight sm:text-[42px]`}>
                    {isTenantLoading ? t('welcomeBack') : t('welcomeBackTo', { name: tenant?.data.name ?? '' })}
                </h1>
            </motion.div>

            {/* Metrics */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {METRIC_SLOTS.map((metric) => {
                    const Icon = metric.icon;
                    const values = metricValues[metric.key];
                    return (
                        <motion.div key={metric.key} variants={item}>
                            <GlowCard className="p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                                        {t(metric.labelKey)}
                                    </span>
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6]">
                                        <Icon size={16} strokeWidth={1.9} />
                                    </span>
                                </div>
                                <p className="mt-3 text-[26px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    {isLoading ? (
                                        <span className="inline-block h-7 w-24 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/10" />
                                    ) : (
                                        values.value
                                    )}
                                </p>
                                {!isLoading && values.sub && (
                                    <p className="mt-1 text-[12px] text-[#6B6A65] dark:text-[#94938D]">{values.sub}</p>
                                )}
                            </GlowCard>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Quick actions */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="mt-8">
                <h2 className={`${display.className} text-[18px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    {t('quickActions')}
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {QUICK_ACTIONS.map((action) => {
                        const Icon = action.icon;
                        return (
                            <motion.div key={action.labelKey} variants={item}>
                                <Link
                                    href={action.absolute ? action.href : `/dashboard/${slug}${action.href}`}
                                    className="group flex items-center gap-3 rounded-2xl border border-[#E7E5E0]/80 bg-white/60 px-5 py-4 text-[14px] font-medium text-[#0A0A0C] transition-all hover:-translate-y-0.5 hover:border-[#3B82F6]/40 dark:border-white/10 dark:bg-white/5 dark:text-[#F5F4F2]">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white">
                                        <Icon size={16} strokeWidth={2} />
                                    </span>
                                    {t(action.labelKey)}
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
