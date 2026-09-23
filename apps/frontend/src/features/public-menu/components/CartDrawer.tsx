'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Check, Loader2, Lock, Minus, Plus, Sparkles, Trash2, UtensilsCrossed, X } from 'lucide-react';

import { formatPrice } from '@/shared/lib/utils';
import { EASE } from '@/shared/config/animations';
import { display, mono } from '@/shared/lib/fonts';
import { useCartStore } from '../store/useCartStore';
import { useTableSessionStore } from '@/shared/store/useTableSessionStore';
import { useUpdateCartItem, useRemoveCartItem, useToggleCartReady } from '../hooks/useSharedCart';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';
import { type ActiveHappyHourRule } from '../hooks/usePublicHappyHour';
import { calculateCartTotal, priceCartLine } from '../lib/cart-pricing';
import { type CartItemResponse, type CartSessionResponse, type MenuItemResponse, parseSelectedModifiers } from '@my-app/types';
import { CartUpsellSection } from './CartUpsellSection';
import { GuestItemModal } from './GuestItemModal';

type CartGroup = {
    id: string;
    guestName: string;
    items: CartItemResponse[];
};

type CartDrawerProps = {
    cart: CartSessionResponse | undefined;
    tableId: string | null;
    takeawaySessionId: string | null;
    venueSlug?: string;
    /** True while the very first shared-cart fetch is still in flight. */
    isLoading?: boolean;
    /** Активні правила Happy Hour — щоб підсумок кошика враховував знижки. */
    activeHappyHourRules?: ActiveHappyHourRule[];
    /**
     * Викликається, коли гість (локальний) підтвердив замовлення і сервер
     * створив чек. Сторінка використовує `orderId`, щоб зробити `router.push`
     * на сторінку трекінгу `/[slug]/order/[id]`.
     */
    onOrderCreated?: (orderId: string) => void;
};

function groupByGuest(
    items: CartItemResponse[],
    localSessionId: string,
): CartGroup[] {
    const map = new Map<string, CartGroup>();
    for (const item of items) {
        const existing = map.get(item.guestSessionId);
        if (existing) {
            existing.items.push(item);
        } else {
            map.set(item.guestSessionId, {
                id: item.guestSessionId,
                guestName: item.guestName,
                items: [item],
            });
        }
    }

    return Array.from(map.values()).sort((a, b) => {
        // The current guest is always first.
        if (a.id === localSessionId) return -1;
        if (b.id === localSessionId) return 1;
        return a.guestName.localeCompare(b.guestName);
    });
}

/**
 * Ціна рядка кошика: `unitPrice × quantity` з урахуванням модифікаторів
 * і Happy Hour. Коли знижка діє — показуємо перекреслений subtotal, бейдж
 * і фінальну суму бурштиновим.
 */
function PriceTag({
    item,
    activeHappyHourRules,
}: {
    item: CartItemResponse;
    activeHappyHourRules: ActiveHappyHourRule[];
}) {
    if (!item.menuItem) return null;

    const { subtotal, lineTotal, discountRule } = priceCartLine(item, activeHappyHourRules);
    const subtotalLine = subtotal * item.quantity;

    if (!discountRule) {
        return (
            <p className="mt-0.5 text-xs tabular-nums text-[#6B6A65] dark:text-[#94938D]">
                {formatPrice(lineTotal)}
            </p>
        );
    }

    return (
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#F59E0B]">
                <Sparkles size={9} strokeWidth={2.5} />
                Happy Hour
            </span>
            <span className="text-xs tabular-nums text-[#A8A6A0] line-through dark:text-[#5A5A56]">
                {formatPrice(subtotalLine)}
            </span>
            <span className="text-xs font-semibold tabular-nums text-[#B45309] dark:text-[#F59E0B]">
                {formatPrice(lineTotal)}
            </span>
        </div>
    );
}

