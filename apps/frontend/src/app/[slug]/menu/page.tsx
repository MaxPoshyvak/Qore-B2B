'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

import { useGetPublicMenu } from '@/entities/menu/hooks/useGetPublicMenu';
import { useTableSessionStore } from '@/shared/store/useTableSessionStore';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { BaseHeader } from '@/shared/ui/BaseHeader';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useTheme } from '@/shared/hooks/useTheme';
import { MenuNotFound } from '@/features/public-menu/components/MenuNotFound';
import { PublicMenuList } from '@/features/public-menu/components/PublicMenuList';
import { PublicMenuSkeleton } from '@/features/public-menu/components/PublicMenuSkeleton';
import { StickyCategoryNav } from '@/features/public-menu/components/StickyCategoryNav';
import { VenueHeader } from '@/features/public-menu/components/VenueHeader';
import { CartBanner } from '@/features/public-menu/components/CartBanner';
import { CartDrawer } from '@/features/public-menu/components/CartDrawer';
import { OrderSuccessOverlay } from '@/features/public-menu/components/OrderSuccessOverlay';
import { OrderTypeModal } from '@/features/public-menu/components/OrderTypeModal';
import { TakeawayCheckoutModal } from '@/features/public-menu/components/TakeawayCheckoutModal';
import { GuestNameModal } from '@/features/public-menu/components/GuestNameModal';
import { useSharedCart, useAddCartItem } from '@/features/public-menu/hooks/useSharedCart';
import { useCartStore } from '@/features/public-menu/store/useCartStore';

/** Flushes the dish a guest tapped before naming themselves, once they have a name. */
function SharedCartCoordinator({
    tableId,
    takeawaySessionId,
}: {
    tableId: string | null;
    takeawaySessionId: string | null;
}) {
    const pendingMenuItemId = useCartStore((s) => s.pendingMenuItemId);
    const guestName = useCartStore((s) => s.guestName);
    const setPendingMenuItem = useCartStore((s) => s.setPendingMenuItem);
    const setNameModalOpen = useCartStore((s) => s.setNameModalOpen);
    const guestSessionId = useTableSessionStore((s) => s.guestSessionId);
    const addItem = useAddCartItem(tableId, takeawaySessionId);

    useEffect(() => {
        if (!pendingMenuItemId) return;
        if (!tableId && !takeawaySessionId) return;
        if (!guestSessionId) return;
        if (!guestName) {
            setNameModalOpen(true);
            return;
        }
        addItem.mutate({
            menuItemId: pendingMenuItemId,
            quantity: 1,
            guestSessionId,
            guestName,
        });
        setPendingMenuItem(null);
    }, [pendingMenuItemId, guestName, guestSessionId, tableId, takeawaySessionId, addItem, setPendingMenuItem, setNameModalOpen]);

    return null;
}

export default function PublicMenuPage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const { theme, toggle, mounted } = useTheme();
    const { data, isLoading } = useGetPublicMenu(resolvedSlug);

    const tableId = useTableSessionStore((s) => s.tableId);
    const clearTableSession = useTableSessionStore((s) => s.clearTableSession);
    const takeawaySessionId = useCartStore((s) => s.takeawaySessionId);
    const setTakeawaySessionId = useCartStore((s) => s.setTakeawaySessionId);
    const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
    const [takeawayPlaced, setTakeawayPlaced] = useState(false);

    const { data: cart } = useSharedCart(tableId, takeawaySessionId);

    function handleRestart() {
        setCartDrawerOpen(false);
        if (takeawayPlaced) {
            setTakeawayPlaced(false);
            setTakeawaySessionId(null);
        } else {
            clearTableSession();
        }
    }

    return (
        <main className="relative min-h-screen bg-transparent text-[#0A0A0C] antialiased dark:bg-transparent dark:text-[#F5F4F2]">
            <AmbientBackground />

            <BaseHeader>{mounted && <ThemeToggle theme={theme} toggle={toggle} />}</BaseHeader>

            <div className="mx-auto max-w-6xl px-6 pb-32">
                {isLoading ? (
                    <PublicMenuSkeleton />
                ) : !data ? (
                    <MenuNotFound slug={resolvedSlug} />
                ) : (
                    <>
                        <VenueHeader venue={data.venue} />
                        <StickyCategoryNav categories={data.categories} />
                        <PublicMenuList
                            categories={data.categories}
                            tableId={tableId}
                            takeawaySessionId={takeawaySessionId}
                            cartItems={cart?.items ?? []}
                        />
                    </>
                )}
            </div>

            <SharedCartCoordinator tableId={tableId} takeawaySessionId={takeawaySessionId} />
            <AnimatePresence>
                <CartBanner cart={cart} />
            </AnimatePresence>
            <CartDrawer
                cart={cart}
                tableId={tableId}
                takeawaySessionId={takeawaySessionId}
            />
            <GuestNameModal />
            <OrderTypeModal />
            <TakeawayCheckoutModal onComplete={() => setTakeawayPlaced(true)} />

            <AnimatePresence>
                {(tableId && cart && !cart.isActive) || (takeawayPlaced && takeawaySessionId) ? (
                    <OrderSuccessOverlay onRestart={handleRestart} />
                ) : null}
            </AnimatePresence>
        </main>
    );
}
