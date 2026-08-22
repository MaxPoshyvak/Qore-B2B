'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type CartState = {
    /** Guest display name — the only piece of guest identity kept in this store. */
    guestName: string | null;
    isNameModalOpen: boolean;
    isCartDrawerOpen: boolean;
    /** Internal: a menu item the guest tapped before naming themselves; flushed once named. */
    pendingMenuItemId: string | null;
    /** Takeaway (single-player) cart session id, when the guest opted for order-ahead. */
    takeawaySessionId: string | null;
    /** Drives the Dine-in vs Takeaway interception modal. */
    isOrderTypeModalOpen: boolean;
    /** Drives the Takeaway checkout (name + pickup time) modal. */
    isTakeawayCheckoutOpen: boolean;
    /** Preferred pickup mode for a takeaway order. */
    pickupMode: 'asap' | 'scheduled';
    /** Chosen pickup time (HH:mm) when `pickupMode` is "scheduled". */
    pickupTime: string | null;
    setGuestName: (name: string) => void;
    setCartDrawerOpen: (isOpen: boolean) => void;
    setNameModalOpen: (isOpen: boolean) => void;
    setPendingMenuItem: (menuItemId: string | null) => void;
    setTakeawaySessionId: (sessionId: string | null) => void;
    setOrderTypeModalOpen: (isOpen: boolean) => void;
    setTakeawayCheckoutOpen: (isOpen: boolean) => void;
    setPickupMode: (mode: 'asap' | 'scheduled') => void;
    setPickupTime: (time: string | null) => void;
};

/**
 * Local cart contents now live on the server (see `useSharedCart`). This store keeps
 * only UI/onboarding state plus the guest's display name. The guest's session id
 * lives in the shared `useTableSessionStore` and is persisted to `sessionStorage`
 * alongside `guestName` so identity survives a page refresh. The takeaway session
 * id is persisted too so a takeaway order survives a refresh.
 */
export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            guestName: null,
            isNameModalOpen: false,
            isCartDrawerOpen: false,
            pendingMenuItemId: null,
            takeawaySessionId: null,
            isOrderTypeModalOpen: false,
            isTakeawayCheckoutOpen: false,
            pickupMode: 'asap',
            pickupTime: null,

            setGuestName: (name) => set({ guestName: name.trim(), isNameModalOpen: false }),
            setCartDrawerOpen: (isOpen) => set({ isCartDrawerOpen: isOpen }),
            setNameModalOpen: (isOpen) => set({ isNameModalOpen: isOpen }),
            setPendingMenuItem: (menuItemId) => set({ pendingMenuItemId: menuItemId }),
            setTakeawaySessionId: (sessionId) => set({ takeawaySessionId: sessionId }),
            setOrderTypeModalOpen: (isOpen) => set({ isOrderTypeModalOpen: isOpen }),
            setTakeawayCheckoutOpen: (isOpen) => set({ isTakeawayCheckoutOpen: isOpen }),
            setPickupMode: (mode) => set({ pickupMode: mode }),
            setPickupTime: (time) => set({ pickupTime: time }),
        }),
        {
            name: 'qore-cart-session',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                guestName: state.guestName,
                takeawaySessionId: state.takeawaySessionId,
            }),
        },
    ),
);
