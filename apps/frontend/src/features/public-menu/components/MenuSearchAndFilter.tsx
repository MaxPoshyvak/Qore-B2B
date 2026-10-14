'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    X,
    ArrowUpDown,
    RotateCcw,
    Sparkles,
    Check,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/lib/utils';
import type { SortOption } from '../hooks/useMenuFilters';

interface MenuSearchAndFilterProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
    selectedTags: string[];
    onTagToggle: (tag: string) => void;
    availableTags: string[];
    onlyHappyHour: boolean;
    onHappyHourToggle: () => void;
    hasHappyHourDeals: boolean;
    isFiltered: boolean;
    onResetFilters: () => void;
    totalMatches: number;
}

function getTranslatedTag(tag: string, t: (key: string) => string): string {
    const normalized = tag.toLowerCase().replace(/[^a-z]/g, '');
    const map: Record<string, string> = {
        vegan: 'tags.vegan',
        vegetarian: 'tags.vegetarian',
        spicy: 'tags.spicy',
        halal: 'tags.halal',
        glutenfree: 'tags.glutenFree',
        sugarfree: 'tags.sugarFree',
        bestseller: 'tags.bestseller',
        new: 'tags.new',
    };
    const key = map[normalized];
    if (key) {
        try {
            return t(key);
        } catch {
            return tag;
        }
    }
    return tag;
}

export function MenuSearchAndFilter({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    selectedTags,
    onTagToggle,
    availableTags,
    onlyHappyHour,
    onHappyHourToggle,
    hasHappyHourDeals,
    isFiltered,
    onResetFilters,
    totalMatches,
}: MenuSearchAndFilterProps) {
    const t = useTranslations('publicMenu');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortMenuRef = useRef<HTMLDivElement>(null);

    // Close sort dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
        }
        if (isSortOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSortOpen]);

    const sortOptions: { id: SortOption; label: string }[] = [
        { id: 'default', label: t('sortDefault') },
        { id: 'price-asc', label: t('priceAsc') },
        { id: 'price-desc', label: t('priceDesc') },
    ];

    const currentSortLabel = sortOptions.find((opt) => opt.id === sortBy)?.label ?? t('sortBy');

    return (
        <div className="mt-6 flex flex-col gap-3">
            {/* Search Input Bar */}
            <div className="relative flex items-center rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 shadow-sm backdrop-blur-xl transition-all focus-within:border-[#3B82F6]/50 focus-within:ring-2 focus-within:ring-[#3B82F6]/20 dark:border-white/10 dark:bg-white/[0.04]">
                <Search className="mr-3 h-4 w-4 shrink-0 text-[#6B6A65] dark:text-[#94938D]" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    aria-label={t('searchPlaceholder')}
                    className="w-full bg-transparent text-sm font-medium text-[#0A0A0C] placeholder-[#6B6A65]/70 outline-none dark:text-[#F5F4F2] dark:placeholder-[#94938D]/70"
                />
                {searchQuery.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onSearchChange('')}
                        aria-label="Clear search"
                        className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#6B6A65] transition-colors hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/10 dark:hover:text-white">
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Quick Filters & Sorting Row */}
            <div className="flex items-center gap-2">
                <div className="hide-scrollbar flex flex-1 items-center gap-2 overflow-x-auto py-1">
                    {/* Sort Dropdown */}
                    <div ref={sortMenuRef} className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsSortOpen((prev) => !prev)}
                            className={cn(
                                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                                sortBy !== 'default'
                                    ? 'border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#3B82F6] dark:border-[#3B82F6]/50 dark:bg-[#3B82F6]/20 dark:text-[#60A5FA]'
                                    : 'border-black/10 bg-white/70 text-[#6B6A65] hover:border-black/20 hover:text-[#0A0A0C] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#94938D] dark:hover:border-white/20 dark:hover:text-[#F5F4F2]',
                            )}>
                            <ArrowUpDown className="h-3 w-3" />
                            <span>{currentSortLabel}</span>
                        </button>

                        <AnimatePresence>
                            {isSortOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-0 top-full z-40 mt-1.5 w-48 overflow-hidden rounded-2xl border border-black/10 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#16161A]/95">
                                    <div className="flex flex-col gap-0.5">
                                        {sortOptions.map((option) => {
                                            const isSelected = sortBy === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => {
                                                        onSortChange(option.id);
                                                        setIsSortOpen(false);
                                                    }}
                                                    className={cn(
                                                        'flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors',
                                                        isSelected
                                                            ? 'bg-[#3B82F6]/10 font-semibold text-[#3B82F6] dark:bg-[#3B82F6]/20 dark:text-[#60A5FA]'
                                                            : 'text-[#6B6A65] hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-[#F5F4F2]',
                                                    )}>
                                                    <span>{option.label}</span>
                                                    {isSelected && <Check className="h-3.5 w-3.5" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Happy Hour Deals Filter (if venue has any deals) */}
                    {hasHappyHourDeals && (
                        <button
                            type="button"
                            onClick={onHappyHourToggle}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                                onlyHappyHour
                                    ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 ring-1 ring-amber-500/30 dark:border-amber-400/40 dark:text-amber-400'
                                    : 'border-black/10 bg-white/70 text-[#6B6A65] hover:border-black/20 hover:text-[#0A0A0C] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#94938D] dark:hover:border-white/20 dark:hover:text-[#F5F4F2]',
                            )}>
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <span>{t('happyHourOnly')}</span>
                        </button>
                    )}

                    {/* Dietary & Menu Tag Chips */}
                    {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => onTagToggle(tag)}
                                className={cn(
                                    'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                                    isSelected
                                        ? 'border-[#3B82F6] bg-[#3B82F6] font-semibold text-white shadow-sm dark:bg-[#3B82F6]'
                                        : 'border-black/10 bg-white/70 text-[#6B6A65] hover:border-black/20 hover:text-[#0A0A0C] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#94938D] dark:hover:border-white/20 dark:hover:text-[#F5F4F2]',
                                )}>
                                <span>{getTranslatedTag(tag, t)}</span>
                            </button>
                        );
                    })}

                    {/* Reset Filters Chip */}
                    {isFiltered && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-500/10 dark:text-rose-400">
                            <RotateCcw className="h-3 w-3" />
                            <span>{t('clearFilters')}</span>
                        </button>
                    )}
                </div>

                {/* Matches count badge */}
                {isFiltered && (
                    <span className="shrink-0 text-xs font-medium text-[#6B6A65] dark:text-[#94938D]">
                        {t('dishesFound', { count: totalMatches })}
                    </span>
                )}
            </div>
        </div>
    );
}
