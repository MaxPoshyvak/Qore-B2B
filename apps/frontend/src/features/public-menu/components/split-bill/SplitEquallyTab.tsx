'use client';

import { useState } from 'react';
import { Loader2, Minus, Plus, Users } from 'lucide-react';
import { formatPrice } from '@/shared/lib/utils';
import { TipSelector } from '../TipSelector';
import { useCreateEqualSplit } from '../../hooks/useOrderPayment';

type SplitEquallyTabProps = {
    orderId: string;
    totalAmount: number;
    remainingAmount: number;
    guestSessionId: string;
    guestName?: string | null;
};

export function SplitEquallyTab({
    orderId,
    totalAmount,
    remainingAmount,
    guestSessionId,
    guestName,
}: SplitEquallyTabProps) {
    const [totalParts, setTotalParts] = useState(2);
    const [tipAmount, setTipAmount] = useState(0);

    const equalSplitMutation = useCreateEqualSplit(orderId);

    // Calculate exact share per guest
    const rawShare = Math.round((totalAmount / totalParts) * 100) / 100;
    const shareAmount = Math.min(remainingAmount, rawShare);
    const totalToCharge = shareAmount + tipAmount;

    function handlePay() {
        equalSplitMutation.mutate(
            {
                totalParts,
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

    return (
        <div className="flex flex-col gap-5">
            {/* Number of payers selector */}
            <div className="flex flex-col gap-2 rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                        <Users size={16} className="text-[#3B82F6]" />
                        Split between
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setTotalParts((p) => Math.max(2, p - 1))}
                            disabled={totalParts <= 2 || equalSplitMutation.isPending}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-[#0A0A0C] transition-colors disabled:opacity-30 [@media(hover:hover)]:hover:bg-black/5 dark:border-white/10 dark:text-[#F5F4F2] dark:[@media(hover:hover)]:hover:bg-white/10">
                            <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]">
                            {totalParts}
                        </span>
                        <button
                            type="button"
                            onClick={() => setTotalParts((p) => Math.min(12, p + 1))}
                            disabled={totalParts >= 12 || equalSplitMutation.isPending}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-[#0A0A0C] transition-colors disabled:opacity-30 [@media(hover:hover)]:hover:bg-black/5 dark:border-white/10 dark:text-[#F5F4F2] dark:[@media(hover:hover)]:hover:bg-white/10">
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                <div className="mt-2 flex items-baseline justify-between border-t border-black/5 pt-3 text-xs text-[#6B6A65] dark:border-white/5 dark:text-[#94938D]">
                    <span>Calculation ({formatPrice(totalAmount)} / {totalParts})</span>
                    <span className="text-sm font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                        {formatPrice(shareAmount)} each
                    </span>
                </div>
            </div>

            {/* Tip selector */}
            <TipSelector
                baseAmount={shareAmount}
                tipAmount={tipAmount}
                onTipChange={setTipAmount}
            />

            {equalSplitMutation.error && (
                <p className="text-center text-xs font-medium text-red-500">
                    {equalSplitMutation.error.message || 'Failed to start payment'}
                </p>
            )}

            {/* Pay button */}
            <button
                type="button"
                onClick={handlePay}
                disabled={equalSplitMutation.isPending || shareAmount <= 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity [@media(hover:hover)]:hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50">
                {equalSplitMutation.isPending ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Connecting to Stripe...
                    </>
                ) : (
                    `Pay My Share — ${formatPrice(totalToCharge)}`
                )}
            </button>
        </div>
    );
}
