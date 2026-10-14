'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { Menu, X, LayoutDashboard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { body } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import type { Theme } from '@/shared/hooks/useTheme';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { MagneticButton } from '@/shared/ui/MagneticButton';
import { BaseHeader } from '@/shared/ui/BaseHeader';

export const PUBLIC_NAV_LINKS = [
    { href: '/#features', labelKey: 'nav.features', fallback: 'Features' },
    { href: '/#how', labelKey: 'nav.howItWorks', fallback: 'How it works' },
    { href: '/#pricing', labelKey: 'nav.pricing', fallback: 'Pricing' },
    { href: '/about', labelKey: 'nav.about', fallback: 'About' },
    { href: '/contact', labelKey: 'nav.contact', fallback: 'Contact' },
];

export function PublicNavbar({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) {
    const t = useTranslations('landing');
    const { status } = useSession();
    const [hovered, setHovered] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => scrollY.on('change', (v) => setScrolled(v > 12)), [scrollY]);
    useEffect(() => setMobileOpen(false), [scrolled]);

    const isAuthenticated = status === 'authenticated';

    const getNavLabel = (link: (typeof PUBLIC_NAV_LINKS)[number]) => {
        try {
            return t(link.labelKey as any);
        } catch {
            return link.fallback;
        }
    };

    const centerNav = (
        <nav
            className={`${body.className} hidden md:flex items-center gap-5 lg:gap-7 text-[13.5px] text-[#6B6A65] dark:text-[#94938D] whitespace-nowrap`}>
            {PUBLIC_NAV_LINKS.map((l) => (
                <Link
                    key={l.href}
                    href={l.href}
                    onMouseEnter={() => setHovered(l.href)}
                    onMouseLeave={() => setHovered(null)}
                    className="relative py-1 transition-colors hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                    {getNavLabel(l)}
                    {hovered === l.href && (
                        <motion.span
                            layoutId="nav-hover"
                            className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#3B82F6]"
                        />
                    )}
                </Link>
            ))}
        </nav>
    );

    const mobileDropdown = (
        <AnimatePresence>
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="overflow-hidden rounded-2xl border border-black/10 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#141417]/95">
                    <div className="flex flex-col gap-3">
                        {PUBLIC_NAV_LINKS.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setMobileOpen(false)}
                                className="py-2 text-[14px] text-[#6B6A65] transition-colors hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2]">
                                {getNavLabel(l)}
                            </Link>
                        ))}
                        <div className="my-1 border-t border-black/5 dark:border-white/5" />
                        <div className="flex items-center justify-between pt-1">
                            <span className="text-[12px] font-medium text-[#6B6A65] dark:text-[#94938D]">
                                Theme / Language
                            </span>
                            <div className="flex items-center gap-2">
                                <ThemeToggle theme={theme} toggle={toggleTheme} />
                                <LanguageSwitcher align="right" direction="down" />
                            </div>
                        </div>
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                onClick={() => setMobileOpen(false)}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] py-2.5 text-[13px] font-semibold text-white">
                                <LayoutDashboard size={14} />
                                {t('nav.dashboard')}
                            </Link>
                        ) : (
                            <div className="mt-2 flex flex-col gap-2">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex w-full items-center justify-center rounded-xl border border-black/10 py-2.5 text-[13px] font-medium text-[#0A0A0C] dark:border-white/10 dark:text-[#F5F4F2]">
                                    {t('nav.signIn')}
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] py-2.5 text-[13px] font-semibold text-white">
                                    {t('nav.getStarted')}
                                    <ArrowRight size={13} />
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <BaseHeader
            scrolled={scrolled}
            centerContent={centerNav}
            bottomContent={mobileDropdown}>
            <div className="hidden sm:flex items-center gap-2 shrink-0">
                <ThemeToggle theme={theme} toggle={toggleTheme} />
                <LanguageSwitcher align="right" direction="down" />
            </div>

            {isAuthenticated ? (
                <div className="flex items-center shrink-0">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-opacity hover:opacity-95">
                        <LayoutDashboard size={14} />
                        <span className="hidden sm:inline">{t('nav.dashboard')}</span>
                    </Link>
                </div>
            ) : (
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/login"
                        className="hidden sm:inline-flex items-center whitespace-nowrap rounded-xl px-3 py-1.5 text-[13px] font-medium text-[#6B6A65] transition-colors hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2]">
                        {t('nav.signIn')}
                    </Link>
                    <MagneticButton href="/register" className="shrink-0">
                        <span className="whitespace-nowrap px-1 text-[13px] font-semibold">
                            {t('nav.getStarted')}
                        </span>
                    </MagneticButton>
                </div>
            )}

            <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                className="rounded-lg p-2 text-[#6B6A65] transition-colors md:hidden hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2]">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
        </BaseHeader>
    );
}
