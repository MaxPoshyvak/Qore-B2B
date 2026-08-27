'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Info, Clock } from 'lucide-react';

import { type ReservationResponse } from '@my-app/types';
import { useTableUpcomingReservation } from '../hooks/useReservations';

function formatTime(iso: string): string {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Soft warning shown on the public menu when the scanned table has a reservation
 * starting within the next 45 minutes. Non-blocking — the menu stays fully usable.
 */
export function ReservationAlert({ slug, tableId }: { slug: string; tableId: string | null }) {
    const { data: upcoming } = useTableUpcomingReservation(slug, tableId);
    const reservation: ReservationResponse | null = upcoming ?? null;

    return (
        <AnimatePresence>
            {reservation && (
                <motion.div
                    initial={{ opacity: 0, y: -12, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -12, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden">
                    <div className="flex items-start gap-3 rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/[0.08] px-4 py-3 dark:border-[#F59E0B]/20 dark:bg-[#F59E0B]/[0.06]">
                        <Info size={18} className="mt-0.5 shrink-0 text-[#F59E0B]" />
                        <p className="text-[13px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                            <span className="font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                Attention: This table is reserved for {formatTime(reservation.reservedAt)}.
                            </span>{' '}
                            Please keep this in mind, or kindly move to a free table.
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
