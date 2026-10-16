'use client';

import { create } from 'zustand';

export interface TourStepConfig {
    id: string;
    navKey: 'overview' | 'menu' | 'tables' | 'orders' | 'analytics' | 'settings';
    subSection?: string;
    routeSuffix: string;
    titleKey: string;
    descKey: string;
    tipKey: string;
    breadcrumbKey: string;
}

export const TOUR_STEPS: TourStepConfig[] = [
    {
        id: 'overview',
        navKey: 'overview',
        routeSuffix: '',
        titleKey: 'dashboard.tour.steps.overview.title',
        descKey: 'dashboard.tour.steps.overview.desc',
        tipKey: 'dashboard.tour.steps.overview.tip',
        breadcrumbKey: 'dashboard.tour.steps.overview.breadcrumb',
    },
    {
        id: 'menu-builder',
        navKey: 'menu',
        subSection: 'builder',
        routeSuffix: '/menu?section=builder',
        titleKey: 'dashboard.tour.steps.menuBuilder.title',
        descKey: 'dashboard.tour.steps.menuBuilder.desc',
        tipKey: 'dashboard.tour.steps.menuBuilder.tip',
        breadcrumbKey: 'dashboard.tour.steps.menuBuilder.breadcrumb',
    },
    {
        id: 'menu-promotions',
        navKey: 'menu',
        subSection: 'promotions',
        routeSuffix: '/menu?section=promotions',
        titleKey: 'dashboard.tour.steps.promotions.title',
        descKey: 'dashboard.tour.steps.promotions.desc',
        tipKey: 'dashboard.tour.steps.promotions.tip',
        breadcrumbKey: 'dashboard.tour.steps.promotions.breadcrumb',
    },
    {
        id: 'tables-floor',
        navKey: 'tables',
        subSection: 'tables',
        routeSuffix: '/tables-reservations?section=tables',
        titleKey: 'dashboard.tour.steps.tables.title',
        descKey: 'dashboard.tour.steps.tables.desc',
        tipKey: 'dashboard.tour.steps.tables.tip',
        breadcrumbKey: 'dashboard.tour.steps.tables.breadcrumb',
    },
    {
        id: 'tables-reservations',
        navKey: 'tables',
        subSection: 'reservations',
        routeSuffix: '/tables-reservations?section=reservations',
        titleKey: 'dashboard.tour.steps.reservations.title',
        descKey: 'dashboard.tour.steps.reservations.desc',
        tipKey: 'dashboard.tour.steps.reservations.tip',
        breadcrumbKey: 'dashboard.tour.steps.reservations.breadcrumb',
    },
    {
        id: 'orders-live',
        navKey: 'orders',
        subSection: 'live',
        routeSuffix: '/orders?section=live',
        titleKey: 'dashboard.tour.steps.liveOrders.title',
        descKey: 'dashboard.tour.steps.liveOrders.desc',
        tipKey: 'dashboard.tour.steps.liveOrders.tip',
        breadcrumbKey: 'dashboard.tour.steps.liveOrders.breadcrumb',
    },
    {
        id: 'orders-history',
        navKey: 'orders',
        subSection: 'history',
        routeSuffix: '/orders?section=history',
        titleKey: 'dashboard.tour.steps.orderHistory.title',
        descKey: 'dashboard.tour.steps.orderHistory.desc',
        tipKey: 'dashboard.tour.steps.orderHistory.tip',
        breadcrumbKey: 'dashboard.tour.steps.orderHistory.breadcrumb',
    },
    {
        id: 'analytics-overview',
        navKey: 'analytics',
        subSection: 'overview',
        routeSuffix: '/analytics?section=overview',
        titleKey: 'dashboard.tour.steps.analytics.title',
        descKey: 'dashboard.tour.steps.analytics.desc',
        tipKey: 'dashboard.tour.steps.analytics.tip',
        breadcrumbKey: 'dashboard.tour.steps.analytics.breadcrumb',
    },
    {
        id: 'analytics-sales',
        navKey: 'analytics',
        subSection: 'sales',
        routeSuffix: '/analytics?section=sales',
        titleKey: 'dashboard.tour.steps.sales.title',
        descKey: 'dashboard.tour.steps.sales.desc',
        tipKey: 'dashboard.tour.steps.sales.tip',
        breadcrumbKey: 'dashboard.tour.steps.sales.breadcrumb',
    },
    {
        id: 'analytics-feedback',
        navKey: 'analytics',
        subSection: 'feedback',
        routeSuffix: '/analytics?section=feedback',
        titleKey: 'dashboard.tour.steps.feedback.title',
        descKey: 'dashboard.tour.steps.feedback.desc',
        tipKey: 'dashboard.tour.steps.feedback.tip',
        breadcrumbKey: 'dashboard.tour.steps.feedback.breadcrumb',
    },
    {
        id: 'settings-kds',
        navKey: 'settings',
        subSection: 'kds',
        routeSuffix: '/settings?section=kds',
        titleKey: 'dashboard.tour.steps.staffKds.title',
        descKey: 'dashboard.tour.steps.staffKds.desc',
        tipKey: 'dashboard.tour.steps.staffKds.tip',
        breadcrumbKey: 'dashboard.tour.steps.staffKds.breadcrumb',
    },
    {
        id: 'settings-general',
        navKey: 'settings',
        subSection: 'general',
        routeSuffix: '/settings?section=general',
        titleKey: 'dashboard.tour.steps.settings.title',
        descKey: 'dashboard.tour.steps.settings.desc',
        tipKey: 'dashboard.tour.steps.settings.tip',
        breadcrumbKey: 'dashboard.tour.steps.settings.breadcrumb',
    },
];

