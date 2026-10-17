'use client';

import { Crown, ExternalLink, Mail } from 'lucide-react';
import Link from 'next/link';
import type { PlatformSubscriptionsSummary } from '@my-app/types';

interface PlatformSubscriptionsTableProps {
    subscriptions: PlatformSubscriptionsSummary;
}

export function PlatformSubscriptionsTable({ subscriptions }: PlatformSubscriptionsTableProps) {
    const { paidTenants } = subscriptions;

    return (
        <div className="rounded-3xl border border-white/10 bg-[#141417]/80 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-purple-400">
                        <Crown size={16} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-white">
                            Subscribed Customers
                        </h2>
                        <p className="text-xs text-[#94938D]">
                            Active Pro and Business tier SaaS subscribers
                        </p>
                    </div>
                </div>
                <div className="text-xs text-purple-400 font-semibold">
                    {paidTenants.length} paying {paidTenants.length === 1 ? 'account' : 'accounts'}
                </div>
            </div>

            <div className="mt-4 overflow-x-auto">
                {paidTenants.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#6B6A65]">
                        No paid subscriptions yet. When users upgrade to Pro or Business via Stripe, they appear here.
                    </div>
                ) : (
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-white/5 text-[#6B6A65] uppercase tracking-wider text-[10px]">
                                <th className="pb-3 font-semibold">Venue / Business</th>
                                <th className="pb-3 font-semibold">Tier</th>
                                <th className="pb-3 font-semibold">Owner Email</th>
                                <th className="pb-3 font-semibold">Stripe ID</th>
                                <th className="pb-3 font-semibold text-right">Subscribed Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paidTenants.map((tenant) => (
                                <tr key={tenant.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 font-medium text-white">
                                        <div className="flex items-center gap-2">
                                            <span>{tenant.name}</span>
                                            <Link
                                                href={`/${tenant.slug}/menu`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[#6B6A65] hover:text-blue-400 transition-colors">
                                                <ExternalLink size={12} />
                                            </Link>
                                        </div>
                                        <span className="text-[10px] text-[#6B6A65] font-mono">/{tenant.slug}</span>
                                    </td>
                                    <td className="py-3">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                                tenant.plan === 'business'
                                                    ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                                                    : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                                            }`}>
                                            {tenant.plan}
                                        </span>
                                    </td>
                                    <td className="py-3 text-[#94938D]">
                                        <div className="flex items-center gap-1.5">
                                            <Mail size={12} className="text-[#6B6A65]" />
                                            <span>{tenant.owner.email}</span>
                                        </div>
                                        {tenant.owner.name && (
                                            <span className="text-[10px] text-[#6B6A65] block">{tenant.owner.name}</span>
                                        )}
                                    </td>
                                    <td className="py-3 font-mono text-[11px] text-[#6B6A65]">
                                        {tenant.stripeSubscriptionId ? (
                                            <span className="truncate max-w-[120px] inline-block" title={tenant.stripeSubscriptionId}>
                                                {tenant.stripeSubscriptionId}
                                            </span>
                                        ) : (
                                            'Manual / Comped'
                                        )}
                                    </td>
                                    <td className="py-3 text-right font-mono text-[11px] text-[#94938D]">
                                        {new Date(tenant.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
