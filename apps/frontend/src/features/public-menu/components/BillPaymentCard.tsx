'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, Receipt, SplitSquareHorizontal } from 'lucide-react';
import { display, mono } from '@/shared/lib/fonts';
import { formatPrice } from '@/shared/lib/utils';
import { EASE } from '@/shared/config/animations';
import { TipSelector } from './TipSelector';
import { SplitProgressBar } from './split-bill/SplitProgressBar';
import { SplitBillModal } from './split-bill/SplitBillModal';
import { PaymentSuccessReceipt } from './PaymentSuccessReceipt';
import { useCreateFullPayment, useOrderBill } from '../hooks/useOrderPayment';

type BillPaymentCardProps = {
    orderId: string;
    guestSessionId: string;
    guestName?: string | null;
    isDineIn?: boolean;
};

export function BillPaymentCard({
    orderId,
    guestSessionId,
    guestName,
    isDineIn = true,
}: BillPaymentCardProps) {
    const { data: bill, isLoading } = useOrderBill(orderId, guestSessionId);
    const payFullMutation = useCreateFullPayment(orderId);

    const [tipAmount, setTipAmount] = useState(0);
    const [splitModalOpen, setSplitModalOpen] = useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);

    if (isLoading || !bill) {
        return (
            <div className="mt-4 h-48 animate-pulse rounded-[2rem] bg-white/40 dark:bg-white/5" />
        );
    }

    const isFullyPaid = bill.paymentStatus === 'paid';
    const isPartiallyPaid = bill.paymentStatus === 'partially_paid';
    const remaining = bill.remainingAmount;
    const totalToCharge = remaining + tipAmount;

    function handlePayFull() {
        payFullMutation.mutate(
            {
                tipAmount,
                guestSessionId,
                guestName: guestName ?? undefined,
                originUrl: window.location.href.split('?')[0],
            },
            {
                onSuccess: (data) => {
                    window.location.href = data.url;
                },
            },
        );
    }

    if (isFullyPaid) {
        return (
            <>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="mt-4 rounded-[2rem] border border-[#10B981]/30 bg-[#10B981]/5 px-6 py-5 text-center shadow-lg backdrop-blur-2xl dark:border-[#10B981]/20 dark:bg-[#10B981]/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981]">
                                <Receipt size={20} />
                            </span>
                            <div className="text-left leading-tight">
                                <p className="text-xs uppercase tracking-wider text-[#059669] dark:text-[#34D399]">
                                    Bill Settled
                                </p>
                                <p className="text-sm font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    {formatPrice(bill.totalAmount)} Paid in Full
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setReceiptModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-semibold text-[#0A0A0C] shadow-sm transition-colors [@media(hover:hover)]:hover:bg-white dark:border-white/10 dark:bg-[#141417]/80 dark:text-[#F5F4F2] dark:[@media(hover:hover)]:hover:bg-[#141417]">
                            <Receipt size={14} />
                            View Receipt
                        </button>
                    </div>
                </motion.div>

                <PaymentSuccessReceipt
                    open={receiptModalOpen}
                    onClose={() => setReceiptModalOpen(false)}
                    bill={bill}
                />
            </>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mt-4 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
                <div className="flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-[#3B82F6]" />
                        <h3 className={`${display.className} text-[16px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Bill &amp; Payment
                        </h3>
                    </div>

                    <span
                        className={`${mono.className} text-xs font-semibold uppercase tracking-wider ${
                            isPartiallyPaid ? 'text-amber-500' : 'text-[#6B6A65] dark:text-[#94938D]'
                        }`}>
                        {isPartiallyPaid ? 'Partially Paid' : 'Unpaid'}
                    </span>
                </div>

                <div className="mt-4 space-y-4">
                    {/* Progress Bar for partially paid bills */}
                    {isPartiallyPaid && (
                        <SplitProgressBar
                            totalAmount={bill.totalAmount}
                            paidAmount={bill.paidAmount}
                        />
                    )}

                    {/* Balance breakdown */}
                    <div className="flex items-baseline justify-between text-sm">
                        <span className="text-[#6B6A65] dark:text-[#94938D]">
                            {isPartiallyPaid ? 'Remaining to Pay' : 'Total Amount'}
                        </span>
                        <span className={`${display.className} text-xl font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            {formatPrice(remaining)}
                        </span>
                    </div>

                    {/* Tip Selector */}
                    <TipSelector
                        baseAmount={remaining}
                        tipAmount={tipAmount}
                        onTipChange={setTipAmount}
                    />

                    {payFullMutation.error && (
                        <p className="text-center text-xs font-medium text-red-500">
                            {payFullMutation.error.message || 'Payment initiation failed'}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={handlePayFull}
                            disabled={payFullMutation.isPending || remaining <= 0}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity [@media(hover:hover)]:hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50">
                            {payFullMutation.isPending ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Opening Checkout...
                                </>
                            ) : (
                                `Pay ${isPartiallyPaid ? 'Remaining' : 'Full Bill'} — ${formatPrice(totalToCharge)}`
                            )}
                        </button>

                        {/* Split Bill CTA: available for dine-in tables with remaining items */}
                        {isDineIn && bill.items.length > 1 && remaining > 0 && (
                            <button
                                type="button"
                                onClick={() => setSplitModalOpen(true)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/5 px-5 py-3 text-sm font-semibold text-[#2563EB] transition-colors [@media(hover:hover)]:hover:border-[#3B82F6]/60 dark:text-[#60A5FA]">
                                <SplitSquareHorizontal size={16} />
                                Split Bill (Equally or by Dish)
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Split Bill Modal */}
            <SplitBillModal
                open={splitModalOpen}
                onClose={() => setSplitModalOpen(false)}
                bill={bill}
                guestSessionId={guestSessionId}
                guestName={guestName}
            />

            {/* Receipt Modal (if opened) */}
            <PaymentSuccessReceipt
                open={receiptModalOpen}
                onClose={() => setReceiptModalOpen(false)}
                bill={bill}
            />
        </>
    );
}
