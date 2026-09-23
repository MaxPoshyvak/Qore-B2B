import { Injectable, Logger } from '@nestjs/common';
import type { CartUpsellResponse } from '@my-app/types';

interface UpsellCacheEntry {
    data: CartUpsellResponse;
    expiresAt: number;
    venueSlug: string;
}

@Injectable()
export class UpsellCacheService {
    private readonly logger = new Logger(UpsellCacheService.name);
    private readonly cache = new Map<string, UpsellCacheEntry>();
    private readonly TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
    private readonly MAX_ENTRIES = 10000;

    buildKey(venueSlug: string, cartItemIds: string[], language: string = 'en'): string {
        const sortedUniqueIds = Array.from(new Set(cartItemIds)).sort().join(',');
        return `upsell:${venueSlug}:${sortedUniqueIds}:${language || 'en'}`;
    }

    get(key: string): CartUpsellResponse | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    set(key: string, venueSlug: string, data: CartUpsellResponse): void {
        if (this.cache.size >= this.MAX_ENTRIES) {
            this.pruneOldest(1500);
        }

        this.cache.set(key, {
            data,
            expiresAt: Date.now() + this.TTL_MS,
            venueSlug,
        });
    }

    invalidateVenue(venueSlug: string): void {
        let count = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (entry.venueSlug === venueSlug) {
                this.cache.delete(key);
                count++;
            }
        }
        if (count > 0) {
            this.logger.log(`Invalidated ${count} upsell cache entries for venue: ${venueSlug}`);
        }
    }

    clear(): void {
        this.cache.clear();
        this.logger.log('Upsell cache cleared');
    }

    private pruneOldest(count: number): void {
        const iterator = this.cache.keys();
        for (let i = 0; i < count; i++) {
            const next = iterator.next();
            if (next.done) break;
            this.cache.delete(next.value);
        }
    }
}
