import { describe, expect, it } from 'bun:test';
import {
    classifyCulinaryRole,
    isSanitizedCandidate,
    filterCandidatesForCart,
    buildCartUpsellUserPrompt,
} from './cart-upsell.prompt';
import { UpsellCacheService } from '../services/upsell-cache.service';
import { aiCartUpsellRawOutputSchema, type CartUpsellResponse } from '@my-app/types';

describe('AI Cart Upsell Refactoring Specification', () => {
    describe('Culinary Role Classification & Substring Collision Safety', () => {
        it('classifies hot beverages correctly in English and Ukrainian', () => {
            expect(classifyCulinaryRole('Coffee', 'Latte')).toBe('BEVERAGE_HOT');
            expect(classifyCulinaryRole('Кава', 'Капучино')).toBe('BEVERAGE_HOT');
            expect(classifyCulinaryRole('Tea', 'Matcha Latte')).toBe('BEVERAGE_HOT');
            expect(classifyCulinaryRole('Hot Drinks', 'Hot Chocolate')).toBe('BEVERAGE_HOT');
        });

        it('does NOT misclassify Steak or steamed dishes as BEVERAGE_HOT due to "tea"', () => {
            expect(classifyCulinaryRole('Mains', 'Ribeye Steak')).toBe('SAVORY_MAIN');
            expect(classifyCulinaryRole('Entrees', 'Steak Frites')).toBe('SAVORY_MAIN');
            expect(classifyCulinaryRole('Sides', 'Steamed Rice')).toBe('SAVORY_SIDE');
        });

        it('does NOT misclassify Pierogi as SWEET due to "pie"', () => {
            expect(classifyCulinaryRole('Mains', 'Pierogi with Potato')).toBe('SAVORY_MAIN');
        });

        it('does NOT misclassify Beer Battered Fish as BEVERAGE_COLD due to "beer"', () => {
            expect(classifyCulinaryRole('Mains', 'Beer Battered Fish')).toBe('SAVORY_MAIN');
            expect(classifyCulinaryRole('Main Courses', 'Wine Braised Beef')).toBe('SAVORY_MAIN');
        });

        it('classifies cold beverages correctly', () => {
            expect(classifyCulinaryRole('Drinks', 'Lemonade')).toBe('BEVERAGE_COLD');
            expect(classifyCulinaryRole('Напої', 'Сік яблучний')).toBe('BEVERAGE_COLD');
            expect(classifyCulinaryRole('Bar', 'Sparkling Water')).toBe('BEVERAGE_COLD');
            expect(classifyCulinaryRole('Wine', 'Chardonnay')).toBe('BEVERAGE_COLD');
            expect(classifyCulinaryRole('Coffee', 'Iced Latte')).toBe('BEVERAGE_COLD');
        });

        it('classifies sweets and desserts correctly', () => {
            expect(classifyCulinaryRole('Bakery', 'Almond Croissant')).toBe('SWEET');
            expect(classifyCulinaryRole('Десерти', 'Чізкейк')).toBe('SWEET');
            expect(classifyCulinaryRole('Pastry', 'Chocolate Cake')).toBe('SWEET');
            expect(classifyCulinaryRole('Desserts', 'Apple Pie')).toBe('SWEET');
        });

        it('classifies savory sides and mains correctly', () => {
            expect(classifyCulinaryRole('Sides', 'French Fries')).toBe('SAVORY_SIDE');
            expect(classifyCulinaryRole('Salads', 'Caesar Salad')).toBe('SAVORY_SIDE');
            expect(classifyCulinaryRole('Mains', 'Beef Burger')).toBe('SAVORY_MAIN');
            expect(classifyCulinaryRole('Основні страви', 'Паста Карбонара')).toBe('SAVORY_MAIN');
        });
    });

    describe('Sanitizer Filter (isSanitizedCandidate)', () => {
        it('identifies valid items as not sanitized/corrupt (returns false)', () => {
            expect(isSanitizedCandidate({ name: 'Croissant', categoryName: 'Bakery', price: '4.50' })).toBe(false);
            expect(isSanitizedCandidate({ name: 'Espresso', categoryName: 'Coffee', price: 3.0 })).toBe(false);
            expect(isSanitizedCandidate({ name: 'Капучино', categoryName: 'Кава', price: '65.00' })).toBe(false);
        });

        it('identifies garbage and placeholder items (returns true)', () => {
            expect(isSanitizedCandidate({ name: 'Test1', categoryName: 'Bakery', price: '4.50' })).toBe(true);
            expect(isSanitizedCandidate({ name: 'dummy item', categoryName: 'Sides', price: '5.00' })).toBe(true);
            expect(isSanitizedCandidate({ name: 'тест страва', categoryName: 'Sides', price: '5.00' })).toBe(true);
            expect(isSanitizedCandidate({ name: 'Valid Item', categoryName: 'Bakery', price: '0.00' })).toBe(true);
            expect(isSanitizedCandidate({ name: 'Valid Item', categoryName: 'Bakery', price: -5 })).toBe(true);
            expect(isSanitizedCandidate({ name: 'Valid Item', categoryName: '', price: '4.00' })).toBe(true);
            expect(isSanitizedCandidate({ name: 'ab', categoryName: 'Bakery', price: '4.00' })).toBe(true);
            expect(isSanitizedCandidate({ name: 'Valid Item', categoryName: 'Uncategorized', price: '4.00' })).toBe(true);
        });
    });

    describe('Contextual Pairing Rules (filterCandidatesForCart)', () => {
        const candidates = [
            { id: 'c1', name: 'Almond Croissant', categoryName: 'Bakery', price: '4.50', hasRequiredModifiers: false },
            { id: 'c2', name: 'Beef Burger', categoryName: 'Mains', price: '14.00', hasRequiredModifiers: false },
            { id: 'c3', name: 'San Pellegrino', categoryName: 'Drinks', price: '3.50', hasRequiredModifiers: false },
            { id: 'c4', name: 'Mixed Baby Greens', categoryName: 'Sides', price: '6.00', hasRequiredModifiers: false },
            { id: 'c5', name: 'Hot Cocoa', categoryName: 'Hot Drinks', price: '4.00', hasRequiredModifiers: false },
            { id: 'c6', name: 'Cheesecake', categoryName: 'Desserts', price: '7.00', hasRequiredModifiers: false },
            { id: 'c7', name: 'Sprite', categoryName: 'Drinks', price: '3.00', hasRequiredModifiers: false },
            { id: 'c8', name: 'Test Dish', categoryName: 'Mains', price: '12.00', hasRequiredModifiers: false },
            { id: 'c9', name: 'Zero Price', categoryName: 'Mains', price: '0.00', hasRequiredModifiers: false },
        ];

        it('Edge Case 1: Beverage-Only Cart strips mains and redundant hot drinks', () => {
            const cart = [{ name: 'Latte', categoryName: 'Coffee' }];
            const filtered = filterCandidatesForCart(cart, candidates);

            const names = filtered.map((c) => c.name);
            expect(names).toContain('Almond Croissant');
            expect(names).toContain('Cheesecake');
            expect(names).toContain('Mixed Baby Greens');
            expect(names).not.toContain('Beef Burger'); // No heavy mains
            expect(names).not.toContain('Hot Cocoa'); // No duplicate hot beverages
            expect(names).not.toContain('Test Dish'); // Sanitized
            expect(names).not.toContain('Zero Price'); // Sanitized
        });

        it('Edge Case 2: Savory Main Cart prioritizes cold drinks, sides, and desserts, stripping competing mains', () => {
            const cart = [{ name: 'Spaghetti Carbonara', categoryName: 'Pasta & Mains' }];
            const filtered = filterCandidatesForCart(cart, candidates);

            const names = filtered.map((c) => c.name);
            expect(names).toContain('San Pellegrino');
            expect(names).toContain('Mixed Baby Greens');
            expect(names).toContain('Cheesecake');
            expect(names).not.toContain('Beef Burger'); // Competing heavy main stripped
        });

        it('Edge Case 2b: Savory Main + Cold Drink Cart suppresses redundant cold drinks (Deduplication Guard)', () => {
            const cart = [
                { name: 'Beef Burger', categoryName: 'Mains' },
                { name: 'Coca Cola', categoryName: 'Drinks' },
            ];
            const filtered = filterCandidatesForCart(cart, candidates);

            const names = filtered.map((c) => c.name);
            expect(names).not.toContain('Sprite'); // Redundant cold drink blocked
            expect(names).toContain('San Pellegrino'); // Water is allowed as palate cleanser
            expect(names).toContain('Mixed Baby Greens');
            expect(names).toContain('Cheesecake');
        });

        it('Edge Case 3: Dessert-Only Cart pairs with hot or cold beverages, stripping heavy mains', () => {
            const cart = [{ name: 'Chocolate Cake', categoryName: 'Desserts' }];
            const filtered = filterCandidatesForCart(cart, candidates);

            const names = filtered.map((c) => c.name);
            expect(names).toContain('Hot Cocoa');
            expect(names).toContain('San Pellegrino');
            expect(names).not.toContain('Beef Burger');
            expect(names).not.toContain('Mixed Baby Greens');
        });

        it('Edge Case 4: Sanitizer strips all garbage candidates', () => {
            const cart = [{ name: 'Latte', categoryName: 'Coffee' }];
            const filtered = filterCandidatesForCart(cart, [
                { id: 't1', name: 'Test1', categoryName: 'Desserts', price: '5.00', hasRequiredModifiers: false },
                { id: 't2', name: 'dummy item', categoryName: 'Desserts', price: '5.00', hasRequiredModifiers: false },
                { id: 't3', name: 'Free Pie', categoryName: 'Desserts', price: '0', hasRequiredModifiers: false },
            ]);
            expect(filtered.length).toBe(0);
        });

        it('Edge Case 5: Zero Valid Candidates yields empty array', () => {
            const cart = [{ name: 'Latte', categoryName: 'Coffee' }];
            const filtered = filterCandidatesForCart(cart, []);
            expect(filtered).toEqual([]);
        });

        it('Caps candidates to at most 8 items and prioritizes standalone items', () => {
            const manyCandidates = Array.from({ length: 15 }, (_, i) => ({
                id: `cand_${i}`,
                name: `Pastry Option ${i}`,
                categoryName: 'Bakery',
                price: '5.00',
                hasRequiredModifiers: i % 2 === 0,
            }));

            const cart = [{ name: 'Latte', categoryName: 'Coffee' }];
            const filtered = filterCandidatesForCart(cart, manyCandidates, 8);

            expect(filtered.length).toBe(8);
            expect(filtered[0].hasRequiredModifiers).toBe(false);
        });
    });

    describe('UpsellCacheService & Key Deduplication', () => {
        it('deduplicates duplicate item IDs and sorts for identical cache keys', () => {
            const service = new UpsellCacheService();
            const key1 = service.buildKey('venue-1', ['item_a', 'item_b', 'item_a'], 'en');
            const key2 = service.buildKey('venue-1', ['item_b', 'item_a'], 'en');
            expect(key1).toBe('upsell:venue-1:item_a,item_b:en');
            expect(key1).toBe(key2);
        });

        it('stores, retrieves, and handles cache hit', () => {
            const service = new UpsellCacheService();
            const key = service.buildKey('venue-1', ['item_1'], 'en');

            const mockResponse: CartUpsellResponse = {
                success: true,
                data: { recommendations: [] },
                message: 'Test message',
            };

            service.set(key, 'venue-1', mockResponse);
            const retrieved = service.get(key);
            expect(retrieved).toEqual(mockResponse);
        });

        it('invalidates cache for a specific venue', () => {
            const service = new UpsellCacheService();
            const key1 = service.buildKey('venue-1', ['item_1'], 'en');
            const key2 = service.buildKey('venue-2', ['item_2'], 'en');

            const mockResponse: CartUpsellResponse = {
                success: true,
                data: { recommendations: [] },
            };

            service.set(key1, 'venue-1', mockResponse);
            service.set(key2, 'venue-2', mockResponse);

            expect(service.get(key1)).not.toBeNull();
            expect(service.get(key2)).not.toBeNull();

            service.invalidateVenue('venue-1');

            expect(service.get(key1)).toBeNull();
            expect(service.get(key2)).not.toBeNull();
        });
    });

    describe('LLM Schema Resilience', () => {
        it('gracefully slices to top 2 if LLM outputs 3 items instead of failing', () => {
            const rawLlmOutput = {
                recommendations: [
                    { itemId: 'item_1', pairingReason: 'Reason 1' },
                    { itemId: 'item_2', pairingReason: 'Reason 2' },
                    { itemId: 'item_3', pairingReason: 'Reason 3' },
                ],
            };

            const parsed = aiCartUpsellRawOutputSchema.safeParse(rawLlmOutput);
            expect(parsed.success).toBe(true);
            if (parsed.success) {
                expect(parsed.data.recommendations.length).toBe(2);
                expect(parsed.data.recommendations[0].itemId).toBe('item_1');
                expect(parsed.data.recommendations[1].itemId).toBe('item_2');
            }
        });
    });
});
