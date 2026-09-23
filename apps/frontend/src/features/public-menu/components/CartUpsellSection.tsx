'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Sparkles, UtensilsCrossed } from 'lucide-react';
import type { MenuItemResponse } from '@my-app/types';

import { formatPrice } from '@/shared/lib/utils';
import { useCartStore } from '../store/useCartStore';
import { useTableSessionStore } from '@/shared/store/useTableSessionStore';
import { useAddCartItem } from '../hooks/useSharedCart';
import { useCartUpsell } from '../hooks/useCartUpsell';
import { pickBestDiscount, type ActiveHappyHourRule } from '../hooks/usePublicHappyHour';

export interface CartUpsellSectionProps {
    venueSlug: string;
    cartItemIds: string[];
    isDrawerOpen: boolean;
    tableId: string | null;
    takeawaySessionId: string | null;
    activeHappyHourRules?: ActiveHappyHourRule[];
    onSelectUpsellItem: (item: MenuItemResponse) => void;
}

export function CartUpsellSection({
    venueSlug,
    cartItemIds,
    isDrawerOpen,
    tableId,
    takeawaySessionId,
    activeHappyHourRules = [],
    onSelectUpsellItem,
}: CartUpsellSectionProps) {
    const { recommendations, isLoading } = useCartUpsell({
        venueSlug,
        cartItemIds,
        isDrawerOpen,
    });

    const localSessionId = useTableSessionStore((s) => s.guestSessionId);
    const guestName = useCartStore((s) => s.guestName);
    const addItem = useAddCartItem(tableId, takeawaySessionId);

    const [addingItemId, setAddingItemId] = useState<string | null>(null);

    const handleDirectAdd = (item: MenuItemResponse) => {
        setAddingItemId(item.id);
        const guestSessionId = localSessionId || useTableSessionStore.getState().ensureGuestSessionId();
        addItem.mutate(
            {
                menuItemId: item.id,
                quantity: 1,
                guestSessionId,
                guestName: guestName || 'Guest',
                selectedOptionIds: [],
            },
            {
                onSettled: () => {
                    setAddingItemId(null);
                },
            },
        );
    };

    if (isLoading) {
        return (
            <div className="my-3 rounded-2xl border border-violet-500/10 bg-violet-500/[0.02] p-3.5 animate-pulse">
                <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <div className="h-4 w-4 rounded-full bg-violet-500/20" />
                        <div className="h-3 w-28 rounded bg-violet-500/15" />
                    </div>
                </div>
                <div className="h-14 w-full rounded-xl bg-black/5 dark:bg-white/5" />
            </div>
        );
    }

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div className="my-3 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-transparent p-3.5 backdrop-blur-md dark:border-violet-500/25 dark:bg-white/[0.02]">
            <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                        <Sparkles size={11} />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                        Chef's Pairings
                    </span>
                </div>
                <span className="text-[10px] font-medium text-[#6B6A65] dark:text-[#94938D]">
                    AI Recommended
                </span>
            </div>

            <ul className="flex flex-col gap-2.5">
                {recommendations.map((rec) => {
                    const discount = pickBestDiscount(rec.item, activeHappyHourRules);
                    const basePrice = Number.parseFloat(rec.item.price);
                    const finalPrice = discount ? discount.finalPrice : basePrice;
                    const isPendingThis = addingItemId === rec.item.id;

                    return (
                        <li
                            key={rec.item.id}
                            className="flex items-center gap-3 rounded-xl border border-violet-500/10 bg-white/70 p-2.5 transition-colors dark:border-white/5 dark:bg-white/[0.03]">
                            {/* Thumbnail */}
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10">
                                {rec.item.imageUrl ? (
                                    <Image
                                        src={rec.item.imageUrl}
                                        alt={rec.item.name}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <UtensilsCrossed size={16} className="text-violet-500/50" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 text-[11px] font-medium italic text-violet-600 dark:text-violet-400">
                                    &ldquo;{rec.pairingReason}&rdquo;
                                </p>
                                <p className="truncate text-xs font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    {rec.item.name}
                                </p>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                    <span
                                        className={
                                            discount
                                                ? 'text-xs font-semibold text-[#F59E0B] tabular-nums'
                                                : 'text-xs font-medium text-[#6B6A65] dark:text-[#94938D] tabular-nums'
                                        }>
                                        {formatPrice(finalPrice)}
                                    </span>
                                    {discount && (
                                        <span className="text-[10px] text-[#A8A6A0] line-through tabular-nums dark:text-[#5A5A56]">
                                            {formatPrice(basePrice)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Button */}
                            {rec.hasRequiredModifiers ? (
                                <button
                                    type="button"
                                    onClick={() => onSelectUpsellItem(rec.item)}
                                    aria-label={`Customize and add ${rec.item.name}`}
                                    className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition-colors [@media(hover:hover)]:hover:bg-violet-500/20 dark:border-violet-500/40 dark:text-violet-300">
                                    <span>Options</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleDirectAdd(rec.item)}
                                    disabled={isPendingThis || addItem.isPending}
                                    aria-label={`Add ${rec.item.name} to cart`}
                                    className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-600/20 transition-all [@media(hover:hover)]:hover:bg-violet-700 dark:bg-violet-500 dark:[@media(hover:hover)]:hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50">
                                    {isPendingThis ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        <Plus size={13} strokeWidth={2.5} />
                                    )}
                                    <span>Add</span>
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
