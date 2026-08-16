import { workingHoursSchema } from '@my-app/types';

export type DayKey =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';

export const WEEK_DAYS: DayKey[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
];

export const DAY_LABELS: Record<DayKey, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
};

export type DaySchedule = {
    key: DayKey;
    label: string;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
    isToday: boolean;
};

function toMinutes(time: string | null | undefined): number | null {
    if (!time) return null;
    const match = /^([0-1]?\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
}

function jsDayToKey(jsDay: number): DayKey {
    // getDay(): 0 = Sunday .. 6 = Saturday
    const map: DayKey[] = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ];
    return map[jsDay];
}

/** Normalizes the Prisma `Json` working-hours blob into a typed weekly schedule. */
export function parseWorkingHours(value: unknown): Record<DayKey, DaySchedule> | null {
    if (!value) return null;

    const parsed = workingHoursSchema.safeParse(
        typeof value === 'string' ? safeParse(value) : value,
    );
    if (!parsed.success) return null;

    const data = parsed.data;
    const todayKey = jsDayToKey(new Date().getDay());

    return WEEK_DAYS.reduce(
        (acc, key) => {
            const day = data[key];
            const open = Boolean(day?.isOpen);
            acc[key] = {
                key,
                label: DAY_LABELS[key],
                isOpen: open,
                openTime: day?.openTime ?? null,
                closeTime: day?.closeTime ?? null,
                isToday: key === todayKey,
            };
            return acc;
        },
        {} as Record<DayKey, DaySchedule>,
    );
}

export type VenueStatus = {
    isOpen: boolean;
    label: string;
    hasHours: boolean;
};

/** Computes the live open/closed status and the badge copy. */
export function getVenueStatus(value: unknown): VenueStatus {
    const schedule = parseWorkingHours(value);
    if (!schedule) {
        return { isOpen: false, label: 'HOURS NOT SET', hasHours: false };
    }

    const now = new Date();
    const todayKey = jsDayToKey(now.getDay());
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const today = schedule[todayKey];
    const todayOpen = toMinutes(today.openTime);
    const todayClose = toMinutes(today.closeTime);

    if (today.isOpen && todayOpen !== null && todayClose !== null && nowMinutes >= todayOpen && nowMinutes < todayClose) {
        return {
            isOpen: true,
            label: `OPEN NOW • CLOSES AT ${today.closeTime}`,
            hasHours: true,
        };
    }

    // Find the next opening day (starting today, wrapping around the week).
    for (let offset = 0; offset < 7; offset++) {
        const index = (WEEK_DAYS.indexOf(todayKey) + offset) % 7;
        const day = schedule[WEEK_DAYS[index]];
        if (!day.isOpen || !day.openTime) continue;
        if (offset === 0 && todayOpen !== null && nowMinutes < todayOpen) {
            return {
                isOpen: false,
                label: `CLOSED • OPENS TODAY AT ${day.openTime}`,
                hasHours: true,
            };
        }
        if (offset > 0) {
            return {
                isOpen: false,
                label: `CLOSED • OPENS ${day.label.toUpperCase()} AT ${day.openTime}`,
                hasHours: true,
            };
        }
    }

    return { isOpen: false, label: 'CURRENTLY CLOSED', hasHours: true };
}

function safeParse(input: string): unknown {
    try {
        return JSON.parse(input);
    } catch {
        return null;
    }
}
