'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { body } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { NAV_LINKS } from '../../config/landing-data';
import type { Theme } from '@/shared/hooks/useTheme';
import { Logo } from '@/shared/ui/Logo';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { MagneticButton } from '../ui/MagneticButton';
import Link from 'next/link';

export function Navbar({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) {
    const [hovered, setHovered] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => scrollY.on('change', (v) => setScrolled(v > 12)), [scrollY]);
    useEffect(() => setMobileOpen(false), [scrolled]);

    return (
        <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-6">
            <motion.div
                animate={{
                    boxShadow: scrolled ? '0 12px 40px -16px rgba(10,10,12,0.18)' : '0 0px 0px 0px rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.3, ease: EASE }}
                className="mx-auto max-w-6xl rounded-full border border-[#E7E5E0]/80 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
                <div className="flex items-center justify-between px-4 py-2.5 sm:px-5">
                    <Logo />

                    <nav
                        className={`${body.className} hidden items-center gap-7 text-[13.5px] text-[#6B6A65] dark:text-[#94938D] md:flex`}>
                        {NAV_LINKS.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onMouseEnter={() => setHovered(l.href)}
                                onMouseLeave={() => setHovered(null)}
                                className="relative py-1 transition-colors hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                                {l.label}
                                {hovered === l.href && (
                                    <motion.span
                                        layoutId="nav-hover"
                                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#3B82F6]"
                                    />
                                )}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2.5">
                        <ThemeToggle theme={theme} toggle={toggleTheme} className="hidden sm:flex" />
                        <Link
                            href="/login"
                            className={`${body.className} hidden text-[13.5px] text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2] lg:block`}>
                            Log in
                        </Link>
                        <MagneticButton
                            primary
                            showSparks
                            href="/register"
                            className={`${body.className} hidden cursor-pointer rounded-full bg-[#0A0A0C] px-4 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-[#232327] dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white sm:inline-block`}>
                            Start for free
                        </MagneticButton>
                        <button
                            type="button"
                            aria-label="Open menu"
                            onClick={() => setMobileOpen((v) => !v)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7E5E0] text-[#0A0A0C] dark:border-[#232327] dark:text-[#F5F4F2] md:hidden">
                            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="overflow-hidden border-t border-[#E7E5E0] dark:border-white/10 md:hidden">
                            <div className="flex flex-col gap-1 px-5 py-4">
                                {NAV_LINKS.map((l) => (
                                    <a
                                        key={l.href}
                                        href={l.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`${body.className} rounded-xl px-2 py-2.5 text-[14.5px] text-[#6B6A65] hover:bg-[#0A0A0C]/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-[#F5F4F2]`}>
                                        {l.label}
                                    </a>
                                ))}
                                <div className="mt-2 flex items-center justify-between border-t border-[#E7E5E0] pt-4 dark:border-white/10">
                                    <Link
                                        href="/login"
                                        className={`${body.className} text-[14px] text-[#6B6A65] dark:text-[#94938D]`}>
                                        Log in
                                    </Link>
                                    <ThemeToggle theme={theme} toggle={toggleTheme} />
                                </div>
                                <MagneticButton
                                    primary
                                    showSparks
                                    href="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className={`${body.className} mt-3 flex cursor-pointer items-center justify-center rounded-full bg-[#0A0A0C] px-4 py-3 text-[14px] font-medium text-white dark:bg-[#F5F4F2] dark:text-[#0A0A0C]`}>
                                    Start for free
                                </MagneticButton>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </header>
    );
}
