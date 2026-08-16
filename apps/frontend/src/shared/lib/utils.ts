/**
 * Formats a monetary amount for display.
 *
 * Prisma serializes `Decimal` columns as strings over JSON, so prices arriving
 * from the API are strings — both shapes are accepted here.
 */
export function formatPrice(value: string | number, currency = 'USD'): string {
    const amount = typeof value === 'number' ? value : Number.parseFloat(value);
    if (!Number.isFinite(amount)) return '—';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Tiny class-name combiner (clsx + tailwind-merge style, dependency-free).
 * Filters out falsy values and merges conflicting Tailwind utilities so later
 * classes win over earlier ones (e.g. `px-2 px-4` -> `px-4`, `bg-red bg-blue` -> `bg-blue`).
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
    const classList: string[] = [];

    for (const entry of classes) {
        if (!entry) continue;
        for (const part of entry.split(' ')) {
            const trimmed = part.trim();
            if (!trimmed) continue;
            // Strip the conflicting utility if a later one with the same base arrives.
            const base = trimmed.split('-')[0];
            for (let i = classList.length - 1; i >= 0; i--) {
                if (classList[i].split('-')[0] === base) {
                    classList.splice(i, 1);
                }
            }
            classList.push(trimmed);
        }
    }

    return classList.join(' ');
}

export function cyrillicToSlug(text: string): string {
    const cyrillicMap: Record<string, string> = {
        а: 'a',
        б: 'b',
        в: 'v',
        г: 'h',
        ґ: 'g',
        д: 'd',
        е: 'e',
        є: 'ie',
        ж: 'zh',
        з: 'z',
        и: 'y',
        і: 'i',
        ї: 'i',
        й: 'i',
        к: 'k',
        л: 'l',
        м: 'm',
        н: 'n',
        о: 'o',
        п: 'p',
        р: 'r',
        с: 's',
        т: 't',
        у: 'u',
        ф: 'f',
        х: 'kh',
        ц: 'ts',
        ч: 'ch',
        ш: 'sh',
        щ: 'shch',
        ь: '',
        ю: 'iu',
        я: 'ia',
    };

    return (
        text
            .toLowerCase()
            // Замінюємо кожну кириличну літеру на відповідник
            .split('')
            .map((char) => cyrillicMap[char] || char)
            .join('')
            // Замінюємо пробіли та підкреслення на дефіси
            .replace(/[\s_]+/g, '-')
            // Видаляємо всі символи, крім латиниці, цифр та дефісів
            .replace(/[^\w\-]+/g, '')
            // Видаляємо дублювання дефісів (напр. '---' -> '-')
            .replace(/\-\-+/g, '-')
            // Забираємо дефіси з початку та кінця
            .replace(/^-+|-+$/g, '')
    );
}
