'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SetTableSessionInput = {
    tableId: string;
    tableName: string;
    tenantSlug: string;
};

type TableSessionState = {
    tableId: string | null;
    tableName: string | null;
    tenantSlug: string | null;
    guestSessionId: string;
    setTableSession: (data: SetTableSessionInput) => void;
    clearTableSession: () => void;
};

function generateGuestSessionId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/** Persisted guest table session (sessionStorage) — survives navigation within a tab.
 *  Lives in `shared` because it is consumed by more than one feature (table-resolve, public-menu). */
export const useTableSessionStore = create<TableSessionState>()(
    persist(
        (set) => ({
            tableId: null,
            tableName: null,
            tenantSlug: null,
            guestSessionId: '',
            setTableSession: (data) =>
                set((state) => ({
                    ...data,
                    guestSessionId: state.guestSessionId || generateGuestSessionId(),
                })),
            clearTableSession: () =>
                set((state) => ({
                    tableId: null,
                    tableName: null,
                    tenantSlug: null,
                    guestSessionId: state.guestSessionId,
                })),
        }),
        {
            name: 'qore-table-session',
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);
