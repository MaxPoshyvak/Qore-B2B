'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CartUpsellRecommendationItem, CartUpsellResponse } from '@my-app/types';
import { CartApi } from '../api/cart.api';

export interface UseCartUpsellOptions {
    venueSlug: string;
    cartItemIds: string[];
    isDrawerOpen: boolean;
}

export function useCartUpsell({ venueSlug, cartItemIds, isDrawerOpen }: UseCartUpsellOptions) {
    // 1. Compute stable sorted unique IDs of items currently in the cart
    const sortedUniqueIds = useMemo(() => {
        return Array.from(new Set(cartItemIds.filter(Boolean))).sort();
    }, [cartItemIds]);

    const sortedIdsKey = sortedUniqueIds.join(',');

    // 2. Debounce sorted IDs by 600ms to avoid token burn on rapid quantity/item edits
    const [debouncedIdsKey, setDebouncedIdsKey] = useState(sortedIdsKey);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedIdsKey(sortedIdsKey);
        }, 600);

        return () => {
            clearTimeout(handler);
        };
    }, [sortedIdsKey]);

    const isEnabled = Boolean(venueSlug && debouncedIdsKey.length > 0 && isDrawerOpen);

    // 3. Query upsell recommendations using sorted unique item IDs key
    const query = useQuery<CartUpsellResponse>({
        queryKey: ['cart-upsell', venueSlug, debouncedIdsKey],
        queryFn: async () => {
            const itemIds = debouncedIdsKey ? debouncedIdsKey.split(',').filter(Boolean) : [];
            if (!venueSlug || itemIds.length === 0) {
                return {
                    success: true,
                    data: { recommendations: [] },
                    message: 'No items',
                };
            }
            return CartApi.getUpsellRecommendations({
                venueSlug,
                cartItemIds: itemIds,
                language: 'en',
            });
        },
        enabled: isEnabled,
        staleTime: 5 * 60 * 1000,
    });

    const rawRecommendations: CartUpsellRecommendationItem[] = query.data?.data?.recommendations ?? [];

    // 4. Optimistically filter out items that have already entered the cart (even before debounced query refetches)
    const currentCartIdSet = useMemo(() => new Set(cartItemIds), [cartItemIds]);
    const recommendations = useMemo(() => {
        return rawRecommendations.filter((rec) => !currentCartIdSet.has(rec.item.id));
    }, [rawRecommendations, currentCartIdSet]);

    return {
        recommendations,
        isLoading: query.isLoading && isEnabled,
        isFetching: query.isFetching,
        error: query.error,
    };
}
