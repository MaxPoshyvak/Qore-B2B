'use client';

import { motion, type Variants } from 'framer-motion';
import { Plus, UtensilsCrossed } from 'lucide-react';
import type { MenuItemResponse } from '@my-app/types';

import { formatPrice } from '@/shared/lib/utils';

// Inherit the stagger variants from the parent list.
type PublicMenuItemProps = {
    item: MenuItemResponse;
    variants?: Variants;
};

export function PublicMenuItem({ item, variants }: PublicMenuItemProps) {
    return (
        <motion.li
            variants={variants}
            className="flex gap-4 rounded-[1.5rem] border border-black/5 bg-white/60 p-4 backdrop-blur-xl transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-[#121215]/60">
            {/* Text block */}
            <div className="flex min-w-0 flex-1 flex-col">
                <h4 className="text-base font-semibold leading-snug text-[#0A0A0C] dark:text-[#F5F4F2]">
                    {item.name}
                </h4>
                {item.description && (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        {item.description}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="rounded-full bg-black/5 px-3 py-1 font-medium text-[#0A0A0C] dark:bg-white/10 dark:text-[#F5F4F2]">
                        {formatPrice(item.price)}
                    </span>
                    <button
                        type="button"
                        aria-label={`Add ${item.name} to your order`}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#2563EB] transition-colors hover:border-[#3B82F6]/60 hover:bg-[#3B82F6]/20 dark:text-[#60A5FA]">
                        <Plus size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Placeholder image */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#3B82F6]/20 via-[#8B5CF6]/12 to-transparent">
                <UtensilsCrossed
                    size={22}
                    strokeWidth={1.5}
                    className="text-[#3B82F6]/50 dark:text-[#8B5CF6]/60"
                />
            </div>
        </motion.li>
    );
}
