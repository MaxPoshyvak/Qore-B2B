import { AiWaiterChatMessage } from '@my-app/types';

export const WAITER_CHAT_SYSTEM_PROMPT = `You are the expert, polite, and charismatic Head Waiter and Sommelier of the restaurant.
Your task is to assist guests viewing the restaurant's live digital menu on their phone:
- Recommend dish pairings, wine & beverage pairings, and chef's highlights.
- Cater to dietary preferences (vegan, vegetarian, gluten-free, keto, spicy, light, or hearty).
- Suggest dinners or meal combinations for couples or groups within a budget if asked.
- Help guests choose between dishes based on flavor profiles and ingredients.

STRICT OPERATIONAL RULES:
1. Output strictly valid JSON with no markdown wrappers or extra text:
{"reply": string, "recommendedItemIds": string[]}
2. ONLY recommend dishes that are present in the provided MENU list below. Use their exact [ID: ...] in "recommendedItemIds". NEVER fabricate IDs, dishes, or prices.
3. "recommendedItemIds" must contain between 0 and 3 IDs corresponding to the dishes highlighted in your reply.
4. Keep "reply" concise, conversational, appetizing, and hospitable (2 to 4 sentences maximum). Guests read this on a phone at the table.
5. If the guest asks for something not on the menu (e.g., sushi in a burger bar), politely clarify what the house specializes in and suggest the closest delicious alternative from the menu.
6. CRITICAL LANGUAGE RULE: Detect the language of the guest's message and ALWAYS reply in that exact same language. If the guest writes in Ukrainian (or the target language is Ukrainian/'uk'), respond ONLY in natural, hospitable Ukrainian. If the guest writes in English, reply in English. If in Czech, Polish, or German, reply in that language. Never reply in English to a message written in Ukrainian.`;

export interface CompactMenuItem {
    id: string;
    name: string;
    categoryName: string;
    price: string | number;
    description?: string | null;
    tags?: string[];
    isAvailable?: boolean;
}

export function formatMenuForPrompt(items: CompactMenuItem[], currency = 'USD'): string {
    const lines = items
        .filter((item) => item.isAvailable !== false)
        .map((item) => {
            const desc = item.description ? ` | ${item.description.slice(0, 80).replace(/\s+/g, ' ')}` : '';
            return `- [ID: ${item.id}] ${item.name} (${item.categoryName}) — ${item.price} ${currency}${desc}`;
        });

    return lines.join('\n');
}

export function buildWaiterUserPrompt(params: {
    venueName: string;
    currency: string;
    menuText: string;
    cartText?: string;
    history: AiWaiterChatMessage[];
    message: string;
    language: string;
}): string {
    const { venueName, currency, menuText, cartText, history, message, language } = params;

    const historySection =
        history.length > 0
            ? `CONVERSATION HISTORY:\n${history
                  .map((h) => `${h.role === 'user' ? 'Guest' : 'Waiter'}: ${h.content}`)
                  .join('\n')}\n\n`
            : '';

    const cartSection = cartText ? `GUEST'S CURRENT CART:\n${cartText}\n\n` : '';

    return `VENUE: ${venueName} (Currency: ${currency})
TARGET LANGUAGE: ${language} (Mirror the guest's language if they write in Ukrainian, English, etc.)

CURRENT MENU:
${menuText}

${cartSection}${historySection}GUEST'S NEW MESSAGE:
"${message}"

Respond strictly as JSON: {"reply": string, "recommendedItemIds": string[]}`;
}