export interface OnboardingTourState {
    isOpen: boolean;
    stepIndex: number;
    currentSlug: string | null;
    isMobileMenuOpen: boolean;
    isMobilePreviewing: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    startTour: (slug: string, force?: boolean) => void;
    nextStep: (navigate: (url: string) => void) => void;
    prevStep: (navigate: (url: string) => void) => void;
    goToStep: (index: number, navigate: (url: string) => void) => void;
    skipTour: () => void;
    finishTour: (navigate?: (url: string) => void) => void;
    openMobilePreview: () => void;
    closeMobilePreview: (navigate?: (url: string) => void) => void;
}

export const useOnboardingTour = create<OnboardingTourState>((set, get) => ({
    isOpen: false,
    stepIndex: 0,
    currentSlug: null,
    isMobileMenuOpen: false,
    isMobilePreviewing: false,

    setMobileMenuOpen: (open: boolean) => {
        if (!open && typeof window !== 'undefined' && (window as any).__tourMobileTimeout) {
            clearTimeout((window as any).__tourMobileTimeout);
        }
        set({ isMobileMenuOpen: open, isMobilePreviewing: open ? get().isMobilePreviewing : false });
    },

    startTour: (slug: string, force = false) => {
        if (typeof window !== 'undefined' && !force) {
            const completed = localStorage.getItem(`qore_tour_completed_${slug}`);
            if (completed === 'true') {
                return;
            }
        }
        set({
            isOpen: true,
            stepIndex: 0,
            currentSlug: slug,
            isMobileMenuOpen: false,
            isMobilePreviewing: false,
        });
    },

    nextStep: (navigate) => {
        const { stepIndex, currentSlug } = get();
        if (stepIndex < TOUR_STEPS.length - 1) {
            const nextIdx = stepIndex + 1;
            const targetUrl = currentSlug ? `/dashboard/${currentSlug}${TOUR_STEPS[nextIdx].routeSuffix}` : '';
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

            if (isMobile) {
                // Clear any pending timer
                if (typeof window !== 'undefined' && (window as any).__tourMobileTimeout) {
                    clearTimeout((window as any).__tourMobileTimeout);
                }

                // Open mobile drawer and highlight the destination section
                set({
                    stepIndex: nextIdx,
                    isMobileMenuOpen: true,
                    isMobilePreviewing: true,
                });

                // Give the user a clear animated view of the sidebar item, then slide to page
                if (typeof window !== 'undefined') {
                    (window as any).__tourMobileTimeout = setTimeout(() => {
                        set({ isMobileMenuOpen: false, isMobilePreviewing: false });
                        if (targetUrl) navigate(targetUrl);
                    }, 1400);
                }
            } else {
                set({ stepIndex: nextIdx });
                if (targetUrl) navigate(targetUrl);
            }
        } else {
            get().finishTour(navigate);
        }
    },

    prevStep: (navigate) => {
        if (typeof window !== 'undefined' && (window as any).__tourMobileTimeout) {
            clearTimeout((window as any).__tourMobileTimeout);
        }
        const { stepIndex, currentSlug } = get();
        if (stepIndex > 0) {
            const prevIdx = stepIndex - 1;
            set({
                stepIndex: prevIdx,
                isMobileMenuOpen: false,
                isMobilePreviewing: false,
            });
            if (currentSlug) {
                const targetUrl = `/dashboard/${currentSlug}${TOUR_STEPS[prevIdx].routeSuffix}`;
                navigate(targetUrl);
            }
        }
    },

    goToStep: (index, navigate) => {
        if (typeof window !== 'undefined' && (window as any).__tourMobileTimeout) {
            clearTimeout((window as any).__tourMobileTimeout);
        }
        const { currentSlug } = get();
        if (index >= 0 && index < TOUR_STEPS.length) {
            set({
                stepIndex: index,
                isMobileMenuOpen: false,
                isMobilePreviewing: false,
            });
            if (currentSlug) {
                const targetUrl = `/dashboard/${currentSlug}${TOUR_STEPS[index].routeSuffix}`;
                navigate(targetUrl);
            }
        }
    },

    openMobilePreview: () => {
        if (typeof window !== 'undefined' && (window as any).__tourMobileTimeout) {
            clearTimeout((window as any).__tourMobileTimeout);
        }
        set({ isMobileMenuOpen: true, isMobilePreviewing: false });
    },

    closeMobilePreview: (navigate) => {
        if (typeof window !== 'undefined' && (window as any).__tourMobileTimeout) {
            clearTimeout((window as any).__tourMobileTimeout);
        }
        const { stepIndex, currentSlug } = get();
        set({ isMobileMenuOpen: false, isMobilePreviewing: false });
        if (currentSlug && navigate) {
            const targetUrl = `/dashboard/${currentSlug}${TOUR_STEPS[stepIndex].routeSuffix}`;
            navigate(targetUrl);
        }
    },

    skipTour: () => {
        if (typeof window !== 'undefined' && (window as any).__tourMobileTimeout) {
            clearTimeout((window as any).__tourMobileTimeout);
        }
        const { currentSlug } = get();
        if (currentSlug && typeof window !== 'undefined') {
            localStorage.setItem(`qore_tour_completed_${currentSlug}`, 'true');
        }
        set({
            isOpen: false,
            isMobileMenuOpen: false,
            isMobilePreviewing: false,
        });
    },

    finishTour: (navigate) => {
        if (typeof window !== 'undefined' && (window as any).__tourMobileTimeout) {
            clearTimeout((window as any).__tourMobileTimeout);
        }
        const { currentSlug } = get();
        if (currentSlug && typeof window !== 'undefined') {
            localStorage.setItem(`qore_tour_completed_${currentSlug}`, 'true');
        }
        set({
            isOpen: false,
            isMobileMenuOpen: false,
            isMobilePreviewing: false,
        });
        if (currentSlug && navigate) {
            navigate(`/dashboard/${currentSlug}/settings?section=general`);
        }
    },
}));
