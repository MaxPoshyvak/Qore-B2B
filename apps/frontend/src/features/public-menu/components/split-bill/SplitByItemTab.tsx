'use client';

import { useMemo, useState } from 'react';
import { Check, CheckSquare, Loader2, Lock, Square } from 'lucide-react';
import { formatPrice } from '@/shared/lib/utils';
import { cn } from '@/shared/lib/utils';
import type { OrderBillItemResponse } from '@my-app/types';
import { TipSelector } from '../TipSelector';
import { useCreateItemSplit } from '../../hooks/useOrderPayment';

type SplitByItemTabProps = {
    orderId: string;
    items: OrderBillItemResponse[];
    guestSessionId: string;
    guestName?: string | null;
};

export function SplitByItemTab({
    orderId,
    items,
    guestSessionId,
    guestName,
}: SplitByItemTabProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [tipAmount, setTipAmount] = useState(0);

    const itemSplitMutation = useCreateItemSplit(orderId);

    // Filter items that can be paid (not paid and not locked by another guest)
    const payableItems = useMemo(() => {
        return items.filter((i) => !i.paidByGuestId && (!i.isLocked || i.lockedBySessionId === guestSessionId));
    }, [items, guestSessionId]);

    // Calculate sum of selected items
    const selectedSum = useMemo(() => {
        return items
            .filter((i) => selectedIds.includes(i.id))
            .reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);
    }, [items, selectedIds]);

    const totalToCharge = selectedSum + tipAmount;

    function toggleItem(id: string) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
    }

    function selectAllMine() {
        const mine = payableItems.filter((i) => i.isMine).map((i) => i.id);
        setSelectedIds(mine);
    }

    function selectAllAvailable() {
        const all = payableItems.map((i) => i.id);
        setSelectedIds(all);
    }

    function handlePay() {
        if (selectedIds.length === 0) return;

        itemSplitMutation.mutate(
            {
                itemIds: selectedIds,
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
            {/* Quick action buttons */}
            <div className="flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={selectAllMine}
                    className="text-xs font-semibold text-[#2563EB] transition-colors [@media(hover:hover)]:hover:text-[#1D4ED8] dark:text-[#60A5FA]">
                    Select my dishes
                </button>
                <button
                    type="button"
                    onClick={selectAllAvailable}
                    className="text-xs font-medium text-[#6B6A65] transition-colors [@media(hover:hover)]:hover:text-[#0A0A0C] dark:text-[#94938D] dark:[@media(hover:hover)]:hover:text-[#F5F4F2]">
                    Select all unpaid
                </button>
            </div>

            {/* List of items */}
            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                {items.map((item) => {
                    const isPaid = Boolean(item.paidByGuestId);
                    const isLockedByOther = item.isLocked && item.lockedBySessionId !== guestSessionId;
                    const isSelected = selectedIds.includes(item.id);
                    const isDisabled = isPaid || isLockedByOther;

                    return (
                        <div
                            key={item.id}
                            onClick={() => {
                                if (!isDisabled) toggleItem(item.id);
                            }}
                            className={cn(
                                'flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors',
                                isDisabled
                                    ? 'border-black/5 bg-black/[0.01] opacity-50 dark:border-white/5 dark:bg-white/[0.01]'
                                    : isSelected
                                      ? 'cursor-pointer border-[#3B82F6] bg-[#3B82F6]/5 dark:border-[#60A5FA]'
                                      : 'cursor-pointer border-black/10 bg-white/60 [@media(hover:hover)]:hover:bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]',
                            )}>
                            <div className="flex items-center gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#2563EB] dark:text-[#60A5FA]">
                                    {isPaid ? (
                                        <Check size={16} className="text-[#10B981]" />
                                    ) : isLockedByOther ? (
                                        <Lock size={15} className="text-amber-500" />
                                    ) : isSelected ? (
                                        <CheckSquare size={18} />
                                    ) : (
                                        <Square size={18} className="text-[#9C9B95]" />
                                    )}
                                </span>

                                <div className="leading-tight">
                                    <p className="text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                        {item.quantity > 1 && (
                                            <span className="font-bold">×{item.quantity} </span>
                                        )}
                                        {item.menuItemName}
                                    </p>
                                    <div className="flex items-center gap-2 pt-0.5">
                                        {isPaid ? (
                                            <span className="text-[10px] font-bold text-[#10B981]">
                                                Paid
                                            </span>
                                        ) : isLockedByOther ? (
                                            <span className="text-[10px] font-bold text-amber-500">
                                                In checkout...
                                            </span>
                                        ) : item.isMine ? (
                                            <span className="text-[10px] font-medium text-[#3B82F6] dark:text-[#60A5FA]">
                                                Your dish
                                            </span>
                                        ) : item.guestName ? (
                                            <span className="text-[10px] text-[#6B6A65] dark:text-[#94938D]">
                                                {item.guestName}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <span className="text-sm font-semibold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]">
                                {formatPrice(item.priceAtOrder * item.quantity)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Tip selector (enabled when items are selected) */}
            {selectedSum > 0 && (
                <TipSelector
                    baseAmount={selectedSum}
                    tipAmount={tipAmount}
                    onTipChange={setTipAmount}
                />
            )}

            {itemSplitMutation.error && (
                <p className="text-center text-xs font-medium text-red-500">
                    {itemSplitMutation.error.message || 'Failed to start payment'}
                </p>
            )}

            {/* Pay button */}
            <button
                type="button"
                onClick={handlePay}
                disabled={itemSplitMutation.isPending || selectedIds.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity [@media(hover:hover)]:hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50">
                {itemSplitMutation.isPending ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Connecting to Stripe...
                    </>
                ) : selectedIds.length > 0 ? (
                    `Pay Selected (${selectedIds.length}) — ${formatPrice(totalToCharge)}`
                ) : (
                    'Select dishes to pay'
                )}
            </button>
        </div>
    );
}
