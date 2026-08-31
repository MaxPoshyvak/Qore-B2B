'use client';

import { motion, type Variants } from 'framer-motion';
import { Minus, Plus, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import type { MenuItemResponse, CartItemResponse } from '@my-app/types';

import { formatPrice } from '@/shared/lib/utils';
import { display } from '@/shared/lib/fonts';
import { useCartStore } from '../store/useCartStore';
import { useTableSessionStore } from '@/shared/store/useTableSessionStore';
import { useUpdateCartItem } from '../hooks/useSharedCart';
import { GlowCard } from '@/shared/ui/GlowCard';
import { TiltCard } from '@/shared/ui/TiltCard';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';

// Inherit the stagger variants from the parent list.
type PublicMenuItemProps = {
    item: MenuItemResponse;
    tableId: string | null;
    takeawaySessionId: string | null;
    cartItems: CartItemResponse[];
    variants?: Variants;
    /**
     * Якщо передано — показуємо оригінальну ціну перекресленою
     * та нову ціну у фірмовому бурштиновому кольорі.
     */
    discountedPrice?: number;
    /** Текст бейджа знижки ("20% off", "$5 off"). */
    discountBadge?: string;
};

export function PublicMenuItem({
    item,
    tableId,
    takeawaySessionId,
    cartItems,
    variants,
    discountedPrice,
    discountBadge,
}: PublicMenuItemProps) {
    const guestName = useCartStore((s) => s.guestName);
    const setPendingMenuItem = useCartStore((s) => s.setPendingMenuItem);
    const setOrderTypeModalOpen = useCartStore((s) => s.setOrderTypeModalOpen);
    const setNameModalOpen = useCartStore((s) => s.setNameModalOpen);
    const guestSessionId = useTableSessionStore((s) => s.guestSessionId);
    const updateItem = useUpdateCartItem(tableId, takeawaySessionId);
    const isDesktop = useIsDesktop();

    // Image-less dishes use a standard glass card; image dishes use the solid
    // feature surface. Both sit inside a TiltCard + GlowCard for the premium feel.
    const hasImage = Boolean(item.imageUrl);

    // How many of THIS dish has the current guest added to the shared cart.
    const myRow = cartItems.find(
        (ci) => ci.menuItemId === item.id && ci.guestSessionId === guestSessionId,
    );
    const myQuantity = myRow?.quantity ?? 0;

    function handleAdd() {
        // No active cart yet (neither a scanned table nor a takeaway session):
        // ask the guest how they want to order before proceeding.
        if (!tableId && !takeawaySessionId) {
            setPendingMenuItem(item.id);
            setOrderTypeModalOpen(true);
            return;
        }
        // Queue the dish; the page coordinator fires the add once the guest is named.
        setPendingMenuItem(item.id);
        if (!guestName) setNameModalOpen(true);
    }

    function increment() {
        if (!myRow) return;
        updateItem.mutate({
            itemId: myRow.id,
            dto: { quantity: myRow.quantity + 1, guestSessionId },
        });
    }

    function decrement() {
        if (!myRow) return;
        updateItem.mutate({
            itemId: myRow.id,
            dto: { quantity: myRow.quantity - 1, guestSessionId },
        });
    }

    return (
        <motion.li variants={variants} className="h-full">
            <TiltCard strength={6} disabled={!isDesktop} className="h-full">
                <GlowCard
                    variant={hasImage ? 'solid' : 'glass'}
                    className="p-6">
                    <div className="flex h-full gap-5">
                        {/* Text block */}
                        <div className="flex min-w-0 flex-1 flex-col">
                            <h4
                                className={`${display.className} text-[17px] font-bold leading-snug tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                {item.name}
                            </h4>
                            {item.description && (
                                <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                    {item.description}
                                </p>
                            )}

                            {/*
                              STEP 2 fix: ціна та кнопки "кошика" рознесені у два
                              СТРОГІ контейнери. Ціна — `flex-1 min-w-0` (може
                              скорочуватись/переноситись), кнопки — `shrink-0 ml-auto`
                              (не стискаються і не перекриваються з ціною). Без
                              absolute-позиціонування, тож pointer events не блокуються.
                            */}
                            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                            <div className="min-w-0 flex-1">
                                {discountedPrice !== undefined ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-medium text-white/40 line-through">
                                            {formatPrice(item.price)}
                                        </span>
                                        <span className="text-lg font-bold text-[#F59E0B]">
                                            {formatPrice(discountedPrice)}
                                        </span>
                                        {discountBadge && (
                                            <span className="rounded-full bg-[#F59E0B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                {discountBadge}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                            {formatPrice(item.price)}
                                        </span>
                                    </div>
                                )}
                            </div>

                                <div className="ml-auto flex shrink-0 items-center">
                                    <motion.div layout className="flex items-center">
                                        {myQuantity === 0 ? (
                                            <motion.button
                                                key="add"
                                                type="button"
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.2 }}
                                                aria-label={`Add ${item.name} to your order`}
                                                onClick={handleAdd}
                                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#2563EB] transition-colors hover:border-[#3B82F6]/60 hover:bg-[#3B82F6]/20 disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#60A5FA]">
                                                <Plus size={16} strokeWidth={2.5} />
                                            </motion.button>
                                        ) : (
                                            <motion.div
                                                key="stepper"
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-center gap-1.5 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/5 px-1.5 py-1 dark:border-[#3B82F6]/30">
                                                <button
                                                    type="button"
                                                    onClick={decrement}
                                                    aria-label={`Decrease ${item.name}`}
                                                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#2563EB] transition-colors hover:bg-[#3B82F6]/10 dark:text-[#60A5FA]">
                                                    <Minus size={14} strokeWidth={2.5} />
                                                </button>
                                                <span className="w-4 text-center text-sm font-semibold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                    {myQuantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={increment}
                                                    aria-label={`Increase ${item.name}`}
                                                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#2563EB] transition-colors hover:bg-[#3B82F6]/10 dark:text-[#60A5FA]">
                                                    <Plus size={14} strokeWidth={2.5} />
                                                </button>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Dish media / placeholder */}
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#3B82F6]/20 via-[#8B5CF6]/12 to-transparent">
                            {hasImage ? (
                                <Image
                                    src={item.imageUrl as string}
                                    alt={item.name}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <UtensilsCrossed
                                        size={22}
                                        strokeWidth={1.5}
                                        className="text-[#3B82F6]/50 dark:text-[#8B5CF6]/60"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </GlowCard>
            </TiltCard>
        </motion.li>
    );
}
