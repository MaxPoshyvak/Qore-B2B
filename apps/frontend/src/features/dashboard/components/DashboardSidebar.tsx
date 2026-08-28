'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
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
} from 'lucide-react';

import { Logo } from '@/shared/ui/Logo';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useTheme } from '@/shared/hooks/useTheme';
import { useGetTenantBySlug, useGetMyTenants } from '@/entities/tenant/hooks/useTenants';
import { useActiveOrders } from '@/features/dashboard-orders/hooks/useOrders';

const NAV: { label: string; suffix: string; section?: string; icon: typeof LayoutDashboard }[] = [
    { label: 'Overview', suffix: '', icon: LayoutDashboard },
    { label: 'Menu', suffix: '/menu', icon: UtensilsCrossed },
    { label: 'Tables & Reservations', suffix: '/tables-reservations', section: 'tables', icon: QrCode },
    { label: 'Live Orders', suffix: '/orders', icon: Bell },
    { label: 'Analytics', suffix: '/analytics', icon: TrendingUp },
    { label: 'Settings', suffix: '/settings', icon: Settings },
];

const SETTINGS_SECTIONS = [
    { label: 'General', value: 'general' },
    { label: 'Contacts', value: 'contacts' },
    { label: 'Guest Services', value: 'guest' },
    { label: 'Working Hours', value: 'hours' },
    { label: 'Staff & KDS', value: 'kds' },
    { label: 'Billing & Plan', value: 'billing' },
] as const;

const TABLES_SECTIONS = [
    { label: 'Table Management', value: 'tables' },
    { label: 'Reservations', value: 'reservations' },
] as const;

const ANALYTICS_SECTIONS = [
    { label: 'Overview', value: 'overview' },
    { label: 'Sales & Menu', value: 'sales' },
    { label: 'Guests & Traffic', value: 'guests' },
    { label: 'Feedback & AI', value: 'feedback' },
] as const;

function getPlanDetails(plan?: string | null) {
    const normalizedPlan = plan?.toLowerCase();

    if (normalizedPlan === 'business') {
        return {
            label: 'Business Plan',
            icon: Crown,
            badgeClassName:
                'border-[#8B5CF6]/30 bg-gradient-to-r from-[#3B82F6]/15 to-[#8B5CF6]/15 text-[#6D28D9] dark:text-[#C4B5FD]',
            isBusiness: true,
        };
    }

    if (normalizedPlan === 'pro') {
        return {
            label: 'Pro Plan',
            icon: Sparkles,
            badgeClassName: 'border-[#3B82F6]/25 bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA]',
            isBusiness: false,
        };
    }

    return {
        label: 'Free Plan',
        icon: Sparkles,
        badgeClassName:
            'border-[#E7E5E0] bg-black/[0.03] text-[#6B6A65] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]',
        isBusiness: false,
    };
}

