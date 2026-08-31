'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { HappyHourRuleResponse, MenuItemResponse } from '@my-app/types';

import { PublicHappyHourApi } from '../api/public-happy-hour.api';

/**
 * Структура "правило, яке зараз діє" з додатковим полем `endsAtMs` —
 * абсолютний час (epoch ms) закінчення дії на сьогодні.
 *
 * Якщо `endTime` менше за `startTime` (наприклад, 22:00 → 02:00),
 * інтервал переходить через північ — `endsAtMs` тоді вже у наступній добі.
 */
export type ActiveHappyHourRule = HappyHourRuleResponse & {
    endsAtMs: number;
};

/** Допоміжна конвертація "HH:mm" → хвилини від початку доби. */
function timeToMinutes(time: string): number {
    const [hh, mm] = time.split(':').map((n) => Number.parseInt(n, 10));
    return (Number.isFinite(hh) ? hh : 0) * 60 + (Number.isFinite(mm) ? mm : 0);
}

/**
 * Оцінює, чи є правило `rule` активним у момент `now` (Date).
 *
 * ВАЖЛИВО: backend зберігає час у "naive" форматі "HH:mm" без timezone.
 * Ми припускаємо, що це — локальний час закладу, тобто збігається з
 * локальним часом пристрою гостя. Це стандартна практика для B2C меню
 * (гостей зазвичай цікавить знижка саме "зараз у цьому місті").
 *
 * Якщо у майбутньому зʼявиться venue timezone — параметризуємо.
 */
export function isRuleActiveNow(rule: HappyHourRuleResponse, now: Date): boolean {
    if (!rule.isActive) return false;

    // Date.getDay(): 0=Sun, 1=Mon, …, 6=Sat — повністю сумісне з Prisma-моделлю.
    const today = now.getDay();
    if (!rule.daysOfWeek.includes(today)) return false;

    const start = timeToMinutes(rule.startTime);
    const end = timeToMinutes(rule.endTime);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (start === end) return false;

    // Випадок "через північ": наприклад 22:00 → 02:00.
    if (end < start) {
        return currentMinutes >= start || currentMinutes < end;
    }

    return currentMinutes >= start && currentMinutes < end;
}

/**
 * Обчислює `endsAtMs` для правила, що зараз діє.
 * Використовується у банері для зворотного відліку "Ends in 12m 34s".
 */
function computeEndsAtMs(rule: HappyHourRuleResponse, now: Date): number {
    const endMinutes = timeToMinutes(rule.endTime);
    const startMinutes = timeToMinutes(rule.startTime);
    const endCrossesMidnight = endMinutes < startMinutes;

    const today = new Date(now);
    today.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    // Якщо кінець "уже сьогодні" неможливий (правило перейшло через північ і ми
    // зараз у ранковій частині) — `endsAtMs` вже належить сьогодні.
    if (endCrossesMidnight && now.getHours() * 60 + now.getMinutes() < endMinutes) {
        return today.getTime();
    }

    // Стандартний випадок: кінець сьогодні ввечері.
    if (!endCrossesMidnight) {
        return today.getTime();
    }

    // Перехід через північ, ми зараз увечері → кінець завтра вночі.
    today.setDate(today.getDate() + 1);
    return today.getTime();
}

/**
 * Застосовує правило до конкретної позиції меню.
 * Повертає нову ціну (число) або `null`, якщо знижка не застосовується.
 *
 * Логіка матчингу:
 *  - Якщо у правила немає ні `categories`, ні `items` — діє на ВСЕ меню.
 *  - Якщо `itemId` позиції збігається з одним з itemIds правила — діє.
 *  - Якщо `categoryId` позиції збігається з одним з categoryIds правила — діє.
 *
 * УВАГА: якщо у правила є І категорії, І позиції — пріоритет у позицій
 * (специфічне завжди виграє у загального), але зараз API повертає їх
 * як дві різні сутності й семантика однозначна.
 */
export function calculateDiscountedPrice(
    item: MenuItemResponse,
    rule: ActiveHappyHourRule,
): number | null {
    const basePrice = Number.parseFloat(item.price);
    if (!Number.isFinite(basePrice)) return null;

    const matchesItem = rule.items.some((i) => i.id === item.id);
    const matchesCategory = rule.categories.some((c) => c.id === item.categoryId);
    const appliesToEverything = rule.items.length === 0 && rule.categories.length === 0;

    if (!matchesItem && !matchesCategory && !appliesToEverything) return null;

    if (rule.discountType === 'PERCENTAGE') {
        const pct = Math.min(100, Math.max(0, rule.discountValue));
        return Math.max(0, basePrice * (1 - pct / 100));
    }

    // FIXED: віднімаємо фіксовану суму, не нижче 0.
    return Math.max(0, basePrice - rule.discountValue);
}

/** Повертає найкращу знижку для позиції (якщо їх декілька — найбільшу). */
export function pickBestDiscount(
    item: MenuItemResponse,
    rules: ActiveHappyHourRule[],
): { rule: ActiveHappyHourRule; finalPrice: number } | null {
    let best: { rule: ActiveHappyHourRule; finalPrice: number } | null = null;

    for (const rule of rules) {
        const candidate = calculateDiscountedPrice(item, rule);
        if (candidate === null) continue;
        if (best === null || candidate < best.finalPrice) {
            best = { rule, finalPrice: candidate };
        }
    }

    return best;
}

/** Форматує `endsAtMs - now` у вигляді "12m 34s" / "1h 05m". */
export function formatRemainingTime(msLeft: number): string {
    if (msLeft <= 0) return '0s';

    const totalSeconds = Math.floor(msLeft / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

type UsePublicHappyHourParams = {
    slug: string;
    enabled?: boolean;
};

/**
 * Головний хук: тягне правила, оцінює "які зараз активні" щосекунди
 * (через `setInterval`), і повертає список `ActiveHappyHourRule`.
 *
 * `now` оновлюється локально — це усуває мережевий джиттер і дозволяє
 * UI зворотного відліку працювати без перезапитів.
 */
export function usePublicHappyHour({ slug, enabled = true }: UsePublicHappyHourParams) {
    const query = useQuery({
        queryKey: ['public-happy-hour', slug] as const,
        queryFn: () => PublicHappyHourApi.getActiveRules(slug),
        enabled: Boolean(slug) && enabled,
        // Кешуємо на 1 хвилину — правила змінюються рідко, а таймер
        // і так оновлює UI щосекунди локально.
        staleTime: 60_000,
    });

    const [now, setNow] = useState<Date>(() => new Date());

    useEffect(() => {
        if (!enabled) return;
        // 1-секундний тік — достатньо для зворотного відліку "хв:сек".
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, [enabled]);

    const activeRules = useMemo<ActiveHappyHourRule[]>(() => {
        const rules = query.data ?? [];
        return rules
            .filter((rule) => isRuleActiveNow(rule, now))
            .map((rule) => ({ ...rule, endsAtMs: computeEndsAtMs(rule, now) }));
    }, [query.data, now]);

    return {
        ...query,
        activeRules,
        now,
    };
}
