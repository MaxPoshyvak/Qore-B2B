'use client';

import { BarChart3, ExternalLink, ShoppingBag, Trophy } from 'lucide-react';
import Link from 'next/link';
import type { PlatformLeaderboard as PlatformLeaderboardType } from '@my-app/types';

interface PlatformLeaderboardProps {
    leaderboard: PlatformLeaderboardType;
}

export function PlatformLeaderboard({ leaderboard }: PlatformLeaderboardProps) {
    const { topByMenuViews, topByOrders } = leaderboard;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Top Venues by Menu Views */}
            <div className="rounded-3xl border border-white/10 bg-[#141417]/80 p-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-400">
                            <Trophy size={16} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-white">
                                Most Popular Menus
                            </h2>
                            <p className="text-xs text-[#94938D]">
                                Highest guest traffic and QR menu views
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    {topByMenuViews.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[#6B6A65]">
                            No menu view data available yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topByMenuViews.map((venue, index) => (
                                <div
                                    key={venue.id}
                                    className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-xs font-mono font-bold text-[#94938D]">
                                            #{index + 1}
                                        </span>
                                        <div>
                                            <div className="flex items-center gap-1.5 font-medium text-white text-xs">
                                                <span>{venue.name}</span>
                                                <Link
                                                    href={`/${venue.slug}/menu`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[#6B6A65] hover:text-blue-400 transition-colors">
                                                    <ExternalLink size={11} />
                                                </Link>
                                            </div>
                                            <span className="text-[10px] text-[#6B6A65]">{venue.ownerEmail}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold font-mono text-amber-400">
                                            {venue.viewsCount.toLocaleString()}
                                        </span>
                                        <span className="block text-[10px] text-[#6B6A65]">menu views</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Top Venues by Orders Volume */}
            <div className="rounded-3xl border border-white/10 bg-[#141417]/80 p-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                            <ShoppingBag size={16} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-white">
                                Top Order Volume
                            </h2>
                            <p className="text-xs text-[#94938D]">
                                Venues with highest table orders and sales
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    {topByOrders.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[#6B6A65]">
                            No order activity recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topByOrders.map((venue, index) => (
                                <div
                                    key={venue.id}
                                    className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-xs font-mono font-bold text-[#94938D]">
                                            #{index + 1}
                                        </span>
                                        <div>
                                            <div className="flex items-center gap-1.5 font-medium text-white text-xs">
                                                <span>{venue.name}</span>
                                                <Link
                                                    href={`/${venue.slug}/menu`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[#6B6A65] hover:text-blue-400 transition-colors">
                                                    <ExternalLink size={11} />
                                                </Link>
                                            </div>
                                            <span className="text-[10px] text-[#6B6A65]">{venue.ownerEmail}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold font-mono text-emerald-400">
                                            ${venue.totalSales.toFixed(2)}
                                        </span>
                                        <span className="block text-[10px] text-[#6B6A65] font-mono">
                                            {venue.ordersCount} orders
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
