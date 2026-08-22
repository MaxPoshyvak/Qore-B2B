'use client';

import { motion } from 'framer-motion';
import { Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import type { MenuItemResponse } from '@my-app/types';

import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';
import { formatPrice } from '@/shared/lib/utils';

type MenuItemCardProps = {
    item: MenuItemResponse;
    onEdit: (item: MenuItemResponse) => void;
    onDelete: (item: MenuItemResponse) => void;
};

export function MenuItemCard({ item, onEdit, onDelete }: MenuItemCardProps) {
    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/40 hover:shadow-xl hover:shadow-[#3B82F6]/10 dark:border-white/10 dark:bg-white/5 dark:hover:border-[#3B82F6]/40 dark:hover:shadow-[#3B82F6]/20">
            {/* Placeholder image area */}
            <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-[#3B82F6]/20 via-[#8B5CF6]/12 to-transparent">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_120%,rgba(139,92,246,0.18),transparent_70%)]" />
                <UtensilsCrossed
                    size={26}
                    strokeWidth={1.5}
                    className="relative text-[#3B82F6]/50 transition-transform duration-300 group-hover:scale-110 dark:text-[#8B5CF6]/60"
                />

                {!item.isActive && (
                    <span className="absolute left-3 top-3 rounded-full border border-black/10 bg-white/80 px-2 py-0.5 text-xs font-medium text-[#6B6A65] backdrop-blur-sm dark:border-white/10 dark:bg-[#0A0A0C]/70 dark:text-[#94938D]">
                        Unavailable
                    </span>
                )}

                {/* Quick actions — revealed on hover / keyboard focus */}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                        type="button"
                        onClick={() => onEdit(item)}
                        aria-label={`Edit ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white/80 text-[#6B6A65] backdrop-blur-sm transition-colors hover:border-[#3B82F6]/40 hover:text-[#3B82F6] dark:border-white/10 dark:bg-[#0A0A0C]/70 dark:text-[#94938D] dark:hover:text-[#3B82F6]">
                        <Pencil size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(item)}
                        aria-label={`Delete ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white/80 text-[#6B6A65] backdrop-blur-sm transition-colors hover:border-red-500/40 hover:text-red-500 dark:border-white/10 dark:bg-[#0A0A0C]/70 dark:text-[#94938D] dark:hover:text-red-500">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                    <h4
                        className={`${display.className} text-base font-semibold leading-snug text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        {item.name}
                    </h4>
                    <span className="shrink-0 text-base font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                        {formatPrice(item.price)}
                    </span>
                </div>

                {item.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        {item.description}
                    </p>
                )}
            </div>
        </motion.article>
    );
}
