'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    X,
    ArrowUpDown,
    SlidersHorizontal,
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
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterPanelRef = useRef<HTMLDivElement>(null);

    // Close panel on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        }
        if (isFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterOpen]);

    const activeFilterCount =
        (sortBy !== 'default' ? 1 : 0) + (onlyHappyHour ? 1 : 0) + selectedTags.length;

    const sortOptions: { id: SortOption; label: string }[] = [
        { id: 'default', label: t('sortDefault') },
        { id: 'price-asc', label: t('priceAsc') },
        { id: 'price-desc', label: t('priceDesc') },
    ];

    const currentSortLabel = sortOptions.find((opt) => opt.id === sortBy)?.label ?? t('sortBy');

    return (
        <div ref={filterPanelRef} className="relative mt-4 flex flex-col gap-2">
            {/* Unified Search & Filter Control Bar */}
            <div className="flex items-center gap-2">
                {/* Search Field */}
                <div className="relative flex flex-1 items-center rounded-2xl border border-black/10 bg-white/70 px-3.5 py-2 shadow-sm backdrop-blur-xl transition-all focus-within:border-[#3B82F6]/50 focus-within:ring-2 focus-within:ring-[#3B82F6]/20 dark:border-white/10 dark:bg-white/[0.04] sm:px-4 sm:py-2.5">
                    <Search className="mr-2.5 h-4 w-4 shrink-0 text-[#6B6A65] dark:text-[#94938D]" />
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
                            className="ml-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#6B6A65] transition-colors hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/10 dark:hover:text-white">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Filter & Sort Toggle Button */}
                <button
                    type="button"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    aria-expanded={isFilterOpen}
                    className={cn(
                        'flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-semibold shadow-sm backdrop-blur-xl transition-all sm:py-2.5',
                        activeFilterCount > 0 || isFilterOpen
                            ? 'border-[#3B82F6]/50 bg-[#3B82F6]/10 text-[#3B82F6] dark:border-[#3B82F6]/60 dark:bg-[#3B82F6]/20 dark:text-[#60A5FA]'
                            : 'border-black/10 bg-white/70 text-[#6B6A65] hover:border-black/20 hover:text-[#0A0A0C] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#94938D] dark:hover:border-white/20 dark:hover:text-[#F5F4F2]',
                    )}>
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('filters')}</span>
                    {activeFilterCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3B82F6] text-[10px] font-bold text-white shadow-sm">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filter Popover Panel */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="relative z-30 overflow-hidden rounded-2xl border border-black/10 bg-white/95 p-4 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#141418]/95 sm:p-5">
                        <div className="flex flex-col gap-4">
                            {/* Sort Section */}
                            <div>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                    {t('sortBy')}
                                </span>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {sortOptions.map((opt) => {
                                        const isSelected = sortBy === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => onSortChange(opt.id)}
                                                className={cn(
                                                    'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all',
                                                    isSelected
                                                        ? 'border-[#3B82F6] bg-[#3B82F6] text-white shadow-sm'
                                                        : 'border-black/10 bg-black/5 text-[#6B6A65] hover:bg-black/10 hover:text-[#0A0A0C] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D] dark:hover:bg-white/10 dark:hover:text-[#F5F4F2]',
                                                )}>
                                                <span>{opt.label}</span>
                                                {isSelected && <Check className="h-3 w-3" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Happy Hour Deals Section (if deals exist) */}
                            {hasHappyHourDeals && (
                                <div>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                        {t('happyHour')}
                                    </span>
                                    <div className="mt-2">
                                        <button
                                            type="button"
                                            onClick={onHappyHourToggle}
                                            className={cn(
                                                'flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all',
                                                onlyHappyHour
                                                    ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 ring-1 ring-amber-500/30 dark:border-amber-400/50 dark:text-amber-400'
                                                    : 'border-black/10 bg-black/5 text-[#6B6A65] hover:bg-black/10 hover:text-[#0A0A0C] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D] dark:hover:bg-white/10 dark:hover:text-[#F5F4F2]',
                                            )}>
                                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                            <span>{t('happyHourOnly')}</span>
                                            {onlyHappyHour && <Check className="h-3 w-3 text-amber-500" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Dietary & Menu Tags Section */}
                            {availableTags.length > 0 && (
                                <div>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                        {t('filters')}
                                    </span>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {availableTags.map((tag) => {
                                            const isSelected = selectedTags.includes(tag);
                                            return (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => onTagToggle(tag)}
                                                    className={cn(
                                                        'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all',
                                                        isSelected
                                                            ? 'border-[#3B82F6] bg-[#3B82F6] text-white shadow-sm'
                                                            : 'border-black/10 bg-black/5 text-[#6B6A65] hover:bg-black/10 hover:text-[#0A0A0C] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D] dark:hover:bg-white/10 dark:hover:text-[#F5F4F2]',
                                                    )}>
                                                    <span>{getTranslatedTag(tag, t)}</span>
                                                    {isSelected && <Check className="h-3 w-3" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Panel Footer */}
                            <div className="flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/5">
                                {isFiltered ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onResetFilters();
                                            setIsFilterOpen(false);
                                        }}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 transition-colors hover:text-rose-600 dark:text-rose-400">
                                        <RotateCcw className="h-3 w-3" />
                                        <span>{t('clearFilters')}</span>
                                    </button>
                                ) : (
                                    <span className="text-xs text-[#6B6A65] dark:text-[#94938D]">
                                        {t('dishesFound', { count: totalMatches })}
                                    </span>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setIsFilterOpen(false)}
                                    className="rounded-xl bg-[#3B82F6] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-600">
                                    {t('close', { defaultValue: 'Done' })}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Filter Chips (Only shown when filtered to keep UI clean) */}
            {isFiltered && (
                <div className="flex flex-wrap items-center gap-1.5 py-1 text-xs">
                    {/* Sort chip */}
                    {sortBy !== 'default' && (
                        <button
                            type="button"
                            onClick={() => onSortChange('default')}
                            className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 font-medium text-blue-600 dark:text-blue-400">
                            <ArrowUpDown className="h-2.5 w-2.5" />
                            <span>{currentSortLabel}</span>
                            <X className="h-3 w-3 hover:text-rose-500" />
                        </button>
                    )}

                    {/* Happy hour chip */}
                    {onlyHappyHour && (
                        <button
                            type="button"
                            onClick={onHappyHourToggle}
                            className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-medium text-amber-600 dark:text-amber-400">
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>{t('happyHourOnly')}</span>
                            <X className="h-3 w-3 hover:text-rose-500" />
                        </button>
                    )}

                    {/* Tag chips */}
                    {selectedTags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => onTagToggle(tag)}
                            className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 font-medium text-blue-600 dark:text-blue-400">
                            <span>{getTranslatedTag(tag, t)}</span>
                            <X className="h-3 w-3 hover:text-rose-500" />
                        </button>
                    ))}

                    {/* Reset All & Result Count */}
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-rose-500 transition-colors hover:bg-rose-500/10 dark:text-rose-400">
                        <RotateCcw className="h-3 w-3" />
                        <span>{t('clearFilters')}</span>
                    </button>

                    <span className="ml-auto text-[11px] font-medium text-[#6B6A65] dark:text-[#94938D]">
                        {t('dishesFound', { count: totalMatches })}
                    </span>
                </div>
            )}
        </div>
    );
}
