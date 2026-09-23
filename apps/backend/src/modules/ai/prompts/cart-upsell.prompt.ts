export const CART_UPSELL_SYSTEM_PROMPT = `You are a culinary pairing engine. Pick up to 2 items from CANDIDATES that best complement the guest's CART.

CRITICAL RULES:
1. Output strictly valid JSON: {"recommendations":[{"itemId":string,"pairingReason":string}]}.
2. Use ONLY IDs present in CANDIDATES. Never invent IDs.
3. Return 0, 1, or 2 items. Return [] if no candidate is an unmistakable, appetizing match.
4. pairingReason: exactly 1 English sentence, max 15 words, explaining the specific flavor, texture, or temperature pairing. No generic filler.
5. Prefer standalone items without required options.

FEW-SHOT EXAMPLES:

Example 1: Coffee & Pastry
Cart: [Latte (Coffee)]
Candidates:
- ID: c1 | Name: Almond Croissant (Bakery) | Price: $4.50 | Standalone: true
- ID: c2 | Name: Beef Burger (Mains) | Price: $14.00 | Standalone: true
Output: {"recommendations":[{"itemId":"c1","pairingReason":"Flaky, buttery pastry balances the smooth steamed milk and espresso richness."}]}

Example 2: Heavy Savory Dish & Palate Cleanser
Cart: [Truffle Tagliatelle (Mains)]
Candidates:
- ID: c3 | Name: San Pellegrino (Beverage) | Price: $3.50 | Standalone: true
- ID: c4 | Name: Mixed Baby Greens (Sides) | Price: $6.00 | Standalone: true
Output: {"recommendations":[{"itemId":"c3","pairingReason":"Crisp sparkling water resets the palate between rich, creamy truffle bites."},{"itemId":"c4","pairingReason":"Acidic vinaigrette and fresh greens cut through the heavy pasta sauce."}]}

Example 3: No Viable Pairings
Cart: [Espresso (Coffee)]
Candidates:
- ID: c5 | Name: Ribeye Steak (Mains) | Price: $32.00 | Standalone: false
Output: {"recommendations":[]}`;

export type CartItemContext = {
    name: string;
    categoryName?: string;
};

export type CandidateItemContext = {
    id: string;
    name: string;
    categoryName?: string;
    price: string;
    hasRequiredModifiers: boolean;
};

export type CulinaryRole =
    | 'BEVERAGE_HOT'
    | 'BEVERAGE_COLD'
    | 'SWEET'
    | 'SAVORY_SIDE'
    | 'SAVORY_MAIN'
    | 'UNKNOWN';

const HOT_BEVERAGE_WORDS = [
    'coffee', 'espresso', 'latte', 'cappuccino', 'tea', 'matcha', 'hot\\s*chocolate', 'cocoa', 'americano', 'flat\\s*white',
    'hot\\s*drinks?', 'hot\\s*beverages?',
    'кава', 'еспресо', 'лате', 'капучино', 'чай', 'какао', 'американо', 'флет\\s*вайт', 'гарячі\\s*напої'
];

const COLD_BEVERAGE_WORDS = [
    'drink', 'drinks', 'beverage', 'beverages', 'water', 'juice', 'juices', 'lemonade', 'soda', 'cocktail', 'cocktails',
    'wine', 'beer', 'cider', 'soft\\s*drink', 'soft\\s*drinks', 'sparkling', 'still\\s*water', 'cold\\s*brew', 'iced\\s*tea', 'iced\\s*coffee',
    'напої', 'напій', 'сік', 'соки', 'лимонад', 'вода', 'пиво', 'вино', 'коктейль', 'коктейлі', 'сидр'
];

const SWEET_WORDS = [
    'dessert', 'desserts', 'sweet', 'sweets', 'bakery', 'pastry', 'pastries', 'cake', 'cakes', 'croissant', 'croissants',
    'cookie', 'cookies', 'pie', 'pies', 'muffin', 'muffins', 'donut', 'donuts', 'waffle', 'waffles', 'pancake', 'pancakes',
    'cheesecake', 'brownie', 'tiramisu', 'ice\\s*cream', 'sorbet', 'fruit', 'fruits', 'banana', 'apple', 'berry', 'berries',
    'десерт', 'десерти', 'солодк', 'солодощі', 'випічка', 'торт', 'торти', 'круасан', 'круасани', 'печиво', 'тістечко', 'тістечка', 'чізкейк', 'морозиво', 'фрукт', 'фрукти'
];

