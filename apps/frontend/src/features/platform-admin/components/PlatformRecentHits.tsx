'use client';

import { Activity, Clock, Compass } from 'lucide-react';
import type { PlatformTrafficSummary } from '@my-app/types';

interface PlatformRecentHitsProps {
    traffic: PlatformTrafficSummary;
}

export function PlatformRecentHits({ traffic }: PlatformRecentHitsProps) {
    const { recentHits } = traffic;

    const formatTimeAgo = (dateStr: string) => {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        if (diffSecs < 10) return 'just now';
        if (diffSecs < 60) return `${diffSecs}s ago`;
        const diffMins = Math.floor(diffSecs / 60);
        if (diffMins < 60) return `${diffMins}m ago`;
        return `${Math.floor(diffMins / 60)}h ago`;
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-[#141417]/80 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
                        <Activity size={16} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-white">
                            Live Stream (Recent Hits)
                        </h2>
                        <p className="text-xs text-[#94938D]">
                            Real-time incoming requests from visitors
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Auto-refreshing (15s)
                </div>
            </div>

            <div className="mt-4">
                {recentHits.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#6B6A65]">
                        No recent hits recorded.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentHits.map((hit) => (
                            <div
                                key={hit.id}
                                className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors text-xs">
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                    <span className="font-mono text-blue-400 font-semibold truncate max-w-xs sm:max-w-md">
                                        {hit.path}
                                    </span>
                                    {hit.referrer && (
                                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[#6B6A65] truncate max-w-[140px]">
                                            <Compass size={10} />
                                            {hit.referrer}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-mono text-[10px] text-[#6B6A65]">
                                        {hit.visitorId.slice(0, 10)}...
                                    </span>
                                    <span className="flex items-center gap-1 font-mono text-[10px] text-[#94938D]">
                                        <Clock size={10} />
                                        {formatTimeAgo(hit.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
