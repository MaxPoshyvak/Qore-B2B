'use client';

import { Activity, DollarSign, Users, Crown, TrendingUp, Layers } from 'lucide-react';
import type { PlatformStatsResponse } from '@my-app/types';

interface PlatformStatsCardsProps {
    stats: PlatformStatsResponse;
}

export function PlatformStatsCards({ stats }: PlatformStatsCardsProps) {
    const { traffic, subscriptions, users } = stats;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Live Traffic */}
            <div className="rounded-3xl border border-white/10 bg-[#141417]/80 p-5 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#94938D]">
                        Live Traffic
                    </span>
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
                        <Activity size={16} />
                    </div>
                </div>
                <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                            {traffic.totalPageviews.toLocaleString()}
                        </span>
                        <span className="text-xs text-[#94938D]">hits</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2.5 text-xs text-[#94938D]">
                        <span>Unique: <strong className="text-white font-mono">{traffic.uniqueVisitors.toLocaleString()}</strong></span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {traffic.activeVisitorsLast15m} active now
                        </span>
                    </div>
                    <div className="mt-1 text-[11px] text-[#6B6A65]">
                        Today: <span className="text-[#94938D] font-mono">{traffic.todayPageviews}</span> views ({traffic.todayUniqueVisitors} unique)
                    </div>
                </div>
            </div>

            {/* Card 2: MRR & Revenue */}
            <div className="rounded-3xl border border-white/10 bg-[#141417]/80 p-5 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#94938D]">
                        SaaS MRR
                    </span>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                        <DollarSign size={16} />
                    </div>
                </div>
                <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                            ${subscriptions.mrr.toLocaleString()}
                        </span>
                        <span className="text-xs text-emerald-400 font-semibold">/mo</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2.5 text-xs text-[#94938D]">
                        <span>Subscribers: <strong className="text-white font-mono">{subscriptions.activeSubscribersCount}</strong></span>
                        <span className="text-blue-400">
                            Stripe active
                        </span>
                    </div>
                    <div className="mt-1 text-[11px] text-[#6B6A65]">
                        Gross processed: <span className="text-[#94938D] font-mono">${subscriptions.totalRevenue.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Card 3: Subscription Plans Breakdown */}
            <div className="rounded-3xl border border-white/10 bg-[#141417]/80 p-5 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#94938D]">
                        Plans Distribution
                    </span>
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-purple-400">
                        <Crown size={16} />
                    </div>
                </div>
                <div className="mt-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="text-center flex-1 rounded-xl bg-white/5 py-2">
                            <span className="block text-xs font-medium text-[#94938D]">Free</span>
                            <span className="text-base font-bold text-white font-mono">{subscriptions.plansBreakdown.free}</span>
                        </div>
                        <div className="text-center flex-1 rounded-xl border border-blue-500/20 bg-blue-500/5 py-2">
                            <span className="block text-xs font-medium text-blue-400">Pro</span>
                            <span className="text-base font-bold text-white font-mono">{subscriptions.plansBreakdown.pro}</span>
                        </div>
                        <div className="text-center flex-1 rounded-xl border border-purple-500/20 bg-purple-500/5 py-2">
                            <span className="block text-xs font-medium text-purple-400">Biz</span>
                            <span className="text-base font-bold text-white font-mono">{subscriptions.plansBreakdown.business}</span>
                        </div>
                    </div>
                    <div className="mt-2.5 border-t border-white/5 pt-2 text-[11px] text-center text-[#6B6A65]">
                        Pro: $29/mo • Business: $79/mo
                    </div>
                </div>
            </div>

            {/* Card 4: Registered Users & Venues */}
            <div className="rounded-3xl border border-white/10 bg-[#141417]/80 p-5 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#94938D]">
                        Total Users
                    </span>
                    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-400">
                        <Users size={16} />
                    </div>
                </div>
                <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                            {users.totalUsers.toLocaleString()}
                        </span>
                        <span className="text-xs text-[#94938D]">accounts</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2.5 text-xs text-[#94938D]">
                        <span>Venues: <strong className="text-white font-mono">{users.totalTenants}</strong></span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <TrendingUp size={12} />
                            +{users.newUsersLast7Days} this week
                        </span>
                    </div>
                    <div className="mt-1 text-[11px] text-[#6B6A65]">
                        Registration growth past 7 days
                    </div>
                </div>
            </div>
        </div>
    );
}
