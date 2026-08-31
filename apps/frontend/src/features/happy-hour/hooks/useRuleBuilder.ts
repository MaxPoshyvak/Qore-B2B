'use client';

import { useCallback, useMemo } from 'react';

import type { MenuCategoryWithItemsResponse } from '@my-app/types';

/**
 * Внутрішня візуальна модель однієї "target group" у Rule Builder.
 *
 * Якщо `itemIds` порожній — правило застосовується до ВСІЄЇ категорії.
 * Якщо у `itemIds` є конкретні позиції — тільки до них.
 */
export type RuleBuilderGroup = {
    /** Стабільний ідентифікатор групи для ключів React. */
    uid: string;
    categoryId: string;
    itemIds: string[];
};

/**
 * Хук, що перетворює масив груп-білдерів у плоскі `categoryIds` / `itemIds`,
 * які очікує backend DTO (`CreateHappyHourSchema` / `UpdateHappyHourSchema`).
 *
 * Логіка:
 *  - Якщо категорія має конкретні `itemIds` — вона зберігається тільки через `itemIds`,
 *    `categoryIds` для неї НЕ додаємо (інакше backend застосує знижку і до всієї категорії).
 *  - Якщо категорія має порожній `itemIds` — категорія цілком підпадає під знижку,
 *    тому додаємо її id у `categoryIds`.
 */
export function useRuleBuilder(
    groups: RuleBuilderGroup[],
    categories: MenuCategoryWithItemsResponse[],
) {
    /**
     * Карта "categoryId -> MenuItem[]" для швидкого доступу під час рендеру
     * мульти-селекту конкретних позицій всередині групи.
     */
    const itemsByCategory = useMemo(() => {
        const map = new Map<string, MenuCategoryWithItemsResponse['items']>();
        for (const category of categories) {
            map.set(category.id, category.items);
        }
        return map;
    }, [categories]);

    /**
     * Ідентифікатори категорій, які вже зайняті іншою групою.
     * Використовується, щоб не дозволити обрати ту саму категорію двічі
     * (одна категорія = одна група).
     */
    const takenCategoryIds = useMemo(() => {
        const set = new Set<string>();
        for (const group of groups) set.add(group.categoryId);
        return set;
    }, [groups]);

    /**
     * Фінальний payload для бекенда.
     * `Entire Menu` досягається, коли `groups` порожній (жодна категорія не вибрана —
     * backend тоді не отримує ні `categoryIds`, ні `itemIds`).
     */
    const payload = useMemo(() => {
        const categoryIds: string[] = [];
        const itemIds: string[] = [];

        for (const group of groups) {
            if (!group.categoryId) continue;
            if (group.itemIds.length === 0) {
                categoryIds.push(group.categoryId);
            } else {
                itemIds.push(...group.itemIds);
            }
        }

        return {
            categoryIds: Array.from(new Set(categoryIds)),
            itemIds: Array.from(new Set(itemIds)),
        };
    }, [groups]);

    /**
     * Доступні (ще не зайняті) категорії для вибору у новій/порожній групі.
     * Поточна група завжди бачить СЕБЕ у списку — інакше не змогла б відобразити
     * вже обрану категорію.
     */
    const availableCategories = useCallback(
        (currentUid: string) =>
            categories.filter(
                (category) => !takenCategoryIds.has(category.id) || groups.find((g) => g.uid === currentUid)?.categoryId === category.id,
            ),
        [categories, takenCategoryIds, groups],
    );

    /**
     * Позиції меню для конкретної групи (порожній масив, якщо категорія не обрана).
     */
    const itemsForGroup = useCallback(
        (group: RuleBuilderGroup) => {
            if (!group.categoryId) return [] as MenuCategoryWithItemsResponse['items'];
            return itemsByCategory.get(group.categoryId) ?? [];
        },
        [itemsByCategory],
    );

    return {
        payload,
        availableCategories,
        itemsForGroup,
    };
}
