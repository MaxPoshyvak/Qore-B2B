'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { DollarSign, Users, ClipboardList, TrendingUp } from 'lucide-react';

import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { GlowCard } from '@/shared/ui/GlowCard';

const METRICS = [
    { label: "Today's revenue", value: '$0', icon: DollarSign },
    { label: 'Active tables', value: '0', icon: Users },
    { label: 'Orders', value: '0', icon: ClipboardList },
];

export default function DashboardOverview() {
    const { slug } = useParams<{ slug: string }>();
    const { data, isLoading } = useGetTenantBySlug(slug ?? '');

    return (
        <div className="mx-auto max-w-5xl">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}>
                <p className="flex items-center gap-2 text-[13px] text-[#94938D]">
                    <TrendingUp size={14} className="text-[#10B981]" />
                    Overview
                </p>
                <h1 className={`${display.className} mt-1 text-[32px] font-bold tracking-tight sm:text-[40px]`}>
                    Welcome{isLoading ? '…' : ` to ${data?.data.name ?? ''}`}
                </h1>
            </motion.div>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {METRICS.map((metric, i) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: EASE, delay: i * 0.08 }}>
                        <GlowCard className="p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] text-[#94938D]">{metric.label}</span>
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6]">
                                    <metric.icon size={17} strokeWidth={1.9} />
                                </span>
                            </div>
                            <p className="mt-3 text-[28px] font-semibold text-[#F5F4F2]">
                                {isLoading ? (
                                    <span className="inline-block h-7 w-20 animate-pulse rounded-md bg-white/10" />
                                ) : (
                                    metric.value
                                )}
                            </p>
                        </GlowCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