export function CartDrawer({
    cart,
    tableId,
    takeawaySessionId,
    venueSlug,
    isLoading = false,
    activeHappyHourRules = [],
    onOrderCreated,
}: CartDrawerProps) {
    const params = useParams<{ slug: string }>();
    const resolvedVenueSlug = venueSlug || params?.slug || '';
    const [upsellModalItem, setUpsellModalItem] = useState<MenuItemResponse | null>(null);

    const isOpen = useCartStore((s) => s.isCartDrawerOpen);
    const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
    const setNameModalOpen = useCartStore((s) => s.setNameModalOpen);
    const setTakeawayCheckoutOpen = useCartStore((s) => s.setTakeawayCheckoutOpen);
    const guestName = useCartStore((s) => s.guestName);

    const localSessionId = useTableSessionStore((s) => s.guestSessionId);
    const tableName = useTableSessionStore((s) => s.tableName);

    const updateItem = useUpdateCartItem(tableId, takeawaySessionId);
    const removeItem = useRemoveCartItem(tableId, takeawaySessionId);
    const toggleReady = useToggleCartReady(tableId ?? '');

    const isDesktop = useIsDesktop();

    const items = cart?.items ?? [];
    const cartItemIds = useMemo(() => {
        return items.map((i) => i.menuItemId).filter(Boolean);
    }, [items]);

    const confirmedGuests = cart?.confirmedGuests ?? [];
    // Only a settled payload may flip the drawer into its "order placed" layout.
    const isComplete = !isLoading && cart ? cart.isActive === false : false;
    const isTakeaway = cart ? Boolean(cart.isTakeaway) : Boolean(takeawaySessionId);
    const isMineConfirmed = !isTakeaway && confirmedGuests.includes(localSessionId);
    const confirmedCount = confirmedGuests.length;

    // Підсумок кошика: модифікатори + Happy Hour. Використовуємо ту саму
    // функцію, що й рядки, щоб рядки й загальна сума ніколи не розходились.
    const total = calculateCartTotal(items, activeHappyHourRules);
    const groups = useMemo(
        () => groupByGuest(items, localSessionId),
        [items, localSessionId],
    );
    const totalGuests = groups.length;

    const panelMotion = isDesktop
        ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
        : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } };

    return (
        <>
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setCartDrawerOpen(false)}
                        className="fixed inset-0 z-50 bg-[#08080A]/60 backdrop-blur-sm"
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Shared order"
                        {...panelMotion}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl border border-white/60 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#121215]/95 md:inset-x-auto md:bottom-0 md:right-0 md:top-0 md:h-full md:max-h-none md:max-w-none md:w-[400px] md:rounded-none md:border-l md:border-y-0 md:border-r-0 md:shadow-xl">
                        <div className="pointer-events-none absolute inset-x-6 top-2 h-1 rounded-full bg-black/10 dark:bg-white/15 md:hidden" />

                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-6">
                            <div className="flex flex-wrap items-center gap-2">
                                {tableName && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-medium text-[#2563EB] dark:text-[#93C5FD]">
                                        Table {tableName}
                                    </span>
                                )}
                                {guestName ? (
                                    <button
                                        type="button"
                                        onClick={() => setNameModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-medium text-[#0A0A0C] transition-colors hover:border-black/20 dark:border-white/15 dark:bg-white/10 dark:text-[#F5F4F2]">
                                        {guestName}
                                        <span className="text-[#6B6A65] dark:text-[#94938D]">Edit</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setNameModalOpen(true)}
                                        className="rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/5 px-3 py-1 text-xs font-medium text-[#2563EB] dark:text-[#93C5FD]">
                                        Add name
                                    </button>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setCartDrawerOpen(false)}
                                aria-label="Close cart"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#6B6A65] transition-colors hover:border-black/20 hover:text-[#0A0A0C] dark:border-white/10 dark:text-[#94938D] dark:hover:text-[#F5F4F2]">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Grouped guest lists */}
                        <div className="flex-1 overflow-y-auto px-5">
                            {isLoading ? (
                                <p className="flex items-center justify-center gap-2 py-10 text-sm text-[#6B6A65] dark:text-[#94938D]">
                                    <Loader2 size={14} className="animate-spin" />
                                    Loading the shared cart...
                                </p>
                            ) : groups.length === 0 ? (
                                <p className="py-10 text-center text-sm text-[#6B6A65] dark:text-[#94938D]">
                                    The shared cart is empty.
                                </p>
                            ) : (
                                <ul className="flex flex-col gap-6 pb-2">
                                    {groups.map((group) => {
                                        const isMine = group.id === localSessionId;
                                        const isGroupConfirmed = !isTakeaway && confirmedGuests.includes(group.id);
                                        return (
                                            <li key={group.id}>
                                                {/* Group header */}
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div className="relative shrink-0">
                                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-sm font-semibold text-white">
                                                            {group.guestName.charAt(0).toUpperCase()}
                                                        </span>
                                                        {isGroupConfirmed && (
                                                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#04916C] text-white shadow-sm ring-2 ring-white dark:bg-[#10B981] dark:ring-[#121215]">
                                                                <Check size={10} strokeWidth={3} />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p
                                                            className={`${display.className} text-[15px] font-bold leading-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                                            {group.guestName}
                                                            {isMine && (
                                                                <span
                                                                    className={`${mono.className} ml-1.5 text-[10px] font-medium uppercase tracking-widest text-[#3B82F6] dark:text-[#60A5FA]`}>
                                                                    (You)
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p
                                                            className={`${mono.className} mt-0.5 text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                                                            {group.items.length}{' '}
                                                            {group.items.length === 1 ? 'item' : 'items'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <ul className="flex flex-col gap-3">
                                                    {group.items.map((item) => (
                                                        <li
                                                            key={item.id}
                                                            className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                                                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#3B82F6]/20 via-[#8B5CF6]/12 to-transparent">
                                                                {item.menuItem?.imageUrl ? (
                                                                    <Image
                                                                        src={item.menuItem.imageUrl}
                                                                        alt={item.menuItem.name}
                                                                        fill
                                                                        sizes="56px"
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center">
                                                                        <UtensilsCrossed
                                                                            size={18}
                                                                            className="text-[#3B82F6]/50"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>

                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                                        {item.menuItem?.name ?? 'Removed item'}
                                                                    </p>
                                                                    {/* Обрані модифікатори — приглушений перелік */}
                                                                    {(() => {
                                                                        const modifiers = parseSelectedModifiers(
                                                                            item.selectedModifiers,
                                                                        );
                                                                        if (modifiers.length === 0) return null;
                                                                        return (
                                                                            <p className="mt-0.5 text-xs leading-snug text-[#9C9B95] dark:text-white/50">
                                                                                {modifiers
                                                                                    .map((option) => option.name)
                                                                                    .join(', ')}
                                                                            </p>
                                                                        );
                                                                    })()}
                                                                    <PriceTag item={item} activeHappyHourRules={activeHappyHourRules} />
                                                                    {!isMine && (
                                                                    <p className="mt-1 text-[11px] text-[#9C9B95] dark:text-[#6E6D68]">
                                                                        Added by {item.guestName}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {isMine && isMineConfirmed ? (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#04916C]/10 px-3 py-1.5 text-[12px] font-medium text-[#04916C] dark:text-[#10B981]">
                                                                    <Lock size={12} />
                                                                    Confirmed
                                                                </span>
                                                            ) : isMine ? (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateItem.mutate({
                                                                                itemId: item.id,
                                                                                dto: {
                                                                                    quantity: item.quantity - 1,
                                                                                    guestSessionId: localSessionId,
                                                                                },
                                                                            })
                                                                        }
                                                                        aria-label={`Decrease ${item.menuItem?.name}`}
                                                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-[#0A0A0C] transition-colors hover:border-black/20 dark:border-white/10 dark:text-[#F5F4F2]">
                                                                        <Minus size={14} />
                                                                    </button>
                                                                    <span className="w-5 text-center text-sm font-semibold tabular-nums">
                                                                        {item.quantity}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateItem.mutate({
                                                                                itemId: item.id,
                                                                                dto: {
                                                                                    quantity: item.quantity + 1,
                                                                                    guestSessionId: localSessionId,
                                                                                },
                                                                            })
                                                                        }
                                                                        aria-label={`Increase ${item.menuItem?.name}`}
                                                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#2563EB] transition-colors hover:border-[#3B82F6]/60 dark:text-[#60A5FA]">
                                                                        <Plus size={14} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeItem.mutate({
                                                                                itemId: item.id,
                                                                                guestSessionId: localSessionId,
                                                                            })
                                                                        }
                                                                        aria-label={`Remove ${item.menuItem?.name}`}
                                                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-red-500 transition-colors hover:border-red-400/40 hover:bg-red-500/5 dark:border-white/10">
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="rounded-full bg-black/5 px-2.5 py-1 text-sm font-semibold tabular-nums text-[#0A0A0C] dark:bg-white/10 dark:text-[#F5F4F2]">
                                                                    ×{item.quantity}
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}

                            {/* Chef's Pairings Upsell Section */}
                            {!isComplete && items.length > 0 && resolvedVenueSlug && (
                                <CartUpsellSection
                                    venueSlug={resolvedVenueSlug}
                                    cartItemIds={cartItemIds}
                                    isDrawerOpen={isOpen}
                                    tableId={tableId}
                                    takeawaySessionId={takeawaySessionId}
                                    activeHappyHourRules={activeHappyHourRules}
                                    onSelectUpsellItem={setUpsellModalItem}
                                />
                            )}
                        </div>

                        {/* Footer / Ready check */}
                        {!isComplete && (
                            <div className="border-t border-black/5 px-5 py-4 dark:border-white/10">
                                <div className="mb-3 flex items-center justify-between text-sm">
                                    <span className="text-[#6B6A65] dark:text-[#94938D]">Subtotal</span>
                                    <span className="font-semibold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]">
                                        {formatPrice(total)}
                                    </span>
                                </div>

                                {isTakeaway ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCartDrawerOpen(false);
                                            setTakeawayCheckoutOpen(true);
                                        }}
                                        disabled={items.length === 0 || isLoading}
                                        className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50">
                                        Proceed to Checkout
                                    </button>
                                ) : (
                                    <>
                                        {isMineConfirmed && (
                                            <p
                                                className={`${mono.className} mb-3 flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]`}>
                                                <Loader2 size={12} className="animate-spin" />
                                                Waiting for others ({confirmedCount}/{totalGuests} ready)...
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                                onClick={() =>
                                                    toggleReady.mutate(localSessionId, {
                                                        onSuccess: (data) => {
                                                            // Лише той гість, що натиснув «Confirm», має потрапити
                                                            // на трекінг: сервер кладе `createdOrderId` саме у відповідь
                                                            // на останній підтверджений тап.
                                                            if (data.createdOrderId) onOrderCreated?.(data.createdOrderId);
                                                        },
                                                    })
                                                }
                                            disabled={items.length === 0 || isLoading || toggleReady.isPending}
                                            className={
                                                isMineConfirmed
                                                    ? 'inline-flex w-full items-center justify-center rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/5 px-5 py-3.5 text-sm font-semibold text-[#2563EB] transition-colors hover:border-[#3B82F6]/60 dark:text-[#60A5FA] disabled:cursor-not-allowed disabled:opacity-50'
                                                    : 'inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50'
                                            }>
                                            {isMineConfirmed ? 'Unlock to add more items' : 'Confirm My Order'}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        {/* Modal for customizing upsell items with required modifiers */}
        <GuestItemModal
            item={upsellModalItem}
            tableId={tableId}
            takeawaySessionId={takeawaySessionId}
            onClose={() => setUpsellModalItem(null)}
            activeHappyHourRules={activeHappyHourRules}
        />
        </>
    );
}
