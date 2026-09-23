'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import type { MenuCategoryWithItemsResponse, MenuItemResponse } from '@my-app/types';

import { EASE } from '@/shared/config/animations';
import { cn } from '@/shared/lib/utils';
import { MenuItemCard } from './MenuItemCard';

type CategorySectionProps = {
    category: MenuCategoryWithItemsResponse;
    onAddItem: (category: MenuCategoryWithItemsResponse) => void;
    onEditItem: (item: MenuItemResponse) => void;
    onDeleteItem: (item: MenuItemResponse) => void;
    onRenameCategory: (category: MenuCategoryWithItemsResponse) => void;
    onDeleteCategory: (category: MenuCategoryWithItemsResponse) => void;
};

export function CategorySection({
    category,
    onAddItem,
    onEditItem,
    onDeleteItem,
    onRenameCategory,
    onDeleteCategory,
}: CategorySectionProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const itemCount = category.items.length;

    return (
        <motion.section
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="rounded-3xl border border-[#E7E5E0] bg-white/50 p-6 backdrop-blur-xl shadow-xs transition-colors dark:border-[#232327] dark:bg-[#141417]/40 sm:p-7">
            {/* Category header */}
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="h-8 w-1 rounded-full bg-gradient-to-b from-[#3B82F6] via-[#8B5CF6] to-[#10B981]" />
                    <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]">
                            {category.name}
                        </h3>
                        <span className="rounded-full border border-black/5 bg-black/[0.04] px-2.5 py-0.5 text-xs font-medium text-[#6B6A65] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]">
                            {itemCount} {itemCount === 1 ? 'dish' : 'dishes'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onAddItem(category)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3.5 py-2 text-xs font-semibold text-[#2563EB] shadow-xs transition-all hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/15 active:scale-95 dark:text-[#60A5FA]">
                        <Plus size={14} />
                        Add dish
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-label={`Actions for ${category.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white/80 text-[#6B6A65] transition-colors hover:border-black/20 hover:text-[#0A0A0C] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D] dark:hover:border-white/20 dark:hover:text-[#F5F4F2]">
                            <MoreHorizontal size={15} />
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                        transition={{ duration: 0.18 }}
                                        className="absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white/95 p-1 backdrop-blur-xl shadow-xl dark:border-[#232327] dark:bg-[#141417]/95">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onRenameCategory(category);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#0A0A0C] transition-colors hover:bg-black/5 dark:text-[#F5F4F2] dark:hover:bg-white/5">
                                            <Pencil size={13} />
                                            Rename
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onDeleteCategory(category);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10">
                                            <Trash2 size={13} />
                                            Delete
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Item grid */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout" initial={false}>
                    {category.items.map((item) => (
                        <MenuItemCard key={item.id} item={item} onEdit={onEditItem} onDelete={onDeleteItem} />
                    ))}
                </AnimatePresence>

                {itemCount === 0 && (
                    <motion.button
                        layout
                        type="button"
                        onClick={() => onAddItem(category)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group flex min-h-[290px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#E7E5E0] bg-white/30 p-6 text-center transition-all hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/[0.02] dark:border-[#232327] dark:bg-white/[0.02] dark:hover:border-[#3B82F6]/50">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-xs transition-transform group-hover:scale-110 dark:border-white/10 dark:bg-white/5">
                            <Plus size={20} className="text-[#3B82F6]" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                Add first dish
                            </p>
                            <p className="mt-1 text-xs text-[#6B6A65] dark:text-[#94938D]">
                                Create manually or draft with AI
                            </p>
                        </div>
                    </motion.button>
                )}
            </div>
        </motion.section>
    );
}
