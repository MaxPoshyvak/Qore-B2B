/**
 * Shared vocabularies for dish attributes used by both the menu builder form
 * and the AI dish generator. Kept in the feature `lib` so the assistant bar
 * and the form never drift apart (and to avoid a circular import between the
 * two components).
 */

export const ALLERGENS = ['Dairy', 'Gluten', 'Nuts', 'Soy', 'Eggs', 'Fish', 'Shellfish'] as const;

export const DIETARY_TAGS = ['Vegan', 'Vegetarian', 'Spicy', 'Halal', 'Sugar-free', 'Bestseller', 'New'] as const;

/** Collapse a label to alphanumerics only for forgiving comparisons. */
const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Maps a free-form AI label onto a known vocabulary value when one matches,
 * otherwise returns `null` so unknown values are dropped instead of persisted
 * as oddly-cased strings.
 */
function matchKnown(value: string, known: readonly string[]): string | null {
    const v = normalize(value);
    if (!v) return null;
    return known.find((k) => normalize(k) === v) ?? null;
}

/** Normalizes AI allergen labels to the form's accepted allergen set. */
export function normalizeAllergens(values: string[]): string[] {
    const out = new Set<string>();
    for (const value of values) {
        const match = matchKnown(value, ALLERGENS);
        if (match) out.add(match);
    }
    return [...out];
}

/** Normalizes AI dietary labels to the form's accepted dietary tags set. */
export function normalizeDietary(values: string[]): string[] {
    const out = new Set<string>();
    for (const value of values) {
        const match = matchKnown(value, DIETARY_TAGS);
        if (match) out.add(match);
    }
    return [...out];
}
