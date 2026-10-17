'use client';

import { CheckCircle2, User, XCircle } from 'lucide-react';
import type { PlatformUsersSummary } from '@my-app/types';

interface PlatformUsersTableProps {
    users: PlatformUsersSummary;
}

export function PlatformUsersTable({ users }: PlatformUsersTableProps) {
    const { recentUsers } = users;

    return (
        <div className="rounded-3xl border border-white/10 bg-[#141417]/80 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-400">
                        <User size={16} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-white">
                            Registered Users
                        </h2>
                        <p className="text-xs text-[#94938D]">
                            Latest registered accounts on the platform
                        </p>
                    </div>
                </div>
                <div className="text-xs text-[#94938D]">
                    Total users: <strong className="text-white font-mono">{users.totalUsers}</strong>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto">
                {recentUsers.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#6B6A65]">
                        No users registered yet.
                    </div>
                ) : (
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-white/5 text-[#6B6A65] uppercase tracking-wider text-[10px]">
                                <th className="pb-3 font-semibold">User Account</th>
                                <th className="pb-3 font-semibold">Verified</th>
                                <th className="pb-3 font-semibold">Owned Venues</th>
                                <th className="pb-3 font-semibold text-right">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recentUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 font-medium text-white">
                                        <span>{u.email}</span>
                                        {u.name && <span className="block text-[11px] text-[#94938D]">{u.name}</span>}
                                    </td>
                                    <td className="py-3">
                                        {u.isEmailVerified ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                                                <CheckCircle2 size={13} />
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/80">
                                                <XCircle size={13} />
                                                Unverified
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3">
                                        {u.tenants.length === 0 ? (
                                            <span className="text-[#6B6A65] text-[11px]">No venue</span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {u.tenants.map((t) => (
                                                    <span
                                                        key={t.id}
                                                        className="inline-flex items-center rounded-lg bg-white/5 px-2 py-0.5 text-[10px] text-[#F5F4F2] border border-white/5">
                                                        {t.name} ({t.subscriptionPlan})
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 text-right font-mono text-[11px] text-[#94938D]">
                                        {new Date(u.createdAt).toLocaleDateString()}
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
