'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    UtensilsCrossed,
    QrCode,
    Bell,
    TrendingUp,
    Settings,
    ExternalLink,
    Menu,
    X,
    ChevronDown,
    ArrowLeft,
    User,
    Store,
    Crown,
    Plus,
    Sparkles,
    LogOut,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

import { useTranslations } from 'next-intl';
import { Logo } from '@/shared/ui/Logo';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { useTheme } from '@/shared/hooks/useTheme';
import { useGetTenantBySlug, useGetMyTenants } from '@/entities/tenant/hooks/useTenants';
import { useActiveOrders } from '@/features/dashboard-orders/hooks/useOrders';
import { useOnboardingTour, TOUR_STEPS } from '../model/useOnboardingTour';

type NavKey = 'overview' | 'menu' | 'tables' | 'orders' | 'analytics' | 'settings';

type NavItem = {
    key: NavKey;
    defaultLabel: string;
    suffix: string;
    section?: string;
    icon: typeof LayoutDashboard;
};

const NAV: NavItem[] = [
    { key: 'overview', defaultLabel: 'Overview', suffix: '', icon: LayoutDashboard },
    { key: 'menu', defaultLabel: 'Menu', suffix: '/menu', icon: UtensilsCrossed },
    { key: 'tables', defaultLabel: 'Tables & Reservations', suffix: '/tables-reservations', section: 'tables', icon: QrCode },
    { key: 'orders', defaultLabel: 'Live Orders', suffix: '/orders', icon: Bell },
    { key: 'analytics', defaultLabel: 'Analytics', suffix: '/analytics', icon: TrendingUp },
    { key: 'settings', defaultLabel: 'Settings', suffix: '/settings', icon: Settings },
];

const SETTINGS_SECTIONS = [
    { key: 'general', value: 'general', ns: 'settings' },
    { key: 'hours', value: 'hours', ns: 'settings' },
    { key: 'staffKds', value: 'kds', ns: 'settings' },
    { key: 'billing', value: 'billing', ns: 'settings' },
] as const;

const MENU_SECTIONS = [
    { key: 'builder', value: 'builder', ns: 'sidebar' },
    { key: 'promotions', value: 'promotions', ns: 'sidebar' },
] as const;

const TABLES_SECTIONS = [
    { key: 'tabTables', value: 'tables', ns: 'tablesFloor' },
    { key: 'tabReservations', value: 'reservations', ns: 'tablesFloor' },
] as const;

const ANALYTICS_SECTIONS = [
    { key: 'overview', value: 'overview', ns: 'sidebar' },
    { key: 'sales', value: 'sales', ns: 'sidebar' },
    { key: 'guests', value: 'guests', ns: 'sidebar' },
    { key: 'feedback', value: 'feedback', ns: 'sidebar' },
] as const;

const ORDERS_SECTIONS = [
    { key: 'liveOrdersSub', value: 'live', ns: 'sidebar' },
    { key: 'orderHistorySub', value: 'history', ns: 'sidebar' },
] as const;

function getPlanDetails(plan: string | null | undefined, tSidebar: (key: any) => string) {
    const normalizedPlan = plan?.toLowerCase();

    if (normalizedPlan === 'business') {
        return {
            label: tSidebar('businessPlan'),
            icon: Crown,
            badgeClassName:
                'border-[#8B5CF6]/30 bg-gradient-to-r from-[#3B82F6]/15 to-[#8B5CF6]/15 text-[#6D28D9] dark:text-[#C4B5FD]',
            isBusiness: true,
        };
    }

    if (normalizedPlan === 'pro') {
        return {
            label: tSidebar('proPlan'),
            icon: Sparkles,
            badgeClassName: 'border-[#3B82F6]/25 bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA]',
            isBusiness: false,
        };
    }

    return {
        label: tSidebar('freePlan'),
        icon: Sparkles,
        badgeClassName:
            'border-[#E7E5E0] bg-black/[0.03] text-[#6B6A65] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]',
        isBusiness: false,
    };
}

