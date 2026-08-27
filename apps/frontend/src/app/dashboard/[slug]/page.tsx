'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    DollarSign,
    ClipboardList,
    Users,
    Coffee,
    ExternalLink,
    Plus,
    Printer,
    ChefHat,
    TrendingUp,
} from 'lucide-react';

import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { GlowCard } from '@/shared/ui/GlowCard';

const METRICS = [
    {
        label: "Today's revenue",
        value: '$1,240.00',
        icon: DollarSign,
        trend: '+12.5%',
        positive: true,
    },
    { label: 'Active orders', value: '8 active', icon: ClipboardList },
    { label: 'Occupied tables', value: '12 / 20', icon: Users },
    { label: 'Top dish today', value: 'Cappuccino', sub: '42 sold', icon: Coffee },
];

const QUICK_ACTIONS = [
    { label: 'Add Dish to Menu', icon: Plus, href: '/menu' },
    { label: 'Print Table QRs', icon: Printer, href: '/tables-reservations?section=tables' },
    { label: 'View Kitchen Board', icon: ChefHat, href: '/orders' },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};

const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function DashboardOverview() {
    const { slug } = useParams<{ slug: string }>();
    const { data, isLoading } = useGetTenantBySlug(slug ?? '');

    return (
        <div className="mx-auto max-w-6xl">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/25 bg-[#10B981]/5 px-3 py-1 text-[12px] font-medium text-[#04916C] dark:text-[#10B981]">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                        Live &amp; Accepting Orders
                    </span>
                    <Link
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E5E0]/80 bg-white/60 px-3 py-1 text-[12px] text-[#6B6A65] transition-colors hover:border-[#3B82F6]/40 hover:text-[#3B82F6] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D] dark:hover:text-[#3B82F6]">
                        <ExternalLink size={12} />
                        View Public Menu
                    </Link>
                </div>
                <h1
                    className={`${display.className} mt-4 text-[32px] font-bold tracking-tight sm:text-[42px]`}>
                    {isLoading ? 'Welcome back…' : `Welcome back to ${data?.data.name ?? ''}`}
                </h1>
            </motion.div>

            {/* Metrics */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {METRICS.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div key={metric.label} variants={item}>
                            <GlowCard className="p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] text-[#6B6A65] dark:text-[#94938D]">
                                        {metric.label}
                                    </span>
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6]">
                                        <Icon size={16} strokeWidth={1.9} />
                                    </span>
                                </div>
                                <p className="mt-3 text-[26px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    {isLoading ? (
                                        <span className="inline-block h-7 w-24 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/10" />
                                    ) : (
                                        metric.value
                                    )}
                                </p>
                                {metric.trend && (
                                    <span
                                        className={`mt-1 inline-flex items-center gap-1 text-[12px] font-medium ${
                                            metric.positive ? 'text-[#04916C] dark:text-[#10B981]' : 'text-red-500'
                                        }`}>
                                        <TrendingUp size={12} />
                                        {metric.trend}
                                    </span>
                                )}
                                {metric.sub && (
                                    <p className="mt-1 text-[12px] text-[#6B6A65] dark:text-[#94938D]">{metric.sub}</p>
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
                    Quick actions
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {QUICK_ACTIONS.map((action) => {
                        const Icon = action.icon;
                        return (
                            <motion.div key={action.label} variants={item}>
                                <Link
                                    href={`/dashboard/${slug}${action.href}`}
                                    className="group flex items-center gap-3 rounded-2xl border border-[#E7E5E0]/80 bg-white/60 px-5 py-4 text-[14px] font-medium text-[#0A0A0C] transition-all hover:-translate-y-0.5 hover:border-[#3B82F6]/40 dark:border-white/10 dark:bg-white/5 dark:text-[#F5F4F2]">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white">
                                        <Icon size={16} strokeWidth={2} />
                                    </span>
                                    {action.label}
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
