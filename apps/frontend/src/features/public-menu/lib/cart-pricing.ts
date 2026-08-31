import type { CartItemResponse, SelectedModifier } from '@my-app/types';
import { parseSelectedModifiers, sumModifierAdjustments } from '@my-app/types';

import { pickBestDiscountForSubtotal, type ActiveHappyHourRule } from '../hooks/usePublicHappyHour';

/** Повний розрахунок одного рядка кошика. */
export type CartLinePricing = {
    /** Ціна однієї одиниці ДО знижки: база + сума надбавок модифікаторів. */
    subtotal: number;
    /** Ціна однієї одиниці ПІСЛЯ Happy Hour (== `subtotal`, якщо знижки немає). */
    unitPrice: number;
    /** `unitPrice * quantity` — саме це показуємо в рядку кошика. */
    lineTotal: number;
    /** Правило, що дало знижку, або `null`. */
    discountRule: ActiveHappyHourRule | null;
    /** Обрані модифікатори цього рядка (розпарсений знімок). */
    modifiers: SelectedModifier[];
};

/**
 * Єдина точка розрахунку ціни рядка кошика.
 *
 * Формула повторює серверну (`OrdersService`), щоб те, що гість бачить у
 * кошику, збігалося з тим, що врешті потрапить у чек:
 *   subtotal  = base + Σ modifiers
 *   unitPrice = subtotal − happyHour(subtotal)
 *
 * Ціни приходять рядками (Prisma `Decimal`), тому всюди явний `Number(...)`
 * з перевіркою на скінченність — інакше можна отримати `NaN` або, гірше,
 * конкатенацію рядків замість суми.
 */
export function priceCartLine(
    item: CartItemResponse,
    activeHappyHourRules: ActiveHappyHourRule[],
): CartLinePricing {
    const modifiers = parseSelectedModifiers(item.selectedModifiers);
    const menuItem = item.menuItem;

    // Страву могли видалити з меню — рядок лишається, але коштує 0.
    if (!menuItem) {
        return { subtotal: 0, unitPrice: 0, lineTotal: 0, discountRule: null, modifiers };
    }

    const basePrice = Number(menuItem.price);
    const safeBase = Number.isFinite(basePrice) ? basePrice : 0;
    const subtotal = safeBase + sumModifierAdjustments(modifiers);

    const best = pickBestDiscountForSubtotal(menuItem, activeHappyHourRules, subtotal);
    const unitPrice = best ? best.finalPrice : subtotal;

    return {
        subtotal,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        discountRule: best?.rule ?? null,
        modifiers,
    };
}

/** Підсумок кошика з урахуванням модифікаторів та Happy Hour. */
export function calculateCartTotal(
    items: CartItemResponse[],
    activeHappyHourRules: ActiveHappyHourRule[],
): number {
    return items.reduce((sum, item) => sum + priceCartLine(item, activeHappyHourRules).lineTotal, 0);
}
