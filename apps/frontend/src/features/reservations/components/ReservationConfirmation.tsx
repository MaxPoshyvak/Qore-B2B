'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CalendarDays, Users, User, Phone, RotateCcw, XCircle, Loader2 } from 'lucide-react';

import { type ReservationResponse } from '@my-app/types';
import { display, mono } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { useCancelReservation } from '../hooks/useReservations';

function formatWhen(iso: string): string {
    const d = new Date(iso);
    const date = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${date} · ${time}`;
}

export function ReservationConfirmation({
    reservation,
    onReset,
}: {
    reservation: ReservationResponse;
    onReset: () => void;
}) {
    const [cancelled, setCancelled] = useState(false);
    const cancel = useCancelReservation();

    async function handleCancel() {
        try {
            await cancel.mutateAsync(reservation.id);
            setCancelled(true);
        } catch {
            /* surfaced via disabled state / retry */
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mx-auto w-full max-w-xl rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
            <div className="flex flex-col items-center text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 18 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg shadow-[#3B82F6]/30">
                    {cancelled ? <XCircle size={30} strokeWidth={2} /> : <CheckCircle2 size={30} strokeWidth={2} />}
                </motion.div>

                <h1 className={`${display.className} mt-5 text-[24px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    {cancelled ? 'Reservation cancelled' : 'Reservation confirmed!'}
                </h1>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                    {cancelled
                        ? 'Your table has been released. We hope to see you another time.'
                        : 'We look forward to hosting you. A confirmation has been noted for your name.'}
                </p>
            </div>

            {!cancelled && (
                <div className="mt-6 space-y-3 rounded-2xl border border-[#E7E5E0]/80 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2.5 text-[13.5px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                        <CalendarDays size={15} className="text-[#3B82F6]" />
                        {formatWhen(reservation.reservedAt)}
                    </div>
                    <div className="flex items-center gap-2.5 text-[13.5px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                        <Users size={15} className="text-[#3B82F6]" />
                        {reservation.guestsCount} {reservation.guestsCount === 1 ? 'guest' : 'guests'}
                    </div>
                    <div className="flex items-center gap-2.5 text-[13.5px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                        <User size={15} className="text-[#3B82F6]" />
                        {reservation.guestName}
                    </div>
                    <div className="flex items-center gap-2.5 text-[13.5px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                        <Phone size={15} className="text-[#3B82F6]" />
                        {reservation.guestPhone}
                    </div>
                    {reservation.notes && (
                        <p className="border-t border-[#E7E5E0]/80 pt-3 text-[13px] text-[#6B6A65] dark:border-white/10 dark:text-[#94938D]">
                            {reservation.notes}
                        </p>
                    )}
                    <p className={`${mono.className} mt-1 text-[11px] uppercase tracking-widest text-[#9C9B95] dark:text-[#6E6D68]`}>
                        Ref {reservation.id.slice(-6).toUpperCase()}
                    </p>
                </div>
            )}

            <div className="mt-6 flex flex-col gap-2.5">
                {!cancelled && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={cancel.isPending}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/5 px-5 py-3 text-[13.5px] font-semibold text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-60">
                        {cancel.isPending ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                        1-Click Cancel
                    </button>
                )}
                <button
                    type="button"
                    onClick={onReset}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E7E5E0] bg-white/70 px-5 py-3 text-[13.5px] font-semibold text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-white/15 dark:bg-white/[0.04] dark:text-[#F5F4F2]">
                    <RotateCcw size={15} />
                    Make another reservation
                </button>
            </div>
        </motion.div>
    );
}