function SidebarContent({ slug, onNavigate }: { slug: string; onNavigate?: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { theme, toggle, mounted } = useTheme();
    const { data: tenant } = useGetTenantBySlug(slug);
    const { data: myTenants } = useGetMyTenants();
    const [switcherOpen, setSwitcherOpen] = useState(false);

    // Live count of unacknowledged (new) orders for the badge on the Live Orders link.
    const { data: activeOrders } = useActiveOrders(tenant?.data.id);
    const newOrdersCount = (activeOrders ?? []).filter((o) => o.status === 'new').length;

    const others = (myTenants?.data ?? []).filter((t) => t.slug !== slug);
    const hasMultipleVenues = (myTenants?.data?.length || 0) > 1;
    const plan = getPlanDetails(tenant?.data.subscriptionPlan);
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
                <p className="text-[12px] uppercase tracking-[0.18em] text-[#6B6A65] dark:text-[#94938D]">Your venue</p>
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
                                Switch workspace
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
                    const isTablesReservations = item.suffix === '/tables-reservations';
                    const isAnalytics = item.suffix === '/analytics';
                    const defaultSection = isTablesReservations
                        ? 'tables'
                        : isAnalytics
                          ? 'overview'
                          : 'general';
                    const href = isSettings || isTablesReservations || isAnalytics
                        ? `${baseHref}?section=${defaultSection}`
                        : item.section
                          ? `${baseHref}?section=${item.section}`
                          : baseHref;
                    const active =
                        isSettings || isTablesReservations || isAnalytics
                            ? pathname.startsWith(baseHref)
                            : pathname === href;
                    const showDropdown =
                        (isSettings && pathname.includes('/settings')) ||
                        (isTablesReservations && pathname.includes('/tables-reservations')) ||
                        (isAnalytics && pathname.includes('/analytics'));
                    const Icon = item.icon;
                    return (
                        <div key={item.label}>
                            <Link
                                href={href}
                                onClick={onNavigate}
                                className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] transition-colors ${
                                    active
                                        ? 'bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-white/5 dark:text-[#F5F4F2]'
                                        : 'text-[#6B6A65] hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-[#F5F4F2]'
                                }`}>
                                <span
                                    className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[#3B82F6] transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
                                />
                                <Icon size={17} strokeWidth={1.9} />
                                <span className="flex-1">{item.label}</span>
                                {item.label === 'Live Orders' && newOrdersCount > 0 && (
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
                                        className="hidden overflow-hidden border-l border-[#E7E5E0] pl-4 pt-1.5 md:flex md:flex-col md:gap-1 dark:border-white/10">
                                        {(isSettings
                                            ? SETTINGS_SECTIONS
                                            : isTablesReservations
                                              ? TABLES_SECTIONS
                                              : ANALYTICS_SECTIONS
                                        ).map((section) => {
                                            const sectionActive =
                                                active &&
                                                (searchParams.get('section') ?? defaultSection) === section.value;
                                            return (
                                                <Link
                                                    key={section.value}
                                                    href={`${baseHref}?section=${section.value}`}
                                                    onClick={onNavigate}
                                                    className={`rounded-lg px-3 py-1.5 text-[13px] transition-colors ${sectionActive ? 'bg-[#3B82F6]/10 font-medium text-[#2563EB] dark:text-[#60A5FA]' : 'text-[#6B6A65] hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-[#F5F4F2]'}`}>
                                                    {section.label}
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
                            Active
                        </span>
                    )}
                    {!plan.isBusiness && (
                        <Link
                            href={`/dashboard/${slug}/settings?section=billing`}
                            onClick={onNavigate}
                            className="inline-flex items-center justify-center gap-1 text-[12px] font-semibold text-[#3B82F6] transition-colors hover:text-[#2563EB] dark:hover:text-[#60A5FA]">
                            <Sparkles size={12} />
                            Upgrade
                        </Link>
                    )}
                </div>
            </div>

            {/* Workspace switcher */}
            {/* {(others.length > 0 || plan.isBusiness) && (
                <div className="relative mt-4">
                    {plan.isBusiness && (
                        <Link
                            href="/onboarding"
                            onClick={onNavigate}
                            className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-3 py-2 text-[12px] font-semibold text-[#2563EB] transition-all hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
                            <Plus size={14} />
                            Add venue
                        </Link>
                    )}
                </div>
            )} */}

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-[#E7E5E0]/80 pt-4 dark:border-white/10">
                {hasMultipleVenues && (
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-[13px] text-[#6B6A65] transition-colors hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white">
                            <User size={15} />
                        </span>
                        <span className="flex items-center gap-1">
                            <ArrowLeft size={13} />
                            All venues
                        </span>
                    </Link>
                )}
                {!hasMultipleVenues && <span />}
                <div className="hidden md:block">{mounted && <ThemeToggle theme={theme} toggle={toggle} />}</div>
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
    const { data: tenant } = useGetTenantBySlug(slug ?? '');
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden">
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E7E5E0] bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0A0A0C]">
                <span className="truncate text-[15px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                    {tenant?.data.name ?? 'Workspace'}
                </span>
                <div className="flex items-center gap-1">
                    <Link
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open public page"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7E5E0] text-[#6B6A65] dark:border-white/10 dark:text-[#94938D]">
                        <ExternalLink size={16} />
                    </Link>
                    <button
                        type="button"
                        aria-label="Open menu"
                        onClick={() => setOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7E5E0] text-[#0A0A0C] dark:border-white/10 dark:text-[#F5F4F2]">
                        <Menu size={18} />
                    </button>
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
                            className="fixed inset-0 z-40 bg-black/60"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-[#E7E5E0] bg-white dark:border-white/10 dark:bg-[#0A0A0C]">
                            <div className="flex justify-end p-3">
                                <button
                                    type="button"
                                    aria-label="Close menu"
                                    onClick={() => setOpen(false)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7E5E0] text-[#0A0A0C] dark:border-white/10 dark:text-[#F5F4F2]">
                                    <X size={18} />
                                </button>
                            </div>
                            <SidebarContent slug={slug ?? ''} onNavigate={() => setOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
