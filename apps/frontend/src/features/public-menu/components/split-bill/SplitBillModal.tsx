'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, SplitSquareHorizontal, Users, UtensilsCrossed, X } from 'lucide-react';
import { display, mono } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { cn } from '@/shared/lib/utils';
import type { OrderBillStatusResponse } from '@my-app/types';
import { SplitProgressBar } from './SplitProgressBar';
import { SplitEquallyTab } from './SplitEquallyTab';
import { SplitByItemTab } from './SplitByItemTab';
import { useUnlockItems } from '../../hooks/useOrderPayment';

type SplitBillModalProps = {
    open: boolean;
    onClose: () => void;
    bill: OrderBillStatusResponse;
    guestSessionId: string;
    guestName?: string | null;
};

type SplitMode = 'equal' | 'by_item';

export function SplitBillModal({
    open,
    onClose,
    bill,
    guestSessionId,
    guestName,
}: SplitBillModalProps) {
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<SplitMode>('equal');

    const unlockMutation = useUnlockItems(bill.orderId);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll and handle Escape key
    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') handleClose();
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    function handleClose() {
        // Release any held locks on close
        unlockMutation.mutate(guestSessionId);
        onClose();
    }

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-[2rem] border border-white/60 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#121215]/95 sm:rounded-[2rem]">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 dark:border-white/5">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3B82F6]/10 text-[#3B82F6]">
                                    <SplitSquareHorizontal size={18} />
                                </span>
                                <div>
                                    <h3 className={`${display.className} text-lg font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                        Split the Bill
                                    </h3>
                                    <p className={`${mono.className} text-[11px] text-[#6B6A65] dark:text-[#94938D]`}>
                                        {bill.tableName ? `Table ${bill.tableName} · ` : ''}
                                        Order #{bill.orderId.slice(-6).toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label="Close"
                                className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B6A65] transition-colors [@media(hover:hover)]:hover:bg-black/5 dark:text-[#94938D] dark:[@media(hover:hover)]:hover:bg-white/10">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                            {/* Bill progress bar */}
                            <SplitProgressBar
                                totalAmount={bill.totalAmount}
                                paidAmount={bill.paidAmount}
                            />

                            {/* Mode Segmented Controls */}
                            <div className="my-4 grid grid-cols-2 gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/5">
                                <button
                                    type="button"
                                    onClick={() => setMode('equal')}
                                    className={cn(
                                        'flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all duration-150',
                                        mode === 'equal'
                                            ? 'bg-white text-[#0A0A0C] shadow-sm dark:bg-[#1E1E24] dark:text-[#F5F4F2]'
                                            : 'text-[#6B6A65] [@media(hover:hover)]:hover:text-[#0A0A0C] dark:text-[#94938D] dark:[@media(hover:hover)]:hover:text-[#F5F4F2]',
                                    )}>
                                    <Users size={14} />
                                    Split Equally
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('by_item')}
                                    className={cn(
                                        'flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all duration-150',
                                        mode === 'by_item'
                                            ? 'bg-white text-[#0A0A0C] shadow-sm dark:bg-[#1E1E24] dark:text-[#F5F4F2]'
                                            : 'text-[#6B6A65] [@media(hover:hover)]:hover:text-[#0A0A0C] dark:text-[#94938D] dark:[@media(hover:hover)]:hover:text-[#F5F4F2]',
                                    )}>
                                    <UtensilsCrossed size={14} />
                                    Pay by Dish
                                </button>
                            </div>

                            {/* Active Tab */}
                            {mode === 'equal' ? (
                                <SplitEquallyTab
                                    orderId={bill.orderId}
                                    totalAmount={bill.totalAmount}
                                    remainingAmount={bill.remainingAmount}
                                    guestSessionId={guestSessionId}
                                    guestName={guestName}
                                />
                            ) : (
                                <SplitByItemTab
                                    orderId={bill.orderId}
                                    items={bill.items}
                                    guestSessionId={guestSessionId}
                                    guestName={guestName}
                                />
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
