'use client';

import { ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';
import type { PlatformTrafficSummary } from '@my-app/types';

interface PlatformTrafficTableProps {
    traffic: PlatformTrafficSummary;
}

export function PlatformTrafficTable({ traffic }: PlatformTrafficTableProps) {
    const totalViews = traffic.totalPageviews || 1;

    return (
        <div className="rounded-3xl border border-white/10 bg-[#141417]/80 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
                        <Globe size={16} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-white">
                            Traffic by Route
                        </h2>
                        <p className="text-xs text-[#94938D]">
                            Request volume and unique audience across website URLs
                        </p>
                    </div>
                </div>
                <div className="text-xs text-[#94938D]">
                    Total logged: <span className="text-white font-mono font-bold">{traffic.totalPageviews}</span>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto">
                {traffic.topRoutes.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#6B6A65]">
                        No traffic logged yet. Browse pages on your site to see live analytics!
                    </div>
                ) : (
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-white/5 text-[#6B6A65] uppercase tracking-wider text-[10px]">
                                <th className="pb-3 font-semibold">Route Path</th>
                                <th className="pb-3 font-semibold text-right">Pageviews</th>
                                <th className="pb-3 font-semibold text-right">Unique Visitors</th>
                                <th className="pb-3 font-semibold text-right w-36">Traffic Share</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {traffic.topRoutes.map((route) => {
                                const percentage = Math.min(
                                    100,
                                    Math.max(1, Math.round((route.pageviews / totalViews) * 100)),
                                );

                                return (
                                    <tr key={route.path} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 font-mono text-white flex items-center gap-2">
                                            <span className="truncate max-w-xs sm:max-w-md">{route.path}</span>
                                            <Link
                                                href={route.path}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="opacity-0 group-hover:opacity-100 text-[#94938D] hover:text-blue-400 transition-opacity">
                                                <ExternalLink size={12} />
                                            </Link>
                                        </td>
                                        <td className="py-3 text-right font-mono text-white font-semibold">
                                            {route.pageviews.toLocaleString()}
                                        </td>
                                        <td className="py-3 text-right font-mono text-[#94938D]">
                                            {route.uniqueVisitors.toLocaleString()}
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-20 bg-white/5 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono text-[11px] text-[#94938D] w-8 text-right">
                                                    {percentage}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
