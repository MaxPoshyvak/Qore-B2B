'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

import { formatPrice } from '@/shared/lib/utils';
import { useCartStore } from '../store/useCartStore';
import { type ActiveHappyHourRule } from '../hooks/usePublicHappyHour';
import { calculateCartTotal } from '../lib/cart-pricing';
import { type CartSessionResponse } from '@my-app/types';

type CartBannerProps = {
    cart: CartSessionResponse | undefined;
    /** Активні правила Happy Hour — щоб підсумок кошика враховував знижки. */
    activeHappyHourRules?: ActiveHappyHourRule[];
};

export function CartBanner({ cart, activeHappyHourRules = [] }: CartBannerProps) {
    const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
    const isCartDrawerOpen = useCartStore((s) => s.isCartDrawerOpen);
    const isDishModalOpen = useCartStore((s) => s.isDishModalOpen);

    const items = cart?.items ?? [];
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    // Той самий розрахунок, що й у CartDrawer (модифікатори + Happy Hour).
    const total = calculateCartTotal(items, activeHappyHourRules);

    const hasCartItems = itemCount > 0 && cart?.isActive !== false;
    const isVisible = hasCartItems && !isDishModalOpen && !isCartDrawerOpen;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="fixed bottom-6 inset-x-4 z-40 mx-auto max-w-md lg:inset-x-auto lg:bottom-6 lg:right-6 lg:mx-0 lg:max-w-none">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#141417]/90 dark:shadow-2xl">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white">
                                <ShoppingBag size={18} />
                                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0A0A0C] px-1 text-[10px] font-semibold text-white dark:bg-[#F5F4F2] dark:text-[#0A0A0C]">
                                    {itemCount}
                                </span>
                            </span>
                            <div className="leading-tight">
                                <p className="text-[11px] uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                    Shared order
                                </p>
                                <p className="text-sm font-semibold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    {formatPrice(total)}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setCartDrawerOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity [@media(hover:hover)]:hover:opacity-95">
                            View Cart
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
