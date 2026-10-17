'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

import type { PublicMenuResponseDTO } from '@my-app/types';
import { useGetPublicMenu } from '@/entities/menu/hooks/useGetPublicMenu';
import { AnalyticsApi } from '@/features/analytics';
import { useTableSessionStore } from '@/shared/store/useTableSessionStore';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { BaseHeader } from '@/shared/ui/BaseHeader';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { useTheme } from '@/shared/hooks/useTheme';
import { MenuNotFound } from '@/features/public-menu/components/MenuNotFound';
import { PublicMenuList } from '@/features/public-menu/components/PublicMenuList';
import { PublicMenuSkeleton } from '@/features/public-menu/components/PublicMenuSkeleton';
import { StickyCategoryNav } from '@/features/public-menu/components/StickyCategoryNav';
import { VenueHeader } from '@/features/public-menu/components/VenueHeader';
import { MenuSearchAndFilter } from '@/features/public-menu/components/MenuSearchAndFilter';
import { useMenuFilters } from '@/features/public-menu/hooks/useMenuFilters';
import { CartBanner } from '@/features/public-menu/components/CartBanner';
import { usePublicHappyHour } from '@/features/public-menu/hooks/usePublicHappyHour';
import { ReservationAlert } from '@/features/reservations/components/ReservationAlert';
import { useSharedCart, useAddCartItem, useStartNewCartSession } from '@/features/public-menu/hooks/useSharedCart';
import { useCartStore } from '@/features/public-menu/store/useCartStore';
import { AiWaiterButton } from '@/features/public-menu/components/AiWaiterButton';

// Dynamically code-split heavy interactive modals out of critical LCP path
const AiWaiterModal = dynamic(
    () => import('@/features/public-menu/components/AiWaiterModal').then((m) => m.AiWaiterModal),
    { ssr: false },
);

const CartDrawer = dynamic(
    () => import('@/features/public-menu/components/CartDrawer').then((m) => m.CartDrawer),
    { ssr: false },
);

const TakeawayCheckoutModal = dynamic(
    () => import('@/features/public-menu/components/TakeawayCheckoutModal').then((m) => m.TakeawayCheckoutModal),
    { ssr: false },
);

const OrderTypeModal = dynamic(
    () => import('@/features/public-menu/components/OrderTypeModal').then((m) => m.OrderTypeModal),
    { ssr: false },
);

const GuestNameModal = dynamic(
    () => import('@/features/public-menu/components/GuestNameModal').then((m) => m.GuestNameModal),
    { ssr: false },
);

const OrderSuccessOverlay = dynamic(
    () => import('@/features/public-menu/components/OrderSuccessOverlay').then((m) => m.OrderSuccessOverlay),
    { ssr: false },
);

const trackedMenuViews = new Set<string>();

function trackMenuViewOnce(slug: string, tableId?: string) {
    if (trackedMenuViews.has(slug)) return;
    trackedMenuViews.add(slug);
    void AnalyticsApi.trackMenuView(slug, tableId).catch(() => {
        // Tracking failure shouldn't break the user experience
    });
}

function TableSessionInitializer({ tenantSlug }: { tenantSlug: string }) {
    const searchParams = useSearchParams();
    const tableParam = searchParams.get('table');

    const ensureTableSession = useTableSessionStore((s) => s.ensureTableSession);
    const setTakeawaySessionId = useCartStore((s) => s.setTakeawaySessionId);
    const setOrderTypeModalOpen = useCartStore((s) => s.setOrderTypeModalOpen);

    useEffect(() => {
        if (!tableParam) return;

        ensureTableSession({ tableId: tableParam, tenantSlug });
        setTakeawaySessionId(null);
        setOrderTypeModalOpen(false);
    }, [tableParam, tenantSlug, ensureTableSession, setTakeawaySessionId, setOrderTypeModalOpen]);

    return null;
}

