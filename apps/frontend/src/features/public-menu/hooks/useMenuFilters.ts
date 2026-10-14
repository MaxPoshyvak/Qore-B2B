'use client';

import { useCallback, useMemo, useState } from 'react';
import type { MenuItemResponse, PublicMenuCategoryResponse } from '@my-app/types';

import { toStringArray } from '@/shared/lib/menu-attributes';
import { pickBestDiscount, type ActiveHappyHourRule } from './usePublicHappyHour';

export type SortOption = 'default' | 'price-asc' | 'price-desc';

interface UseMenuFiltersProps {
    categories: PublicMenuCategoryResponse[] | undefined;
    activeHappyHourRules?: ActiveHappyHourRule[];
}

/** Helper to determine the effective current price of an item (including live Happy Hour discounts). */
export function getEffectivePrice(item: MenuItemResponse, rules: ActiveHappyHourRule[] = []): number {
    const discount = pickBestDiscount(item, rules);
    if (discount?.finalPrice !== undefined) {
        return discount.finalPrice;
    }
    if (item.happyHourPrice != null) {
        const hh = Number.parseFloat(String(item.happyHourPrice));
        if (Number.isFinite(hh)) return hh;
    }
    const base = Number.parseFloat(String(item.price));
    return Number.isFinite(base) ? base : 0;
}

/** Helper to check whether an item qualifies for any active Happy Hour promotion. */
export function hasHappyHourPromotion(item: MenuItemResponse, rules: ActiveHappyHourRule[] = []): boolean {
    const discount = pickBestDiscount(item, rules);
    if (discount !== null) return true;
    if (item.happyHourPrice != null) {
        const hh = Number.parseFloat(String(item.happyHourPrice));
        const base = Number.parseFloat(String(item.price));
        if (Number.isFinite(hh) && Number.isFinite(base) && hh < base) return true;
    }
    return false;
}

export function useMenuFilters({ categories = [], activeHappyHourRules = [] }: UseMenuFiltersProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [onlyHappyHour, setOnlyHappyHour] = useState(false);

    // Extract all unique dietary/menu tags available in the current menu
    const availableTags = useMemo(() => {
        const tagCountMap = new Map<string, number>();

        for (const cat of categories) {
            for (const item of cat.items) {
                const tags = toStringArray(item.tags);
                for (const rawTag of tags) {
                    const tag = rawTag.trim();
                    if (!tag) continue;
                    tagCountMap.set(tag, (tagCountMap.get(tag) ?? 0) + 1);
                }
            }
        }

        // Sort tags by frequency (most popular first)
        return Array.from(tagCountMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([tag]) => tag);
    }, [categories]);

    // Check if the current venue menu has any Happy Hour deals right now
    const hasHappyHourDeals = useMemo(() => {
        return categories.some((cat) =>
            cat.items.some((item) => hasHappyHourPromotion(item, activeHappyHourRules)),
        );
    }, [categories, activeHappyHourRules]);

    const toggleTag = useCallback((tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
        );
    }, []);

    const resetFilters = useCallback(() => {
        setSearchQuery('');
        setSortBy('default');
        setSelectedTags([]);
        setOnlyHappyHour(false);
    }, []);

    const isFiltered = useMemo(() => {
        return (
            searchQuery.trim().length > 0 ||
            sortBy !== 'default' ||
            selectedTags.length > 0 ||
            onlyHappyHour
        );
    }, [searchQuery, sortBy, selectedTags, onlyHappyHour]);

    // Compute filtered & sorted categories
    const filteredCategories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const selectedTagsLower = selectedTags.map((t) => t.toLowerCase());

        return categories
            .map((cat) => {
                const filteredItems = cat.items.filter((item) => {
                    // 1. Text search filter (matches name, description, tags, allergens)
                    if (query.length > 0) {
                        const nameMatches = item.name.toLowerCase().includes(query);
                        const descMatches = Boolean(
                            item.description && item.description.toLowerCase().includes(query),
                        );
                        const tagsMatch = toStringArray(item.tags).some((t) =>
                            t.toLowerCase().includes(query),
                        );
                        const allergensMatch = toStringArray(item.allergens).some((a) =>
                            a.toLowerCase().includes(query),
                        );

                        if (!nameMatches && !descMatches && !tagsMatch && !allergensMatch) {
                            return false;
                        }
                    }

                    // 2. Happy Hour only filter
                    if (onlyHappyHour && !hasHappyHourPromotion(item, activeHappyHourRules)) {
                        return false;
                    }

                    // 3. Dietary tag filter (item must match all selected tags)
                    if (selectedTagsLower.length > 0) {
                        const itemTagsLower = toStringArray(item.tags).map((t) => t.toLowerCase());
                        const hasAllSelected = selectedTagsLower.every((st) =>
                            itemTagsLower.includes(st),
                        );
                        if (!hasAllSelected) {
                            return false;
                        }
                    }

                    return true;
                });

                // 4. Sorting
                let sortedItems = filteredItems;
                if (sortBy === 'price-asc') {
                    sortedItems = [...filteredItems].sort(
                        (a, b) =>
                            getEffectivePrice(a, activeHappyHourRules) -
                            getEffectivePrice(b, activeHappyHourRules),
                    );
                } else if (sortBy === 'price-desc') {
                    sortedItems = [...filteredItems].sort(
                        (a, b) =>
                            getEffectivePrice(b, activeHappyHourRules) -
                            getEffectivePrice(a, activeHappyHourRules),
                    );
                }

                return {
                    ...cat,
                    items: sortedItems,
                };
            })
            .filter((cat) => cat.items.length > 0);
    }, [categories, searchQuery, onlyHappyHour, selectedTags, sortBy, activeHappyHourRules]);

    const totalMatches = useMemo(() => {
        return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
    }, [filteredCategories]);

    const totalItems = useMemo(() => {
        return categories.reduce((acc, cat) => acc + cat.items.length, 0);
    }, [categories]);

    return {
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        selectedTags,
        toggleTag,
        onlyHappyHour,
        setOnlyHappyHour,
        resetFilters,
        availableTags,
        hasHappyHourDeals,
        filteredCategories,
        totalMatches,
        totalItems,
        isFiltered,
    };
}
