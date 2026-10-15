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
}

export const TOUR_STEPS: TourStepConfig[] = [
    {
        id: 'overview',
        navKey: 'overview',
        routeSuffix: '',
        titleKey: 'dashboard.tour.steps.overview.title',
        descKey: 'dashboard.tour.steps.overview.desc',
        tipKey: 'dashboard.tour.steps.overview.tip',
    },
    {
        id: 'menu-builder',
        navKey: 'menu',
        subSection: 'builder',
        routeSuffix: '/menu?section=builder',
        titleKey: 'dashboard.tour.steps.menuBuilder.title',
        descKey: 'dashboard.tour.steps.menuBuilder.desc',
        tipKey: 'dashboard.tour.steps.menuBuilder.tip',
    },
    {
        id: 'menu-promotions',
        navKey: 'menu',
        subSection: 'promotions',
        routeSuffix: '/menu?section=promotions',
        titleKey: 'dashboard.tour.steps.promotions.title',
        descKey: 'dashboard.tour.steps.promotions.desc',
        tipKey: 'dashboard.tour.steps.promotions.tip',
    },
    {
        id: 'tables-floor',
        navKey: 'tables',
        subSection: 'tables',
        routeSuffix: '/tables-reservations?tab=tables',
        titleKey: 'dashboard.tour.steps.tables.title',
        descKey: 'dashboard.tour.steps.tables.desc',
        tipKey: 'dashboard.tour.steps.tables.tip',
    },
    {
        id: 'tables-reservations',
        navKey: 'tables',
        subSection: 'reservations',
        routeSuffix: '/tables-reservations?tab=reservations',
        titleKey: 'dashboard.tour.steps.reservations.title',
        descKey: 'dashboard.tour.steps.reservations.desc',
        tipKey: 'dashboard.tour.steps.reservations.tip',
    },
    {
        id: 'orders-live',
        navKey: 'orders',
        subSection: 'live',
        routeSuffix: '/orders?tab=live',
        titleKey: 'dashboard.tour.steps.liveOrders.title',
        descKey: 'dashboard.tour.steps.liveOrders.desc',
        tipKey: 'dashboard.tour.steps.liveOrders.tip',
    },
    {
        id: 'orders-history',
        navKey: 'orders',
        subSection: 'history',
        routeSuffix: '/orders?tab=history',
        titleKey: 'dashboard.tour.steps.orderHistory.title',
        descKey: 'dashboard.tour.steps.orderHistory.desc',
        tipKey: 'dashboard.tour.steps.orderHistory.tip',
    },
    {
        id: 'analytics-overview',
        navKey: 'analytics',
        subSection: 'overview',
        routeSuffix: '/analytics?tab=overview',
        titleKey: 'dashboard.tour.steps.analytics.title',
        descKey: 'dashboard.tour.steps.analytics.desc',
        tipKey: 'dashboard.tour.steps.analytics.tip',
    },
    {
        id: 'settings-general',
        navKey: 'settings',
        subSection: 'general',
        routeSuffix: '/settings?tab=general',
        titleKey: 'dashboard.tour.steps.settings.title',
        descKey: 'dashboard.tour.steps.settings.desc',
        tipKey: 'dashboard.tour.steps.settings.tip',
    },
];

interface OnboardingTourState {
    isOpen: boolean;
    stepIndex: number;
    currentSlug: string | null;
    startTour: (slug: string, force?: boolean) => void;
    nextStep: (navigate: (url: string) => void) => void;
    prevStep: (navigate: (url: string) => void) => void;
    goToStep: (index: number, navigate: (url: string) => void) => void;
    skipTour: () => void;
    finishTour: (navigate?: (url: string) => void) => void;
}

export const useOnboardingTour = create<OnboardingTourState>((set, get) => ({
    isOpen: false,
    stepIndex: 0,
    currentSlug: null,

    startTour: (slug: string, force = false) => {
        if (typeof window !== 'undefined' && !force) {
            const completed = localStorage.getItem(`qore_tour_completed_${slug}`);
            if (completed === 'true') {
                return;
            }
        }
        set({ isOpen: true, stepIndex: 0, currentSlug: slug });
    },

    nextStep: (navigate) => {
        const { stepIndex, currentSlug } = get();
        if (stepIndex < TOUR_STEPS.length - 1) {
            const nextIdx = stepIndex + 1;
            set({ stepIndex: nextIdx });
            if (currentSlug) {
                const targetUrl = `/dashboard/${currentSlug}${TOUR_STEPS[nextIdx].routeSuffix}`;
                navigate(targetUrl);
            }
        } else {
            get().finishTour(navigate);
        }
    },

    prevStep: (navigate) => {
        const { stepIndex, currentSlug } = get();
        if (stepIndex > 0) {
            const prevIdx = stepIndex - 1;
            set({ stepIndex: prevIdx });
            if (currentSlug) {
                const targetUrl = `/dashboard/${currentSlug}${TOUR_STEPS[prevIdx].routeSuffix}`;
                navigate(targetUrl);
            }
        }
    },

    goToStep: (index, navigate) => {
        const { currentSlug } = get();
        if (index >= 0 && index < TOUR_STEPS.length) {
            set({ stepIndex: index });
            if (currentSlug) {
                const targetUrl = `/dashboard/${currentSlug}${TOUR_STEPS[index].routeSuffix}`;
                navigate(targetUrl);
            }
        }
    },

    skipTour: () => {
        const { currentSlug } = get();
        if (currentSlug && typeof window !== 'undefined') {
            localStorage.setItem(`qore_tour_completed_${currentSlug}`, 'true');
        }
        set({ isOpen: false });
    },

    finishTour: (navigate) => {
        const { currentSlug } = get();
        if (currentSlug && typeof window !== 'undefined') {
            localStorage.setItem(`qore_tour_completed_${currentSlug}`, 'true');
        }
        set({ isOpen: false });
        if (currentSlug && navigate) {
            navigate(`/dashboard/${currentSlug}/settings?tab=general`);
        }
    },
}));