function SharedCartCoordinator({
    tableId,
    takeawaySessionId,
}: {
    tableId: string | null;
    takeawaySessionId: string | null;
}) {
    const pendingCartItem = useCartStore((s) => s.pendingCartItem);
    const guestName = useCartStore((s) => s.guestName);
    const setPendingCartItem = useCartStore((s) => s.setPendingCartItem);
    const setNameModalOpen = useCartStore((s) => s.setNameModalOpen);
    const guestSessionId = useTableSessionStore((s) => s.guestSessionId);
    const addItem = useAddCartItem(tableId, takeawaySessionId);

    useEffect(() => {
        if (!pendingCartItem) return;
        if (!tableId && !takeawaySessionId) return;
        if (!guestSessionId) return;
        if (!guestName) {
            setNameModalOpen(true);
            return;
        }
        addItem.mutate({
            menuItemId: pendingCartItem.menuItemId,
            quantity: pendingCartItem.quantity,
            guestSessionId,
            guestName,
            selectedOptionIds: pendingCartItem.selectedOptionIds,
        });
        setPendingCartItem(null);
    }, [
        pendingCartItem,
        guestName,
        guestSessionId,
        tableId,
        takeawaySessionId,
        addItem,
        setPendingCartItem,
        setNameModalOpen,
    ]);

    return null;
}

type PublicMenuClientViewProps = {
    slug: string;
    initialMenu?: PublicMenuResponseDTO | null;
};

