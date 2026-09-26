'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Download, Receipt, X } from 'lucide-react';
import { display, mono } from '@/shared/lib/fonts';
import { formatPrice } from '@/shared/lib/utils';
import { EASE } from '@/shared/config/animations';
import type { OrderBillStatusResponse } from '@my-app/types';

type PaymentSuccessReceiptProps = {
    open: boolean;
    onClose: () => void;
    bill: OrderBillStatusResponse;
};

export function PaymentSuccessReceipt({ open, onClose, bill }: PaymentSuccessReceiptProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const latestTxn = bill.transactions[0];
    const isFullyPaid = bill.paymentStatus === 'paid';

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Receipt Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 16 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/60 bg-white/95 p-6 text-center shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#141417]/95">
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#6B6A65] transition-colors [@media(hover:hover)]:hover:bg-black/5 dark:text-[#94938D] dark:[@media(hover:hover)]:hover:bg-white/10">
                            <X size={16} />
                        </button>

                        {/* Animated Checkmark */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.1 }}
                            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981]">
                            <CheckCircle2 size={36} strokeWidth={2.5} />
                        </motion.div>

                        <h3 className={`${display.className} mt-4 text-xl font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Payment Confirmed!
                        </h3>
                        <p className="mt-1 text-xs text-[#6B6A65] dark:text-[#94938D]">
                            {isFullyPaid
                                ? 'The bill is completely settled. Thank you!'
                                : 'Your payment share was received successfully.'}
                        </p>

                        {/* Receipt details breakdown */}
                        <div className="mt-5 space-y-2.5 rounded-2xl border border-black/5 bg-black/[0.02] p-4 text-left text-xs dark:border-white/5 dark:bg-white/[0.02]">
                            <div className="flex justify-between">
                                <span className="text-[#6B6A65] dark:text-[#94938D]">Order ID</span>
                                <span className={`${mono.className} font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                    #{bill.orderId.slice(-6).toUpperCase()}
                                </span>
                            </div>

                            {bill.tableName && (
                                <div className="flex justify-between">
                                    <span className="text-[#6B6A65] dark:text-[#94938D]">Table</span>
                                    <span className="font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                        {bill.tableName}
                                    </span>
                                </div>
                            )}

                            {latestTxn && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-[#6B6A65] dark:text-[#94938D]">Amount Paid</span>
                                        <span className="font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                            {formatPrice(latestTxn.amount)}
                                        </span>
                                    </div>
                                    {latestTxn.tipAmount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-[#6B6A65] dark:text-[#94938D]">Tip</span>
                                            <span className="font-semibold text-[#10B981]">
                                                +{formatPrice(latestTxn.tipAmount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-black/5 pt-2 text-sm font-bold dark:border-white/5">
                                        <span className="text-[#0A0A0C] dark:text-[#F5F4F2]">Total Charged</span>
                                        <span className="text-[#2563EB] dark:text-[#60A5FA]">
                                            {formatPrice(latestTxn.totalCharged)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] py-3 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity [@media(hover:hover)]:hover:opacity-95">
                                Done
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
