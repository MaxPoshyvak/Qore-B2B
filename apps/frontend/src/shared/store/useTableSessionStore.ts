'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SetTableSessionInput = {
    tableId: string;
    tableName: string;
    tenantSlug: string;
};

type EnsureTableSessionInput = {
    tableId: string;
    tenantSlug?: string | null;
};

type TableSessionState = {
    tableId: string | null;
    tableName: string | null;
    tenantSlug: string | null;
    guestSessionId: string;
    setTableSession: (data: SetTableSessionInput) => void;
    /** Idempotent init from a URL (`?table=...`) — keeps the existing guest identity. */
    ensureTableSession: (data: EnsureTableSessionInput) => void;
    /** Guarantees a guest identity exists (used by takeaway, which never scans a table). */
    ensureGuestSessionId: () => string;
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
        (set, get) => ({
            tableId: null,
            tableName: null,
            tenantSlug: null,
            guestSessionId: '',
            setTableSession: (data) =>
                set((state) => ({
                    ...data,
                    guestSessionId: state.guestSessionId || generateGuestSessionId(),
                })),
            ensureTableSession: ({ tableId, tenantSlug }) =>
                set((state) => {
                    const isSameTable = state.tableId === tableId;
                    const nextSlug = tenantSlug ?? state.tenantSlug;
                    const guestSessionId = state.guestSessionId || generateGuestSessionId();

                    // Already initialized for this table — return the identical state so
                    // zustand skips both the notification and the storage write.
                    if (isSameTable && state.tenantSlug === nextSlug && state.guestSessionId === guestSessionId) {
                        return state;
                    }

                    return {
                        tableId,
                        // A different table invalidates the cached display name (resolved via QR).
                        tableName: isSameTable ? state.tableName : null,
                        tenantSlug: nextSlug,
                        guestSessionId,
                    };
                }),
            ensureGuestSessionId: () => {
                const existing = get().guestSessionId;
                if (existing) return existing;

                const guestSessionId = generateGuestSessionId();
                set({ guestSessionId });
                return guestSessionId;
            },
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
