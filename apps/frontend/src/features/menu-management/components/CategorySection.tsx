'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import type { MenuCategoryWithItemsResponse, MenuItemResponse } from '@my-app/types';

import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';
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
            className="rounded-3xl border border-black/10 bg-white/40 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
            {/* Category header */}
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="h-8 w-1 rounded-full bg-gradient-to-b from-[#3B82F6] to-[#8B5CF6]" />
                    <div>
                        <h3
                            className={`${display.className} text-xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            {category.name}
                        </h3>
                        <p className="text-xs text-[#6B6A65] dark:text-[#94938D]">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onAddItem(category)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-3 py-2 text-sm font-semibold text-[#2563EB] transition-colors hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
                        <Plus size={15} />
                        Add Item
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-label={`Actions for ${category.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 text-[#6B6A65] transition-colors hover:border-black/20 hover:text-[#0A0A0C] dark:border-white/10 dark:text-[#94938D] dark:hover:border-white/20 dark:hover:text-[#F5F4F2]">
                            <MoreHorizontal size={16} />
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
                                        className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-black/10 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#121215]/95">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onRenameCategory(category);
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#0A0A0C] transition-colors hover:bg-[#3B82F6]/10 dark:text-[#F5F4F2]">
                                            <Pencil size={14} />
                                            Rename
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onDeleteCategory(category);
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10">
                                            <Trash2 size={14} />
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
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                        className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/15 text-sm text-[#6B6A65] transition-colors hover:border-[#3B82F6]/50 hover:text-[#3B82F6] dark:border-white/15 dark:text-[#94938D] dark:hover:border-[#3B82F6]/50">
                        <Plus size={20} />
                        Add the first dish
                    </motion.button>
                )}
            </div>
        </motion.section>
    );
}
