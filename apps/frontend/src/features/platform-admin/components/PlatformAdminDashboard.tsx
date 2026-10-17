'use client';

import { usePlatformStats } from '../hooks/usePlatformAdmin';
import { PlatformHeader } from './PlatformHeader';
import { PlatformStatsCards } from './PlatformStatsCards';
import { PlatformTrafficTable } from './PlatformTrafficTable';
import { PlatformRecentHits } from './PlatformRecentHits';
import { PlatformLeaderboard } from './PlatformLeaderboard';
import { PlatformSubscriptionsTable } from './PlatformSubscriptionsTable';
import { PlatformUsersTable } from './PlatformUsersTable';
import { Loader2 } from 'lucide-react';

interface PlatformAdminDashboardProps {
    onLogout: () => void;
}

export function PlatformAdminDashboard({ onLogout }: PlatformAdminDashboardProps) {
    const { data: stats, isLoading, isFetching, refetch, error } = usePlatformStats(true);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C] text-white">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-blue-500" />
                    <span className="text-sm font-semibold tracking-wide text-[#94938D]">
                        Connecting to Platform Command Hub...
                    </span>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C] text-white p-4">
                <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                    <h2 className="text-lg font-bold text-red-400">Failed to load platform data</h2>
                    <p className="mt-2 text-xs text-[#94938D]">
                        {(error as any)?.message || 'An unexpected error occurred while fetching metrics.'}
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors">
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0C] text-[#F5F4F2] pb-16">
            <PlatformHeader
                onLogout={onLogout}
                onRefresh={() => refetch()}
                isFetching={isFetching}
                serverTime={stats.system.serverTime}
                uptimeSeconds={stats.system.uptimeSeconds}
            />

            <main className="mx-auto max-w-7xl px-4 sm:px-8 pt-8 space-y-8">
                {/* 1. Metric Overview Cards */}
                <PlatformStatsCards stats={stats} />

                {/* 2. Traffic Analytics & Live Stream */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <PlatformTrafficTable traffic={stats.traffic} />
                    </div>
                    <div>
                        <PlatformRecentHits traffic={stats.traffic} />
                    </div>
                </div>

                {/* 3. Leaderboards (Top Menus & Orders) */}
                <PlatformLeaderboard leaderboard={stats.leaderboard} />

                {/* 4. Subscriptions & Users */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PlatformSubscriptionsTable subscriptions={stats.subscriptions} />
                    <PlatformUsersTable users={stats.users} />
                </div>
            </main>
        </div>
    );
}
