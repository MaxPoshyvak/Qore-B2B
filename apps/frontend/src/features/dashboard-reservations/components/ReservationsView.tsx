'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, CalendarX, Clock } from 'lucide-react';

import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { useGetTenantBySlug } from '@/entities/tenant/hooks/useTenants';
import { useTables } from '@/features/dashboard-tables/hooks/useTables';
import { useTenantReservations, useUpdateReservation } from '@/features/reservations/hooks/useReservations';
import { ReservationCard } from '@/features/reservations/components/ReservationCard';
import type { ReservationResponse } from '@my-app/types';

function dateKey(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildFutureDays(): { key: string; weekday: string; day: string }[] {
    const days: { key: string; weekday: string; day: string }[] = [];
    const base = new Date();
    for (let i = 1; i <= 14; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        days.push({
            key: dateKey(d.toISOString()),
            weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
            day: String(d.getDate()),
        });
    }
    return days;
}

/**
 * Tables already assigned to an *active* reservation on the same day cannot be
 * picked again — this prevents double-booking. Completed/cancelled reservations
 * free their tables, so they are ignored here.
 */
function getDisabledTableIds(list: ReservationResponse[], currentId: string): string[] {
    const taken = new Set<string>();
    for (const r of list) {
        if (r.id === currentId) continue;
        const isActive = r.status === 'pending' || r.status === 'confirmed';
        if (isActive && r.tableId) taken.add(r.tableId);
    }
    return [...taken];
}

export function ReservationsView({ slug }: { slug: string }) {
    const resolvedSlug = slug ?? '';
    const { data: tenant } = useGetTenantBySlug(resolvedSlug);
    const tenantId = tenant?.data.id;

    const { data: tables = [] } = useTables(resolvedSlug);
    const { data: reservations = [], isLoading } = useTenantReservations(tenantId);

    const update = useUpdateReservation(tenantId ?? '');
    const [selectedFuture, setSelectedFuture] = useState<string | null>(null);
    const [completingId, setCompletingId] = useState<string | null>(null);

    const todayKey = dateKey(new Date().toISOString());

    const { today, future } = useMemo(() => {
        const todayList = reservations.filter((r) => dateKey(r.reservedAt) === todayKey);
        const futureList = reservations.filter((r) => dateKey(r.reservedAt) > todayKey);
        return { today: todayList, future: futureList };
    }, [reservations, todayKey]);

    const futureDays = useMemo(buildFutureDays, []);

    const activeFuture =
        selectedFuture ??
        futureDays.find((d) => future.some((r) => dateKey(r.reservedAt) === d.key))?.key ??
        futureDays[0]?.key ??
        null;

    const futureForSelected = future.filter((r) => dateKey(r.reservedAt) === activeFuture);

    function handleAssign(id: string, tableId: string | null) {
        update.mutate({ id, dto: { tableId } });
    }

    function handleComplete(id: string) {
        setCompletingId(id);
        update.mutate(
            { id, dto: { status: 'completed' } },
            { onSettled: () => setCompletingId(null) },
        );
    }

    return (
        <div className="space-y-10">
            {/* Today */}
            <section>
                <div className="mb-4 flex items-center gap-2">
                    <CalendarDays size={18} className="text-[#3B82F6]" />
                    <h2
                        className={`${display.className} text-[18px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        Today&apos;s Bookings
                    </h2>
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-black/5 px-1.5 text-[11px] font-semibold tabular-nums text-[#6B6A65] dark:bg-white/10 dark:text-[#94938D]">
                        {today.length}
                    </span>
                </div>
                {today.length === 0 ? (
                    <EmptyState label="No reservations for today." />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence initial={false}>
                            {today.map((r) => (
                                <ReservationCard
                                    key={r.id}
                                    reservation={r}
                                    tables={tables}
                                    onAssign={(tableId) => handleAssign(r.id, tableId)}
                                    isAssigning={update.isPending && completingId !== r.id}
                                    onComplete={() => handleComplete(r.id)}
                                    isCompleting={completingId === r.id}
                                    disabledTableIds={getDisabledTableIds(today, r.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </section>

            {/* Future */}
            <section>
                <div className="mb-4 flex items-center gap-2">
                    <CalendarDays size={18} className="text-[#8B5CF6]" />
                    <h2
                        className={`${display.className} text-[18px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        Future Bookings
                    </h2>
                </div>

                <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                    {futureDays.map((d) => {
                        const active = d.key === activeFuture;
                        const count = future.filter((r) => dateKey(r.reservedAt) === d.key).length;
                        return (
                            <button
                                key={d.key}
                                type="button"
                                onClick={() => setSelectedFuture(d.key)}
                                className={`flex shrink-0 flex-col items-center rounded-2xl border px-4 py-2.5 transition-colors ${
                                    active
                                        ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA]'
                                        : 'border-[#E7E5E0] bg-white/70 text-[#0A0A0C] hover:border-[#3B82F6]/40 dark:border-white/15 dark:bg-white/[0.04] dark:text-[#F5F4F2]'
                                }`}>
                                <span className="text-[11px] font-medium uppercase tracking-wider">{d.weekday}</span>
                                <span className="text-[18px] font-bold leading-none">{d.day}</span>
                                {count > 0 && (
                                    <span className="mt-1 text-[10px] font-semibold">{count} booked</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {futureForSelected.length === 0 ? (
                    <EmptyState label="No reservations on this day." />
                ) : (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence initial={false}>
                            {futureForSelected.map((r) => (
                                <ReservationCard
                                    key={r.id}
                                    reservation={r}
                                    tables={tables}
                                    onAssign={(tableId) => handleAssign(r.id, tableId)}
                                    isAssigning={update.isPending && completingId !== r.id}
                                    onComplete={() => handleComplete(r.id)}
                                    isCompleting={completingId === r.id}
                                    disabledTableIds={getDisabledTableIds(futureForSelected, r.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </section>
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E7E5E0] px-4 py-10 text-center dark:border-white/10">
            <CalendarX size={22} className="text-[#9C9B95] dark:text-[#6E6D68]" />
            <p className="text-[13px] text-[#9C9B95] dark:text-[#6E6D68]">{label}</p>
        </div>
    );
}
