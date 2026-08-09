'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
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
} from 'lucide-react';

import { Logo } from '@/shared/ui/Logo';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useTheme } from '@/shared/hooks/useTheme';
import { useGetTenantBySlug, useGetMyTenants } from '@/entities/tenant/hooks/useTenants';

const NAV = [
    { label: 'Overview', suffix: '', icon: LayoutDashboard },
    { label: 'Menu', suffix: '/menu', icon: UtensilsCrossed },
    { label: 'Tables & QR', suffix: '/tables', icon: QrCode },
    { label: 'Live Orders', suffix: '/orders', icon: Bell, badge: 3 },
    { label: 'Analytics', suffix: '/analytics', icon: TrendingUp },
    { label: 'Settings', suffix: '/settings', icon: Settings },
];

function SidebarContent({ slug, onNavigate }: { slug: string; onNavigate?: () => void }) {
    const pathname = usePathname();
    const { theme, toggle, mounted } = useTheme();
    const { data: tenant } = useGetTenantBySlug(slug);
    const { data: myTenants } = useGetMyTenants();
    const [switcherOpen, setSwitcherOpen] = useState(false);

    const others = (myTenants?.data ?? []).filter((t) => t.slug !== slug);

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
                    Your venue
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

            {/* Workspace switcher */}
            {others.length > 0 && (
                <div className="relative mt-4">
                    <button
                        type="button"
                        onClick={() => setSwitcherOpen((v) => !v)}
                        className="flex w-full items-center justify-between rounded-xl border border-[#E7E5E0]/80 bg-white/60 px-3 py-2 text-[13px] font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-white/10 dark:bg-white/5 dark:text-[#F5F4F2]">
                        <span className="flex items-center gap-2">
                            <Store size={14} className="text-[#8B5CF6]" />
                            Switch workspace
                        </span>
                        <ChevronDown size={15} className={`transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
                    </button>
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
                    const href = `/dashboard/${slug}${item.suffix}`;
                    const active = pathname === href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            href={href}
                            onClick={onNavigate}
                            className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] transition-colors ${
                                active
                                    ? 'bg-white/5 text-[#F5F4F2]'
                                    : 'text-[#94938D] hover:bg-white/5 hover:text-[#F5F4F2]'
                            }`}>
                            <span
                                className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[#3B82F6] transition-opacity ${
                                    active ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                            <Icon size={17} strokeWidth={1.9} />
                            <span className="flex-1">{item.label}</span>
                            {item.badge != null && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3B82F6] px-1.5 text-[11px] font-semibold text-white">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-[#E7E5E0]/80 pt-4 dark:border-white/10">
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
                <div className="hidden md:block">
                    {mounted && <ThemeToggle theme={theme} toggle={toggle} />}
                </div>
            </div>
        </div>
    );
}

export function DashboardSidebar() {
    const { slug } = useParams<{ slug: string }>();
    return (
        <aside className="hidden md:flex md:h-full md:w-64 md:shrink-0 md:flex-col md:overflow-y-auto md:border-r md:border-white/10 md:bg-black/40 md:backdrop-blur-xl">
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
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl">
                <span className="truncate text-[15px] font-semibold text-[#F5F4F2]">
                    {tenant?.data.name ?? 'Workspace'}
                </span>
                <div className="flex items-center gap-1">
                    <Link
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open public page"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#94938D]">
                        <ExternalLink size={16} />
                    </Link>
                    <button
                        type="button"
                        aria-label="Open menu"
                        onClick={() => setOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#F5F4F2]">
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
                            className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-white/10 bg-[#0A0A0C]">
                            <div className="flex justify-end p-3">
                                <button
                                    type="button"
                                    aria-label="Close menu"
                                    onClick={() => setOpen(false)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#F5F4F2]">
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
