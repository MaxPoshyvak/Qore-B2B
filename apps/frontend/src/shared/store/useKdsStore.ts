'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type KdsState = {
    /** The 4-digit PIN for the current KDS board, persisted in sessionStorage. */
    pin: string | null;
    setPin: (pin: string) => void;
    clearPin: () => void;
};

/**
 * Holds the KDS PIN for the isolated kitchen board. Persisted to `sessionStorage`
 * so a page refresh on the kitchen tablet keeps the board unlocked, but it never
 * touches `localStorage` (cleared when the tab closes) and never stores the token.
 */
export const useKdsStore = create<KdsState>()(
    persist(
        (set) => ({
            pin: null,
            setPin: (pin) => set({ pin }),
            clearPin: () => set({ pin: null }),
        }),
        {
            name: 'qore-kds-pin',
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);
