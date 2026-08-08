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
