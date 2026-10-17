'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

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
import { CartDrawer } from '@/features/public-menu/components/CartDrawer';
import { OrderSuccessOverlay } from '@/features/public-menu/components/OrderSuccessOverlay';
import { OrderTypeModal } from '@/features/public-menu/components/OrderTypeModal';
import { TakeawayCheckoutModal } from '@/features/public-menu/components/TakeawayCheckoutModal';
import { GuestNameModal } from '@/features/public-menu/components/GuestNameModal';
import { usePublicHappyHour } from '@/features/public-menu/hooks/usePublicHappyHour';
import { ReservationAlert } from '@/features/reservations/components/ReservationAlert';
import { useSharedCart, useAddCartItem, useStartNewCartSession } from '@/features/public-menu/hooks/useSharedCart';
import { useCartStore } from '@/features/public-menu/store/useCartStore';
import { AiWaiterButton } from '@/features/public-menu/components/AiWaiterButton';

const AiWaiterModal = dynamic(
    () => import('@/features/public-menu/components/AiWaiterModal').then((m) => m.AiWaiterModal),
    { ssr: false },
);

// Відстеження перегляду публічного меню: гарантуємо рівно один виклик на slug
// за сесію перегляду (захист від StrictMode-подвійного виклику та ре-рендерів).
const trackedMenuViews = new Set<string>();

function trackMenuViewOnce(slug: string, tableId?: string) {
    if (trackedMenuViews.has(slug)) return;
    trackedMenuViews.add(slug);
    void AnalyticsApi.trackMenuView(slug, tableId).catch(() => {
        // Помилка трекінгу не повинна ламати досвід перегляду меню
    });
}

/**
 * Bootstraps the dine-in session from the QR deep-link (`/[slug]/menu?table=<tableId>`).
 * `useSearchParams` opts the subtree into client-side rendering, so it lives in its own
 * component behind a `<Suspense>` boundary (App Router requirement).
 */
function TableSessionInitializer({ tenantSlug }: { tenantSlug: string }) {
    const searchParams = useSearchParams();
    const tableParam = searchParams.get('table');

    const ensureTableSession = useTableSessionStore((s) => s.ensureTableSession);
    const setTakeawaySessionId = useCartStore((s) => s.setTakeawaySessionId);
    const setOrderTypeModalOpen = useCartStore((s) => s.setOrderTypeModalOpen);

    useEffect(() => {
        if (!tableParam) return;

        // Persists the table id and mints a guest session id only if we don't have one yet.
        ensureTableSession({ tableId: tableParam, tenantSlug });

        // The guest is dining in: a leftover takeaway session would otherwise hijack the
        // shared-cart query key (`sessionId ?? tableId`) and point at the wrong cart.
        setTakeawaySessionId(null);
        setOrderTypeModalOpen(false);
    }, [tableParam, tenantSlug, ensureTableSession, setTakeawaySessionId, setOrderTypeModalOpen]);

    return null;
}

/**
 * Flushes the dish a guest configured before naming themselves, once they have a name.
 *
 * Конфігурація (кількість + обрані модифікатори) зберігається у стору цілком,
 * тому після діалогу імені гість отримує саме те, що зібрав, а не «1 шт. без опцій».
 */
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

export default function PublicMenuPage() {
    const { slug } = useParams<{ slug: string }>();
    const resolvedSlug = slug ?? '';
    const router = useRouter();
    const { theme, toggle, mounted } = useTheme();
    const { data, isLoading } = useGetPublicMenu(resolvedSlug);

    // === HAPPY HOUR (STEP 4) ===
    // Тянемо правила по slug і обчислюємо ті, що активні зараз
    // (з урахуванням локального часу гостя та daysOfWeek).
    const { activeRules: activeHappyHourRules } = usePublicHappyHour({ slug: resolvedSlug });

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

    // Реальний трекінг перегляду меню: спрацьовує рівно один раз при відкритті
    useEffect(() => {
        trackMenuViewOnce(resolvedSlug, tableId ?? undefined);
    }, [resolvedSlug]);

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
        if (data?.venue?.currency) {
            setCurrency(data.venue.currency);
        }
    }, [data?.venue?.currency, setCurrency]);

    const cartQuery = useSharedCart(tableId, takeawaySessionId);
    const cart = cartQuery.data;
    const startNewSession = useStartNewCartSession(tableId);

    /**
     * The payload can only be trusted once the first fetch has settled. While the query
     * is still pending there is no `isActive` to read, and optimistically treating that
     * as "order placed" is what used to flash the success screen right after a QR scan.
     * Note: `isFetching` is deliberately NOT part of this guard — the cart polls every
     * 3s, so the overlay would strobe on every background refetch.
     */
    const isCartSettled = cartQuery.isSuccess && !cartQuery.isPending && !cartQuery.isLoading;
    const completedCart = isCartSettled && cart && cart.isActive === false ? cart : null;

    /**
     * The read endpoint intentionally keeps returning a table's last CLOSED session (so
     * every guest at the table sees the confirmation). Without an ownership check, a guest
     * who just scanned the QR would inherit the *previous* group's success screen.
     */
    const isMyCompletedOrder = Boolean(
        completedCart &&
        guestSessionId &&
        ((completedCart.confirmedGuests ?? []).includes(guestSessionId) ||
            completedCart.items.some((item) => item.guestSessionId === guestSessionId)),
    );

    const showDineInSuccess = Boolean(tableId && !takeawaySessionId && isMyCompletedOrder);

    function handleRestart() {
        // Local UI state only — the guest's identity (table, session, name) must survive.
        setCartDrawerOpen(false);
        setNameModalOpen(false);
        setTakeawayCheckoutOpen(false);
        setOrderTypeModalOpen(false);
        setPendingCartItem(null);

        // Dine-in: keep the table, ask the API for a fresh ACTIVE cart and re-sync.
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
                <TableSessionInitializer tenantSlug={resolvedSlug} />
            </Suspense>

            <div className="mx-auto max-w-6xl px-4 pb-32 sm:px-6">
                <ReservationAlert slug={resolvedSlug} tableId={tableId} />

                {isLoading ? (
                    <PublicMenuSkeleton />
                ) : !data ? (
                    <MenuNotFound slug={resolvedSlug} />
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
                venueSlug={resolvedSlug}
                isLoading={cartQuery.isLoading}
                activeHappyHourRules={activeHappyHourRules}
                onOrderCreated={(orderId) => {
                    // Той самий seamless-redirect, що й у takeaway: одразу на
                    // сторінку трекінгу замовлення. `router.push` повертає
                    // Promise, але чекати його не треба — навігація AsyncRoute-safe.
                    void router.push(`/${resolvedSlug}/order/${orderId}`);
                }}
            />
            <GuestNameModal />
            <OrderTypeModal />
            <TakeawayCheckoutModal onComplete={(orderId) => void router.push(`/${resolvedSlug}/order/${orderId}`)} />

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
                venueSlug={resolvedSlug}
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
