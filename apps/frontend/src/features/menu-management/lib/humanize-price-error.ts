/**
 * Turns Zod's raw type error into user-facing copy.
 *
 * `register('price', { valueAsNumber: true })` yields `NaN` for an empty
 * number input, which Zod reports as "expected number, received NaN".
 */
export function humanizePriceError(message?: string): string | undefined {
    if (!message) return undefined;
    if (message.includes('NaN') || message.includes('undefined')) return 'Price is required';
    return message;
}
