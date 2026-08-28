'use client';

import { motion } from 'framer-motion';
import { Car, UtensilsCrossed, Eye, ShoppingBag, CalendarCheck, CalendarX } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { display, mono } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { useAnalyticsTraffic } from '../hooks/useAnalytics';
import { MetricCard } from './MetricCard';

function SliceTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
        <div className="rounded-2xl border border-[#E7E5E0] bg-white/90 px-4 py-2.5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#141417]/95">
            <p className={`${display.className} text-[16px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                {item.name}: {item.value}
            </p>
        </div>
    );
}

export function GuestsView({ tenantId }: { tenantId: string }) {
    const { data, isLoading } = useAnalyticsTraffic(tenantId);

    const takeaway = data?.takeawayCount ?? 0;
    const dineIn = data?.dineInCount ?? 0;
    const total = takeaway + dineIn;

    const totalViews = data?.totalViews ?? 0;
    const totalOrders = data?.totalOrders ?? 0;
    const completedReservations = data?.completedReservations ?? 0;
    const cancelledReservations = data?.cancelledReservations ?? 0;
    // Конверсія: скільки переглядів меню завершилися замовленням
    const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

    const chartData = [
        { name: 'Takeaway', value: takeaway, color: '#8B5CF6' },
        { name: 'Dine-in', value: dineIn, color: '#3B82F6' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <MetricCard
                    label="Takeaway Orders"
                    value={isLoading ? '—' : takeaway.toLocaleString('en-US')}
                    icon={Car}
                    accent="violet"
                />
                <MetricCard
                    label="Dine-in Orders"
                    value={isLoading ? '—' : dineIn.toLocaleString('en-US')}
                    icon={UtensilsCrossed}
                    accent="blue"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="rounded-[28px] border border-white/60 bg-white/80 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                <p
                    className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                    Order type split
                </p>
                <h3 className={`${display.className} mt-1 text-[18px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    Guests & Traffic
                </h3>

                <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
                    <div className="relative h-56 w-56 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={62}
                                    outerRadius={96}
                                    paddingAngle={3}
                                    stroke="none">
                                    {chartData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<SliceTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span
                                className={`${display.className} text-[26px] font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                {total.toLocaleString('en-US')}
                            </span>
                            <span
                                className={`${mono.className} text-[10px] uppercase tracking-wider text-[#9C9B95]`}>
                                Total orders
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        {chartData.map((entry) => {
                            const share = total > 0 ? (entry.value / total) * 100 : 0;
                            return (
                                <div key={entry.name}>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-[14px] font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
                                            {entry.name}
                                        </span>
                                        <span
                                            className={`${display.className} text-[14px] font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                            {share.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${share}%`, background: entry.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Conversion Funnel: Menu Views → Orders Placed */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
                className="rounded-[28px] border border-white/60 bg-white/80 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                <p
                    className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                    Conversion
                </p>
                <h3 className={`${display.className} mt-1 text-[18px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    Menu Views → Orders
                </h3>

                <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-black/5 bg-card/50 px-4 py-3 dark:border-white/10">
                        <div className="flex items-center gap-2 text-[#3B82F6]">
                            <Eye size={15} strokeWidth={1.9} />
                            <span className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]`}>
                                Menu Views
                            </span>
                        </div>
                        <p className={`${display.className} mt-1 text-[22px] font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            {totalViews.toLocaleString('en-US')}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-black/5 bg-card/50 px-4 py-3 dark:border-white/10">
                        <div className="flex items-center gap-2 text-[#8B5CF6]">
                            <ShoppingBag size={15} strokeWidth={1.9} />
                            <span className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]`}>
                                Orders Placed
                            </span>
                        </div>
                        <p className={`${display.className} mt-1 text-[22px] font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            {totalOrders.toLocaleString('en-US')}
                        </p>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[13px] text-[#6B6A65] dark:text-[#94938D]">Conversion rate</span>
                        <span className={`${display.className} text-[14px] font-bold tabular-nums text-[#04916C] dark:text-[#10B981]`}>
                            {conversionRate.toFixed(1)}%
                        </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${conversionRate}%` }}
                            transition={{ duration: 0.8, ease: EASE }}
                            className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Reservations: Completed vs Cancelled */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                className="rounded-[28px] border border-white/60 bg-white/80 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                <p
                    className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                    Bookings
                </p>
                <h3 className={`${display.className} mt-1 text-[18px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    Reservations
                </h3>

                <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-black/5 bg-card/50 px-4 py-3 dark:border-white/10">
                        <div className="flex items-center gap-2 text-[#04916C] dark:text-[#10B981]">
                            <CalendarCheck size={15} strokeWidth={1.9} />
                            <span className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]`}>
                                Completed
                            </span>
                        </div>
                        <p className={`${display.className} mt-1 text-[22px] font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            {completedReservations.toLocaleString('en-US')}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-black/5 bg-card/50 px-4 py-3 dark:border-white/10">
                        <div className="flex items-center gap-2 text-[#F59E0B]">
                            <CalendarX size={15} strokeWidth={1.9} />
                            <span className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]`}>
                                Cancelled
                            </span>
                        </div>
                        <p className={`${display.className} mt-1 text-[22px] font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            {cancelledReservations.toLocaleString('en-US')}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