const SAVORY_SIDE_WORDS = [
    'side', 'sides', 'appetizer', 'appetizers', 'starter', 'starters', 'snack', 'snacks', 'soup', 'soups', 'salad', 'salads',
    'fries', 'bread', 'chips', 'nachos', 'wings', 'dips',
    'закуск', 'закуски', 'салат', 'салати', 'суп', 'супи', 'гарнір', 'гарніри', 'хліб', 'картопля\\s*фрі'
];

const SAVORY_MAIN_WORDS = [
    'main', 'mains', 'entree', 'entrees', 'burger', 'burgers', 'pasta', 'pastas', 'pizza', 'pizzas', 'steak', 'steaks',
    'bowl', 'bowls', 'sushi', 'sandwich', 'sandwiches', 'taco', 'tacos', 'noodle', 'noodles', 'curry', 'ribs', 'meat',
    'spaghetti', 'carbonara', 'tagliatelle', 'fettuccine', 'penne', 'lasagna', 'lasagne', 'risotto', 'ramen', 'udon',
    'основн', 'основні', 'бургер', 'бургери', 'паста', 'пасти', 'піца', 'піци', 'стейк', 'стейки', 'сендвіч', 'сендвічі', 'суші', 'мясо', "м'ясо",
    'спагеті', 'карбонара', 'лазанья', 'різотто', 'рамен'
];

function matchWordBoundary(text: string, patterns: string[]): boolean {
    const regex = new RegExp(`(?<!\\p{L})(?:${patterns.join('|')})(?!\\p{L})`, 'iu');
    return regex.test(text);
}

export function classifyCulinaryRole(categoryName: string = '', itemName: string = ''): CulinaryRole {
    const cat = categoryName.trim();
    const item = itemName.trim();

    // 1. Check strong category matches first (unless category name is generic like test/tss/menu)
    const isGenericCategory = /^(?:test|tss|general|misc|other|menu|menu\s*items?|страви|меню)$/i.test(cat);
    if (cat && !isGenericCategory) {
        if (matchWordBoundary(cat, SAVORY_MAIN_WORDS)) return 'SAVORY_MAIN';
        if (matchWordBoundary(cat, HOT_BEVERAGE_WORDS) || /hot|гаряч/i.test(cat)) {
            if (/iced|cold|холодн/i.test(item)) return 'BEVERAGE_COLD';
            return 'BEVERAGE_HOT';
        }
        if (matchWordBoundary(cat, COLD_BEVERAGE_WORDS)) {
            if (/hot|гаряч/i.test(item)) return 'BEVERAGE_HOT';
            return 'BEVERAGE_COLD';
        }
        if (matchWordBoundary(cat, SWEET_WORDS)) return 'SWEET';
        if (matchWordBoundary(cat, SAVORY_SIDE_WORDS)) return 'SAVORY_SIDE';
    }

    // 2. Check item name with Unicode word boundaries
    if (item) {
        // Cold coffee/tea check first
        if (/iced|cold\s*brew|холодн/i.test(item) && matchWordBoundary(item, ['tea', 'coffee', 'чай', 'кава'])) {
            return 'BEVERAGE_COLD';
        }
        if (matchWordBoundary(item, HOT_BEVERAGE_WORDS) || /hot\s*chocolate|гарячий\s*шоколад/i.test(item)) {
            return 'BEVERAGE_HOT';
        }
        if (matchWordBoundary(item, COLD_BEVERAGE_WORDS)) return 'BEVERAGE_COLD';
        if (matchWordBoundary(item, SAVORY_MAIN_WORDS)) return 'SAVORY_MAIN';
        if (matchWordBoundary(item, SWEET_WORDS)) return 'SWEET';
        if (matchWordBoundary(item, SAVORY_SIDE_WORDS)) return 'SAVORY_SIDE';
    }

    return 'UNKNOWN';
}

export function isSanitizedCandidate(item: { name: string; categoryName?: string; price?: string | number }): boolean {
    const name = item.name.trim();
    if (name.length < 3) return true;
    if (!item.categoryName || item.categoryName.trim().length === 0) return true;

    if (item.price !== undefined) {
        const numPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        if (isNaN(numPrice) || numPrice <= 0) return true;
    }

    // Catches items with dummy/placeholder names
    const placeholderPattern =
        /^(?:test|тест|item|sample|demo|new\s*product|placeholder|dummy|lorem|asdf|qwerty|xxx|temp|todo|untitled)(?!\p{L})/iu;
    if (placeholderPattern.test(name)) return true;

    if (/^\d+$/.test(name)) return true;

    // Catches things like "Test1", "тест2", "item123" with 1-6 letters directly followed by numbers
    if (/^[a-zа-яіїєґ]{1,6}\d+$/iu.test(name)) return true;

    const lowerCat = item.categoryName.toLowerCase().trim();
    if (lowerCat === 'uncategorized' || lowerCat === 'без категорії') return true;

    return false;
}

