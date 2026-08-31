'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

import { formatPrice } from '@/shared/lib/utils';
import { EASE } from '@/shared/config/animations';
import { useCartStore } from '../store/useCartStore';
import { pickBestDiscount, type ActiveHappyHourRule } from '../hooks/usePublicHappyHour';
import { type CartSessionResponse } from '@my-app/types';

type CartBannerProps = {
    cart: CartSessionResponse | undefined;
    /** Активні правила Happy Hour — щоб підсумок кошика враховував знижки. */
    activeHappyHourRules?: ActiveHappyHourRule[];
};

export function CartBanner({ cart, activeHappyHourRules = [] }: CartBannerProps) {
    const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
    const isCartDrawerOpen = useCartStore((s) => s.isCartDrawerOpen);

    const items = cart?.items ?? [];
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    // Підсумок з урахуванням знижок Happy Hour — як у CartDrawer.
    const total = items.reduce((sum, item) => {
        const menuItem = item.menuItem;
        if (!menuItem) return sum;
        const best = pickBestDiscount(menuItem, activeHappyHourRules);
        const price = best ? best.finalPrice : Number(menuItem.price);
        return sum + item.quantity * price;
    }, 0);

    if (itemCount === 0 || isCartDrawerOpen || cart?.isActive === false) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed bottom-6 inset-x-4 z-50 mx-auto max-w-md lg:inset-x-auto lg:bottom-6 lg:right-6 lg:mx-0 lg:max-w-none">
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
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95">
                    View Cart
                </button>
            </div>
        </motion.div>
    );
}
