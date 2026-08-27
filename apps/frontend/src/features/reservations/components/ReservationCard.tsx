'use client';

import { motion } from 'framer-motion';
import { Clock, Users, User, Phone, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';

import { type ReservationResponse, type ReservationStatusType } from '@my-app/types';
import { display, mono } from '@/shared/lib/fonts';
import { type Table } from '@my-app/database';
import { TableAssignmentSelect } from './TableAssignmentSelect';

const STATUS_STYLES: Record<ReservationStatusType, string> = {
    pending: 'bg-[#F59E0B]/15 text-[#B45309] dark:text-[#FBBF24]',
    confirmed: 'bg-[#3B82F6]/15 text-[#2563EB] dark:text-[#60A5FA]',
    completed: 'bg-[#10B981]/15 text-[#04916C] dark:text-[#10B981]',
    cancelled: 'bg-black/5 text-[#9C9B95] dark:bg-white/5 dark:text-[#6E6D68]',
};

function formatTime(iso: string): string {
    const d = new Date(iso);
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${date} · ${time}`;
}

export function ReservationCard({
    reservation,
    tables,
    onAssign,
    isAssigning,
    onComplete,
    isCompleting,
    disabledTableIds,
}: {
    reservation: ReservationResponse;
    tables: Table[];
    onAssign: (tableId: string | null) => void;
    isAssigning?: boolean;
    onComplete?: () => void;
    isCompleting?: boolean;
    disabledTableIds?: string[];
}) {
    const isFinished = reservation.status === 'completed' || reservation.status === 'cancelled';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-white/60 bg-white/85 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className={`${display.className} text-[15px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        {reservation.guestName}
                    </h3>
                    <span className={`${mono.className} text-[10px] uppercase tracking-widest text-[#9C9B95] dark:text-[#6E6D68]`}>
                        {reservation.id.slice(-6).toUpperCase()}
                    </span>
                </div>
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLES[reservation.status]}`}>
                    {reservation.status}
                </span>
            </div>

            <div className="mt-3 space-y-1.5 border-t border-black/5 pt-3 text-[13.5px] dark:border-white/10">
                <div className="flex items-center gap-2 text-[#0A0A0C] dark:text-[#F5F4F2]">
                    <Clock size={14} className="text-[#3B82F6]" /> {formatTime(reservation.reservedAt)}
                </div>
                <div className="flex items-center gap-2 text-[#0A0A0C] dark:text-[#F5F4F2]">
                    <Users size={14} className="text-[#3B82F6]" /> {reservation.guestsCount} guests
                </div>
                <div className="flex items-center gap-2 text-[#6B6A65] dark:text-[#94938D]">
                    <Phone size={14} /> {reservation.guestPhone}
                </div>
                {reservation.notes && (
                    <div className="flex items-start gap-2 text-[#6B6A65] dark:text-[#94938D]">
                        <MessageSquare size={14} className="mt-0.5 shrink-0" /> {reservation.notes}
                    </div>
                )}
            </div>

            <div className="mt-3.5 flex items-center gap-2">
                {isAssigning && <Loader2 size={14} className="animate-spin text-[#9C9B95]" />}
                <div className="flex-1">
                    <TableAssignmentSelect
                        tables={tables}
                        currentTableId={reservation.tableId}
                        onAssign={onAssign}
                        disabled={isAssigning}
                        disabledTableIds={disabledTableIds}
                    />
                </div>
            </div>

            {!isFinished && onComplete && (
                <button
                    type="button"
                    onClick={onComplete}
                    disabled={isCompleting}
                    className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-2 text-[12.5px] font-semibold text-[#04916C] transition-colors hover:bg-[#10B981]/15 disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#10B981]">
                    {isCompleting ? (
                        <Loader2 size={13} className="animate-spin" />
                    ) : (
                        <CheckCircle2 size={14} />
                    )}
                    Mark as Completed
                </button>
            )}
        </motion.div>
    );
}