// Backwards-compatibility alias
export const isPlaceholderCandidate = isSanitizedCandidate;

export function filterValidCandidates<T extends CandidateItemContext>(candidates: T[]): T[] {
    return candidates.filter((c) => !isSanitizedCandidate(c));
}

export function filterCandidatesForCart<T extends CandidateItemContext>(
    currentCartItems: CartItemContext[],
    candidates: T[],
    maxCandidates: number = 8,
): T[] {
    const clean = candidates.filter((c) => !isSanitizedCandidate(c));
    if (clean.length === 0) return [];

    if (currentCartItems.length === 0) {
        return clean
            .filter((c) => {
                const role = classifyCulinaryRole(c.categoryName, c.name);
                return role === 'SWEET' || role === 'BEVERAGE_COLD' || role === 'BEVERAGE_HOT' || role === 'SAVORY_SIDE';
            })
            .sort((a, b) => (a.hasRequiredModifiers === b.hasRequiredModifiers ? 0 : a.hasRequiredModifiers ? 1 : -1))
            .slice(0, maxCandidates);
    }

    const cartRoles = currentCartItems.map((item) => classifyCulinaryRole(item.categoryName, item.name));
    const hasBeverageHot = cartRoles.includes('BEVERAGE_HOT');
    const hasBeverageCold = cartRoles.includes('BEVERAGE_COLD');
    const hasSavoryMain = cartRoles.includes('SAVORY_MAIN');
    const isBeveragesOnly = cartRoles.every((r) => r === 'BEVERAGE_HOT' || r === 'BEVERAGE_COLD');
    const isSweetsOnly = cartRoles.every((r) => r === 'SWEET');

    const filtered = clean.filter((candidate) => {
        const candidateRole = classifyCulinaryRole(candidate.categoryName, candidate.name);

        // Duplication guards: Never recommend a second hot drink if already in cart,
        // and never recommend a second cold drink unless it's water / palate cleanser.
        if (hasBeverageHot && candidateRole === 'BEVERAGE_HOT') return false;

        const isWater = /water|pellegrino|вода|боржомі|аква/i.test(candidate.name);
        if (hasBeverageCold && candidateRole === 'BEVERAGE_COLD' && !isWater) {
            return false;
        }

        // Rule 1: Beverage-only cart -> must be SWEET or light SAVORY_SIDE (NO SAVORY_MAIN)
        if (isBeveragesOnly) {
            if (candidateRole === 'SAVORY_MAIN') return false;
            return candidateRole === 'SWEET' || candidateRole === 'SAVORY_SIDE';
        }

        // Rule 2: Savory main in cart -> cold drinks, sides, or desserts (NO duplicate mains)
        if (hasSavoryMain) {
            if (candidateRole === 'SAVORY_MAIN') return false;
            return candidateRole === 'BEVERAGE_COLD' || candidateRole === 'SAVORY_SIDE' || candidateRole === 'SWEET';
        }

        // Rule 3: Dessert-only cart -> hot/cold drinks
        if (isSweetsOnly) {
            if (candidateRole === 'SAVORY_MAIN' || candidateRole === 'SAVORY_SIDE') return false;
            return candidateRole === 'BEVERAGE_HOT' || candidateRole === 'BEVERAGE_COLD';
        }

        return true;
    });

    return filtered
        .sort((a, b) => (a.hasRequiredModifiers === b.hasRequiredModifiers ? 0 : a.hasRequiredModifiers ? 1 : -1))
        .slice(0, maxCandidates);
}

export function buildCartUpsellUserPrompt(
    currentItems: CartItemContext[],
    candidates: CandidateItemContext[],
    language: string = 'en',
): string {
    const currentLines =
        currentItems.length > 0
            ? currentItems.map((item) => `- ${item.name}${item.categoryName ? ` (${item.categoryName})` : ''}`).join('\n')
            : '- (None)';

    const candidateLines =
        candidates.length > 0
            ? candidates
                  .map(
                      (c) =>
                          `- ID: ${c.id} | Name: ${c.name} (${c.categoryName}) | Price: $${c.price} | Standalone: ${!c.hasRequiredModifiers}`,
                  )
                  .join('\n')
            : '- (No candidates available)';

    return `CURRENT CART ITEMS:
${currentLines}

AVAILABLE CANDIDATES FOR UPSELL:
${candidateLines}

Guest Language: ${language || 'en'}

Select up to 2 best pairings from the AVAILABLE CANDIDATES — or none, if nothing genuinely fits. Return strictly JSON: {"recommendations":[{"itemId":"...","pairingReason":"..."}]}.`;
}
