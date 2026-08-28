'use client';

import { motion } from 'framer-motion';
import { TrendingUp, PackageX } from 'lucide-react';
import { display, mono } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { formatPrice } from '@/shared/lib/utils';
import { useAnalyticsSales } from '../hooks/useAnalytics';

export function SalesView({ tenantId }: { tenantId: string }) {
    const { data, isLoading } = useAnalyticsSales(tenantId);

    const topItems = data?.topItems ?? [];
    const deadStock = data?.deadStock ?? [];
    const totalRevenue = topItems.reduce((sum, item) => sum + item.revenue, 0);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="rounded-[28px] border border-white/60 bg-white/80 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                    <div className="mb-6 flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
                            <TrendingUp size={17} strokeWidth={1.9} />
                        </span>
                        <div>
                            <p
                                className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                                Best sellers
                            </p>
                            <h3 className={`${display.className} text-[18px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                Top Performers
                            </h3>
                        </div>
                    </div>

                    {isLoading ? (
                        <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">Loading sales…</p>
                    ) : topItems.length === 0 ? (
                        <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">
                            No completed sales in this period yet.
                        </p>
                    ) : (
                        <div className="space-y-5">
                            {topItems.map((item, index) => {
                                const share = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
                                return (
                                    <div key={item.name}>
                                        <div className="mb-1.5 flex items-baseline justify-between">
                                            <span className="text-[14px] font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                <span className="mr-2 text-[#9C9B95]">{index + 1}.</span>
                                                {item.name}
                                            </span>
                                            <span
                                                className={`${display.className} text-[14px] font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                                {formatPrice(item.revenue)}
                                            </span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${share}%` }}
                                                transition={{ duration: 0.8, ease: EASE, delay: index * 0.08 }}
                                                className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                                            />
                                        </div>
                                        <p
                                            className={`${mono.className} mt-1 text-[10.5px] uppercase tracking-wider text-[#9C9B95] dark:text-[#6E6D68]`}>
                                            {item.quantity} sold · {share.toFixed(0)}% of revenue
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            <div>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                    className="rounded-[28px] border border-white/60 bg-white/80 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                    <div className="mb-6 flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F59E0B]/10 text-[#F59E0B]">
                            <PackageX size={17} strokeWidth={1.9} />
                        </span>
                        <div>
                            <p
                                className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                                Needs attention
                            </p>
                            <h3 className={`${display.className} text-[18px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                Dead Stock
                            </h3>
                        </div>
                    </div>

                    {deadStock.length === 0 ? (
                        <p className="text-sm text-[#6B6A65] dark:text-[#94938D]">
                            Every item on your menu has made at least one sale. Nicely done.
                        </p>
                    ) : (
                        <ul className="space-y-2.5">
                            {deadStock.slice(0, 6).map((item) => (
                                <li
                                    key={item.name}
                                    className="flex items-center justify-between rounded-xl border border-black/5 bg-card/50 px-3 py-2.5 dark:border-white/10">
                                    <span className="truncate text-[13.5px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                                        {item.name}
                                    </span>
                                    <span
                                        className={`${mono.className} text-[10.5px] uppercase tracking-wider text-[#F59E0B] dark:text-[#FBBF24]`}>
                                        {formatPrice(item.price)} · No sales
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
