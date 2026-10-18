import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatCurrencyPrice } from '@my-app/types';

/**
 * Formats a monetary amount for display using the configured currency symbol and placement.
 *
 * Prisma serializes `Decimal` columns as strings over JSON, so prices arriving
 * from the API are strings — both shapes are accepted here.
 */
export function formatPrice(value: string | number, currency = 'USD'): string {
    return formatCurrencyPrice(value, currency);
}

/**
 * Merges Tailwind CSS classes without style conflicts using clsx and tailwind-merge.
 * Reliably handles multi-part prefixes (e.g. max-w vs max-h), variants, and conditional classes.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
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

/**
 * Robustly cleans and sanitizes image URLs, safely extracting direct URLs from
 * accidental markdown syntax (e.g. `[url](url)` or `[url]`), trimming whitespace,
 * and ensuring validity before passing to Next.js `<Image />`.
 */
export function sanitizeImageUrl(rawUrl?: string | null): string | null {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    let url = rawUrl.trim();
    if (!url) return null;

    // 1. Detect markdown link syntax: [title](https://...) or [https://...](https://...)
    const mdMatch = url.match(/\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    if (mdMatch) {
        url = mdMatch[1];
    }

    // 2. Detect plain url inside brackets or parentheses: [https://...] or (https://...)
    const bracketMatch =
        url.match(/^\[(https?:\/\/[^\s\]]+)\]$/) || url.match(/^\((https?:\/\/[^\s)]+)\)$/);
    if (bracketMatch) {
        url = bracketMatch[1];
    }

    // 3. Strip any residual surrounding quotes, brackets, or backticks
    url = url.replace(/^['"`\[\(]+|['"`\]\)]+$/g, '').trim();

    // 4. Must start with http://, https://, or leading /
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
        return null;
    }

    // 5. Test if URL constructor succeeds without throwing
    try {
        new URL(url, 'http://localhost');
        return url;
    } catch {
        return null;
    }
}