function SidebarContent({ slug, onNavigate }: { slug: string; onNavigate?: () => void }) {
    const tSidebar = useTranslations('dashboard.sidebar');
    const tSettings = useTranslations('dashboard.settings');
    const tTables = useTranslations('tablesFloor');
    const tCommon = useTranslations('common');
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { theme, toggle, mounted } = useTheme();
    const { data: tenant } = useGetTenantBySlug(slug);
    const { data: myTenants } = useGetMyTenants();
    const [switcherOpen, setSwitcherOpen] = useState(false);

    // Live count of unacknowledged (new) orders for the badge on the Live Orders link.
    const { data: activeOrders } = useActiveOrders(tenant?.data.id);
    const newOrdersCount = (activeOrders ?? []).filter((o) => o.status === 'new').length;

    const {
        isOpen: isTourOpen,
        stepIndex: tourStepIndex,
        startTour,
        isMobileMenuOpen,
    } = useOnboardingTour();
    const activeTourStep = isTourOpen ? TOUR_STEPS[tourStepIndex] : null;

    const others = (myTenants?.data ?? []).filter((t) => t.slug !== slug);
    const hasMultipleVenues = (myTenants?.data?.length || 0) > 1;
    const plan = getPlanDetails(tenant?.data.subscriptionPlan, tSidebar);
    const PlanIcon = plan.icon;

    return (
        <div className="flex h-full flex-col px-5 py-6">
            <div className="flex items-center justify-between">
                <Logo />
                {mounted && (
                    <div className="md:hidden">
                        <ThemeToggle theme={theme} toggle={toggle} />
                    </div>
                )}
            </div>

            {/* Venue identity + live public link */}
            <div className="mt-8">
                <p className="text-[12px] uppercase tracking-[0.18em] text-[#6B6A65] dark:text-[#94938D]">
                    {tSidebar('yourVenue')}
                </p>
                <h2 className="mt-1 truncate text-[18px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                    {tenant?.data.name ?? 'Workspace'}
                </h2>
                <Link
                    href={`/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#E7E5E0]/80 bg-white/60 px-2.5 py-1 text-[12px] text-[#6B6A65] transition-colors hover:border-[#3B82F6]/40 hover:text-[#3B82F6] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D] dark:hover:text-[#3B82F6]">
                    <ExternalLink size={12} />
                    useqore.app/{slug}
                </Link>
            </div>

            {(others.length > 0 || plan.isBusiness) && (
                <div className="relative mt-4">
                    {others.length > 0 && hasMultipleVenues && (
                        <button
                            type="button"
                            onClick={() => setSwitcherOpen((v) => !v)}
                            className="flex w-full items-center justify-between rounded-xl border border-[#E7E5E0]/80 bg-white/60 px-3 py-2 text-[13px] font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-white/10 dark:bg-white/5 dark:text-[#F5F4F2]">
                            <span className="flex items-center gap-2">
                                <Store size={14} className="text-[#8B5CF6]" />
                                {tSidebar('switchWorkspace')}
                            </span>
                            <ChevronDown
                                size={15}
                                className={`transition-transform ${switcherOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                    )}
                    <AnimatePresence>
                        {switcherOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                                className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-xl border border-[#E7E5E0]/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#121215]/95">
                                {others.map((t) => (
                                    <Link
                                        key={t.id}
                                        href={`/dashboard/${t.slug}`}
                                        onClick={() => {
                                            setSwitcherOpen(false);
                                            onNavigate?.();
                                        }}
                                        className="block px-3 py-2.5 text-[13px] text-[#0A0A0C] transition-colors hover:bg-[#3B82F6]/10 dark:text-[#F5F4F2]">
                                        {t.name}
                                    </Link>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Nav links */}
            <nav className="mt-6 flex flex-1 flex-col gap-1">
                {NAV.map((item) => {
                    const baseHref = `/dashboard/${slug}${item.suffix}`;
                    const isSettings = item.suffix === '/settings';
                    const isMenu = item.suffix === '/menu';
                    const isTablesReservations = item.suffix === '/tables-reservations';
                    const isAnalytics = item.suffix === '/analytics';
                    const isOrders = item.suffix === '/orders';
                    const defaultSection = isTablesReservations
                        ? 'tables'
                        : isAnalytics
                          ? 'overview'
                          : isMenu
                            ? 'builder'
                            : isOrders
                              ? 'live'
                              : 'general';
                    const href = isSettings || isTablesReservations || isAnalytics || isMenu || isOrders
                        ? `${baseHref}?section=${defaultSection}`
                        : item.section
                          ? `${baseHref}?section=${item.section}`
                          : baseHref;
                    const active =
                        isSettings || isTablesReservations || isAnalytics || isMenu || isOrders
                            ? pathname.startsWith(baseHref)
                            : pathname === href;
                    const isTourTarget = isTourOpen && activeTourStep?.navKey === item.key;
                    const hasDropdown = Boolean(isSettings || isMenu || isTablesReservations || isAnalytics || isOrders);
                    const showDropdown =
                        hasDropdown &&
                        (((isSettings && pathname.includes('/settings')) ||
                            (isMenu && pathname.includes('/menu')) ||
                            (isTablesReservations && pathname.includes('/tables-reservations')) ||
                            (isAnalytics && pathname.includes('/analytics')) ||
                            (isOrders && pathname.includes('/orders'))) ||
                            isTourTarget);
                    const sections = isSettings
                        ? SETTINGS_SECTIONS
                        : isMenu
                          ? MENU_SECTIONS
                          : isTablesReservations
                            ? TABLES_SECTIONS
                            : isAnalytics
                              ? ANALYTICS_SECTIONS
                              : isOrders
                                ? ORDERS_SECTIONS
                                : [];
                    const Icon = item.icon;
                    const label = tSidebar(item.key);
                    return (
                        <div
                            key={item.key}
                            ref={(el) => {
                                if (el && isTourTarget && isTourOpen && isMobileMenuOpen) {
                                    setTimeout(() => {
                                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }, 150);
                                }
                            }}>
                            <Link
                                href={href}
                                onClick={onNavigate}
                                className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] transition-all ${
                                    isTourTarget
                                        ? 'bg-[#3B82F6]/15 text-[#3B82F6] font-semibold ring-2 ring-[#3B82F6] ring-offset-2 shadow-lg shadow-[#3B82F6]/20 dark:bg-[#3B82F6]/25 dark:text-[#60A5FA] dark:ring-offset-[#0A0A0C]'
                                        : active
                                          ? 'bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-white/5 dark:text-[#F5F4F2]'
                                          : 'text-[#6B6A65] hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-[#F5F4F2]'
                                }`}>
                                <span
                                    className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[#3B82F6] transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
                                />
                                <Icon size={17} strokeWidth={1.9} />
                                <span className="flex-1">{label}</span>
                                {item.key === 'orders' && newOrdersCount > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3B82F6] px-1.5 text-[11px] font-semibold text-white">
                                        {newOrdersCount}
                                    </span>
                                )}
                            </Link>
                            <AnimatePresence initial={false}>
                                {showDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        className="flex flex-col gap-1 overflow-hidden border-l border-[#E7E5E0] pl-4 pt-1.5 dark:border-white/10">
                                        {sections.map((section) => {
                                            const isTourSubTarget =
                                                isTourOpen && isTourTarget && activeTourStep?.subSection === section.value;
                                            const sectionActive =
                                                (active &&
                                                    (searchParams.get('section') ?? defaultSection) === section.value) ||
                                                isTourSubTarget;
                                            const sectionLabel =
                                                section.ns === 'settings'
                                                    ? tSettings(section.key as any)
                                                    : section.ns === 'tablesFloor'
                                                      ? tTables(section.key as any)
                                                      : tSidebar(section.key as any);
                                            return (
                                                <Link
                                                    key={section.value}
                                                    href={`${baseHref}?section=${section.value}`}
                                                    onClick={onNavigate}
                                                    className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                                                        isTourSubTarget
                                                            ? 'bg-[#3B82F6]/20 font-bold text-[#2563EB] ring-1 ring-[#3B82F6] dark:bg-[#3B82F6]/30 dark:text-[#60A5FA]'
                                                            : sectionActive
                                                              ? 'bg-[#3B82F6]/10 font-medium text-[#2563EB] dark:text-[#60A5FA]'
                                                              : 'text-[#6B6A65] hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-[#F5F4F2]'
                                                    }`}>
                                                    <span>{sectionLabel}</span>
                                                    {isTourSubTarget && (
                                                        <span className="flex h-2 w-2 rounded-full bg-[#3B82F6] animate-ping" />
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            {/* Subscription plan */}
            <div className="mt-5 rounded-2xl border border-[#E7E5E0]/80 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${plan.badgeClassName}`}>
                        <PlanIcon size={12} />
                        {plan.label}
                    </span>
                    {plan.isBusiness && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#16A34A] dark:text-[#4ADE80]">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {tSidebar('activeBadge')}
                        </span>
                    )}
                    {!plan.isBusiness && (
                        <Link
                            href={`/dashboard/${slug}/settings?section=billing`}
                            onClick={onNavigate}
                            className="inline-flex items-center justify-center gap-1 text-[12px] font-semibold text-[#3B82F6] transition-colors hover:text-[#2563EB] dark:hover:text-[#60A5FA]">
                            <Sparkles size={12} />
                            {tSidebar('upgrade')}
                        </Link>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 border-t border-[#E7E5E0]/80 pt-3 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between">
                    {hasMultipleVenues ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-[13px] font-medium text-[#6B6A65] transition-colors hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2]">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white">
                                <User size={13} />
                            </span>
                            <span className="flex items-center gap-1">
                                <ArrowLeft size={12} />
                                {tSidebar('allVenues')}
                            </span>
                        </Link>
                    ) : (
                        <span className="text-[12px] font-medium text-[#9C9B95] dark:text-[#6E6D68]">Qore</span>
                    )}

                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        title={tCommon('logOut')}
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-medium text-[#6B6A65] transition-colors hover:bg-[#EF4444]/10 hover:text-[#EF4444] dark:text-[#94938D] dark:hover:bg-[#EF4444]/15 dark:hover:text-[#F87171]">
                        <LogOut size={14} />
                        <span>{tCommon('logOut')}</span>
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="hidden md:flex md:items-center md:gap-1.5">
                        {mounted && <ThemeToggle theme={theme} toggle={toggle} />}
                        <button
                            type="button"
                            onClick={() => startTour(slug, true)}
                            title={tSidebar('productTour')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B6A65] transition-colors hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] dark:text-[#94938D] dark:hover:bg-[#3B82F6]/15 dark:hover:text-[#60A5FA]">
                            <Sparkles size={14} />
                        </button>
                    </div>
                    <LanguageSwitcher direction="up" align="right" />
                </div>
            </div>
        </div>
    );
}

export function DashboardSidebar() {
    const { slug } = useParams<{ slug: string }>();
    return (
        <aside className="hidden md:flex md:h-full md:w-64 md:shrink-0 md:flex-col md:overflow-y-auto md:border-r md:border-[#E7E5E0] md:bg-white dark:md:border-white/10 dark:md:bg-[#0A0A0C]">
            <SidebarContent slug={slug ?? ''} />
        </aside>
    );
}

export function DashboardMobileNav() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: tenant } = useGetTenantBySlug(slug ?? '');
    const {
        isOpen: isTourOpen,
        stepIndex,
        isMobileMenuOpen,
        setMobileMenuOpen,
        isMobilePreviewing,
        closeMobilePreview,
    } = useOnboardingTour();
    const tTour = useTranslations('dashboard.tour');

    const open = isMobileMenuOpen;
    const setOpen = (val: boolean) => {
        if (!val && isMobilePreviewing) {
            closeMobilePreview((url) => router.push(url));
        } else {
            setMobileMenuOpen(val);
        }
    };

    return (
        <div className="md:hidden">
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E7E5E0] bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0A0A0C]">
                <span className="truncate text-[15px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                    {tenant?.data.name ?? 'Workspace'}
                </span>
                <div className="flex items-center gap-1">
                    <LanguageSwitcher />
                    <Link
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open public page"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7E5E0] text-[#6B6A65] dark:border-white/10 dark:text-[#94938D]">
                        <ExternalLink size={16} />
                    </Link>

                    {/* Hamburger button with tour spotlight & beacon tooltip */}
                    <div className="relative">
                        <button
                            type="button"
                            aria-label="Open menu"
                            onClick={() => setOpen(!open)}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                                isTourOpen
                                    ? 'border-[#3B82F6] bg-[#3B82F6]/15 text-[#3B82F6] ring-2 ring-[#3B82F6] ring-offset-2 animate-pulse dark:ring-offset-[#0A0A0C]'
                                    : 'border-[#E7E5E0] text-[#0A0A0C] dark:border-white/10 dark:text-[#F5F4F2]'
                            }`}>
                            <Menu size={18} />
                        </button>

                        {/* First-step spotlight beacon */}
                        {isTourOpen && stepIndex === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -4, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="pointer-events-none absolute right-0 top-11 z-50 flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#0A0A0C] px-3 py-1.5 text-[11px] font-semibold text-white shadow-xl dark:bg-white dark:text-[#0A0A0C]">
                                <span className="text-[#3B82F6]">☰</span>
                                <span>{tTour('mobileMenuHint')}</span>
                                <div className="absolute -top-1 right-3.5 h-2 w-2 rotate-45 bg-[#0A0A0C] dark:bg-white" />
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-[#E7E5E0] bg-white dark:border-white/10 dark:bg-[#0A0A0C]">
                            <div className="flex items-center justify-between p-3 border-b border-[#E7E5E0]/60 dark:border-white/10">
                                <span className="text-xs font-semibold text-[#6B6A65] dark:text-[#94938D]">
                                    {isTourOpen ? tTour('productTour') : 'Qore'}
                                </span>
                                <button
                                    type="button"
                                    aria-label="Close menu"
                                    onClick={() => setOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E5E0] text-[#0A0A0C] dark:border-white/10 dark:text-[#F5F4F2]">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Tour preview banner inside drawer on mobile */}
                            {isTourOpen && isMobilePreviewing && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mx-3 mt-3 flex items-center justify-between gap-2 rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 p-2.5 text-xs text-[#2563EB] shadow-sm dark:text-[#60A5FA]">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Sparkles size={14} className="shrink-0 animate-spin text-[#3B82F6]" />
                                        <span className="truncate font-semibold">{tTour('mobileNavigatingTo')}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => closeMobilePreview((url) => router.push(url))}
                                        className="shrink-0 rounded-lg bg-[#3B82F6] px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-[#2563EB] active:scale-95">
                                        {tTour('mobileViewPage')}
                                    </button>
                                </motion.div>
                            )}

                            <SidebarContent
                                slug={slug ?? ''}
                                onNavigate={() => {
                                    if (isMobilePreviewing) {
                                        closeMobilePreview((url) => router.push(url));
                                    } else {
                                        setOpen(false);
                                    }
                                }}
                            />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