export function PublicMenuClientView({ slug, initialMenu }: PublicMenuClientViewProps) {
    const router = useRouter();
    const { theme, toggle, mounted } = useTheme();
    const { data: menuData, isLoading: queryLoading } = useGetPublicMenu(slug, initialMenu);
    const data = menuData ?? initialMenu ?? undefined;
    const isLoading = queryLoading && !data;

    const { activeRules: activeHappyHourRules } = usePublicHappyHour({ slug });

    const {
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        selectedTags,
        toggleTag,
        onlyHappyHour,
        setOnlyHappyHour,
        resetFilters,
        availableTags,
        hasHappyHourDeals,
        filteredCategories,
        totalMatches,
        isFiltered,
    } = useMenuFilters({
        categories: data?.categories,
        activeHappyHourRules,
    });

    const tableId = useTableSessionStore((s) => s.tableId);
    const guestSessionId = useTableSessionStore((s) => s.guestSessionId);
    const takeawaySessionId = useCartStore((s) => s.takeawaySessionId);
    const setTakeawaySessionId = useCartStore((s) => s.setTakeawaySessionId);
    const isCartDrawerOpen = useCartStore((s) => s.isCartDrawerOpen);
    const isDishModalOpen = useCartStore((s) => s.isDishModalOpen);
    const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
    const setNameModalOpen = useCartStore((s) => s.setNameModalOpen);
    const setOrderTypeModalOpen = useCartStore((s) => s.setOrderTypeModalOpen);
    const setTakeawayCheckoutOpen = useCartStore((s) => s.setTakeawayCheckoutOpen);
    const setPendingCartItem = useCartStore((s) => s.setPendingCartItem);
    const setCurrency = useCartStore((s) => s.setCurrency);
    const [isAiWaiterOpen, setIsAiWaiterOpen] = useState(false);

    useEffect(() => {
        trackMenuViewOnce(slug, tableId ?? undefined);
    }, [slug, tableId]);

    useEffect(() => {
        if (data?.venue?.currency) {
            setCurrency(data.venue.currency);
        }
    }, [data?.venue?.currency, setCurrency]);

    const cartQuery = useSharedCart(tableId, takeawaySessionId);
    const cart = cartQuery.data;
    const startNewSession = useStartNewCartSession(tableId);

    const isCartSettled = cartQuery.isSuccess && !cartQuery.isPending && !cartQuery.isLoading;
    const completedCart = isCartSettled && cart && cart.isActive === false ? cart : null;

    const isMyCompletedOrder = Boolean(
        completedCart &&
        guestSessionId &&
        ((completedCart.confirmedGuests ?? []).includes(guestSessionId) ||
            completedCart.items.some((item) => item.guestSessionId === guestSessionId)),
    );

    const showDineInSuccess = Boolean(tableId && !takeawaySessionId && isMyCompletedOrder);

    function handleRestart() {
        setCartDrawerOpen(false);
        setNameModalOpen(false);
        setTakeawayCheckoutOpen(false);
        setOrderTypeModalOpen(false);
        setPendingCartItem(null);

        if (tableId && !startNewSession.isPending) startNewSession.mutate();
    }

    return (
        <main className="relative min-h-screen overflow-x-clip bg-transparent text-[#0A0A0C] antialiased dark:bg-transparent dark:text-[#F5F4F2]">
            <AmbientBackground />

            <BaseHeader activeRules={activeHappyHourRules}>
                <LanguageSwitcher />
                {mounted && <ThemeToggle theme={theme} toggle={toggle} />}
            </BaseHeader>

            <Suspense fallback={null}>
                <TableSessionInitializer tenantSlug={slug} />
            </Suspense>

            <div className="mx-auto max-w-6xl px-4 pb-32 sm:px-6">
                <ReservationAlert slug={slug} tableId={tableId} />

                {isLoading ? (
                    <PublicMenuSkeleton />
                ) : !data ? (
                    <MenuNotFound slug={slug} />
                ) : (
                    <>
                        <VenueHeader venue={data.venue} />
                        <MenuSearchAndFilter
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            selectedTags={selectedTags}
                            onTagToggle={toggleTag}
                            availableTags={availableTags}
                            onlyHappyHour={onlyHappyHour}
                            onHappyHourToggle={() => setOnlyHappyHour((prev) => !prev)}
                            hasHappyHourDeals={hasHappyHourDeals}
                            isFiltered={isFiltered}
                            onResetFilters={resetFilters}
                            totalMatches={totalMatches}
                        />
                        {filteredCategories.length > 0 && (
                            <StickyCategoryNav categories={filteredCategories} />
                        )}
                        <PublicMenuList
                            categories={filteredCategories}
                            tableId={tableId}
                            takeawaySessionId={takeawaySessionId}
                            activeHappyHourRules={activeHappyHourRules}
                            onResetFilters={isFiltered ? resetFilters : undefined}
                        />
                    </>
                )}
            </div>

            <SharedCartCoordinator tableId={tableId} takeawaySessionId={takeawaySessionId} />
            <AnimatePresence>
                <CartBanner cart={cart} activeHappyHourRules={activeHappyHourRules} />
            </AnimatePresence>

            <CartDrawer
                cart={cart}
                tableId={tableId}
                takeawaySessionId={takeawaySessionId}
                venueSlug={slug}
                isLoading={cartQuery.isLoading}
                activeHappyHourRules={activeHappyHourRules}
                onOrderCreated={(orderId) => {
                    void router.push(`/${slug}/order/${orderId}`);
                }}
            />
            <GuestNameModal />
            <OrderTypeModal />
            <TakeawayCheckoutModal onComplete={(orderId) => void router.push(`/${slug}/order/${orderId}`)} />

            {/* AI Waiter & Sommelier FAB and Chat Modal */}
            <AiWaiterButton
                hasCartItems={Boolean(cart && cart.items.length > 0 && cart.isActive !== false)}
                isOpen={isAiWaiterOpen}
                onClick={() => setIsAiWaiterOpen(true)}
                isCartDrawerOpen={isCartDrawerOpen}
                isDishModalOpen={isDishModalOpen}
            />
            <AiWaiterModal
                isOpen={isAiWaiterOpen}
                onClose={() => setIsAiWaiterOpen(false)}
                venueSlug={slug}
                subscriptionPlan={data?.venue?.subscriptionPlan}
                tableId={tableId}
                takeawaySessionId={takeawaySessionId}
                cart={cart}
                categories={data?.categories}
                activeHappyHourRules={activeHappyHourRules}
            />

            <AnimatePresence>
                {showDineInSuccess ? (
                    <OrderSuccessOverlay onRestart={handleRestart} isRestarting={startNewSession.isPending} />
                ) : null}
            </AnimatePresence>
        </main>
    );
}
