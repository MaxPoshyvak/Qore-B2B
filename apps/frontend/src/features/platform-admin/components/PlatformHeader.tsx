'use client';

import { Activity, LogOut, RefreshCw, Server } from 'lucide-react';
import { Logo } from '@/shared/ui/Logo';

interface PlatformHeaderProps {
    onLogout: () => void;
    onRefresh: () => void;
    isFetching: boolean;
    serverTime?: string;
    uptimeSeconds?: number;
}

export function PlatformHeader({
    onLogout,
    onRefresh,
    isFetching,
    serverTime,
    uptimeSeconds,
}: PlatformHeaderProps) {
    const formatUptime = (seconds?: number) => {
        if (!seconds) return '—';
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m ${seconds % 60}s`;
    };

    return (
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0A0A0C]/80 backdrop-blur-xl px-4 sm:px-8 py-3.5">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Logo />
                    <div className="hidden h-5 w-px bg-white/10 sm:block" />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-tight text-white">
                            Platform HQ
                        </span>
                        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-400">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            Live Pulse
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-3 text-xs text-[#94938D]">
                        <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1">
                            <Server size={12} className="text-[#6B6A65]" />
                            <span>Uptime: <strong className="text-white font-mono">{formatUptime(uptimeSeconds)}</strong></span>
                        </div>
                        {serverTime && (
                            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#6B6A65]">
                                <span>{new Date(serverTime).toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={isFetching}
                        title="Refresh metrics now"
                        className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-[#94938D] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50">
                        <RefreshCw size={15} className={isFetching ? 'animate-spin text-blue-400' : ''} />
                    </button>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20">
                        <LogOut size={13} />
                        <span className="hidden sm:inline">Lock Session</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
