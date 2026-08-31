/**
 * Хелпери для роботи з "вільними" атрибутами страви.
 *
 * `allergens` і `tags` у Prisma — колонки `Json?`, тому в типах вони приходять
 * як `unknown`. Обидва шари (дашборд-білдер і публічне меню) мусять читати їх
 * однаково, а FSD забороняє імпорти між features — тож хелпер живе у `shared`.
 */

/** Безпечно зводить Json-значення до масиву рядків, відкидаючи сміття. */
export function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is string => typeof entry === 'string');
}
