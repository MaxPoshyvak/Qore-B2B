export function generateTimeSlots(start: string, end: string, stepMinutes = 30): string[] {
    const toMinutes = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };
    const pad = (n: number) => String(n).padStart(2, '0');

    const startM = toMinutes(start);
    const endM = toMinutes(end);
    const slots: string[] = [];

    for (let m = startM; m < endM; m += stepMinutes) {
        slots.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
    }

    return slots;
}
