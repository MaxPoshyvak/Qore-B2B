'use client';

import { motion } from 'framer-motion';
import { DollarSign, Receipt, Calculator, Eye } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { display, mono } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { formatPrice } from '@/shared/lib/utils';
import { useAnalyticsOverview } from '../hooks/useAnalytics';
import { MetricCard } from './MetricCard';

// Перетворює ключ YYYY-MM-DD на компактний лейбл осі (напр. "Aug 21")
function formatChartDate(dateKey: string): string {
    const parsed = new Date(`${dateKey}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateKey;
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function GlassTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-2xl border border-[#E7E5E0] bg-white/90 px-4 py-2.5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#141417]/95">
            <p className={`${mono.className} text-[10px] uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]`}>
                {label}
            </p>
            <p className={`${display.className} text-[18px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                {formatPrice(payload[0].value)}
            </p>
        </div>
    );
}

export function OverviewView({ tenantId }: { tenantId: string }) {
    const { data, isLoading } = useAnalyticsOverview(tenantId);

    const totalRevenue = data?.totalRevenue ?? 0;
    const totalOrders = data?.totalOrders ?? 0;
    const averageOrderValue = data?.averageOrderValue ?? 0;
    const menuViews = data?.menuViews ?? 0;

    // Реальний щоденний тренд виручки з бекенду
    const chartData = (data?.timeline ?? []).map((point) => ({
        label: formatChartDate(point.date),
        revenue: point.revenue,
        orders: point.orders,
    }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label="Total Revenue"
                    value={isLoading ? '—' : formatPrice(totalRevenue)}
                    icon={DollarSign}
                    accent="blue"
                />
                <MetricCard
                    label="Total Orders"
                    value={isLoading ? '—' : totalOrders.toLocaleString('en-US')}
                    icon={Receipt}
                    accent="violet"
                />
                <MetricCard
                    label="Avg Order Value"
                    value={isLoading ? '—' : formatPrice(averageOrderValue)}
                    icon={Calculator}
                    accent="green"
                />
                <MetricCard
                    label="Menu Views"
                    value={isLoading ? '—' : menuViews.toLocaleString('en-US')}
                    icon={Eye}
                    accent="amber"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="rounded-[28px] border border-white/60 bg-white/80 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p
                            className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                            Revenue trend
                        </p>
                        <h3
                            className={`${display.className} mt-1 text-[18px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            This week
                        </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#04916C]/10 px-3 py-1 text-[12px] font-medium text-[#04916C] dark:text-[#10B981]">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        Live
                    </span>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#E7E5E0"
                            className="dark:stroke-white/10"
                        />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: '#9C9B95' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#9C9B95' }}
                            axisLine={false}
                            tickLine={false}
                            width={48}
                            tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip content={<GlassTooltip />} cursor={{ stroke: '#3B82F6', strokeOpacity: 0.2 }} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3B82F6"
                            strokeWidth={2.5}
                            fill="url(#revenueFill)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
}
