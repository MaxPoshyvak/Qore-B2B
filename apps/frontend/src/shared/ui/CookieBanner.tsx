'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie, ShieldCheck, X, Check, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { display, mono } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { ToggleSwitch } from '@/shared/ui/ToggleSwitch';

export const COOKIE_CONSENT_KEY = 'qore_cookie_consent';

export type CookiePreferences = {
    essential: boolean;
    analytics: boolean;
    functional: boolean;
    timestamp: number;
};

/** Dispatches a global event to open the Cookie Preferences modal from anywhere (e.g. footer link). */
export function openCookieSettings() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('qore:open-cookie-settings'));
    }
}

export function CookieBanner() {
    const t = useTranslations('cookies');

    const [mounted, setMounted] = useState(false);
    const [isBannerVisible, setIsBannerVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Default category states
    const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
    const [functionalAllowed, setFunctionalAllowed] = useState(true);

    useEffect(() => {
        setMounted(true);

        // Check existing consent
        try {
            const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
            if (stored) {
                const parsed: CookiePreferences = JSON.parse(stored);
                setAnalyticsAllowed(!!parsed.analytics);
                setFunctionalAllowed(parsed.functional !== false);
            } else {
                // Show banner after brief initial page render
                const timer = setTimeout(() => setIsBannerVisible(true), 600);
                return () => clearTimeout(timer);
            }
        } catch {
            setIsBannerVisible(true);
        }

        const handleOpenSettings = () => {
            setIsModalOpen(true);
        };

        window.addEventListener('qore:open-cookie-settings', handleOpenSettings);
        return () => window.removeEventListener('qore:open-cookie-settings', handleOpenSettings);
    }, []);

    const saveConsent = (analytics: boolean, functional: boolean) => {
        const payload: CookiePreferences = {
            essential: true,
            analytics,
            functional,
            timestamp: Date.now(),
        };

        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(payload));
            const maxAge = 365 * 24 * 60 * 60; // 1 year
            document.cookie = `qore_consent=${analytics ? 'all' : 'essential'}; path=/; max-age=${maxAge}; SameSite=Lax`;
        } catch (e) {
            console.error('Failed to save cookie consent:', e);
        }

        setAnalyticsAllowed(analytics);
        setFunctionalAllowed(functional);
        setIsBannerVisible(false);
        setIsModalOpen(false);
    };

    const handleAcceptAll = () => saveConsent(true, true);
    const handleEssentialOnly = () => saveConsent(false, false);
    const handleSaveCustom = () => saveConsent(analyticsAllowed, functionalAllowed);

    if (!mounted) return null;

    return (
        <>
            {/* Minimalist Floating Banner */}
            <AnimatePresence>
                {isBannerVisible && !isModalOpen && (
                    <motion.aside
                        role="region"
                        aria-label={t('modalTitle')}
                        initial={{ opacity: 0, y: 32, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl sm:bottom-6 sm:right-6 sm:left-auto">
                        <div className="relative overflow-hidden rounded-[26px] border border-black/10 bg-white/95 p-5 shadow-2xl shadow-black/10 backdrop-blur-2xl dark:border-white/10 dark:bg-[#141417]/95 dark:shadow-black/50">
                            <div className="flex items-start gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6]/15 to-[#8B5CF6]/15 text-[#3B82F6] dark:text-[#60A5FA]">
                                    <Cookie size={20} strokeWidth={2.2} />
                                </span>

                                <div className="flex-1 pr-1">
                                    <h3
                                        className={`${display.className} text-[15px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                        {t('title')}
                                    </h3>
                                    <p className="mt-1 text-[13px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                        {t('description')}{' '}
                                        <Link
                                            href="/privacy"
                                            className="font-medium text-[#3B82F6] underline-offset-2 hover:underline dark:text-[#60A5FA]">
                                            {t('privacyLink')}
                                        </Link>
                                    </p>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAcceptAll}
                                            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-4 py-2 text-[12.5px] font-semibold text-white shadow-md shadow-[#3B82F6]/20 transition-opacity hover:opacity-95">
                                            {t('acceptAll')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleEssentialOnly}
                                            className="inline-flex items-center justify-center rounded-xl border border-[#E7E5E0] bg-white px-3.5 py-2 text-[12.5px] font-medium text-[#0A0A0C] transition-colors hover:bg-black/5 dark:border-[#232327] dark:bg-white/5 dark:text-[#F5F4F2] dark:hover:bg-white/10">
                                            {t('essentialOnly')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(true)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-2 text-[12px] font-medium text-[#6B6A65] transition-colors hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2]">
                                            <SlidersHorizontal size={13} />
                                            {t('customize')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Detailed Preferences Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label={t('modalTitle')}
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#141417] sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA]">
                                        <ShieldCheck size={22} strokeWidth={2} />
                                    </span>
                                    <div>
                                        <h2
                                            className={`${display.className} text-[19px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                            {t('modalTitle')}
                                        </h2>
                                        <p className="text-[12.5px] text-[#6B6A65] dark:text-[#94938D]">
                                            Qore Technologies · GDPR & Privacy
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    aria-label="Close"
                                    className="rounded-full p-1.5 text-[#6B6A65] transition-colors hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/10 dark:hover:text-[#F5F4F2]">
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="mt-3 text-[13px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                {t('modalDesc')}
                            </p>

                            <div className="mt-6 space-y-3.5">
                                {/* Strictly Necessary */}
                                <div className="rounded-2xl border border-[#E7E5E0] bg-black/[0.02] p-4 dark:border-[#232327] dark:bg-white/[0.02]">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[13.5px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                {t('essentialTitle')}
                                            </span>
                                        </div>
                                        <span
                                            className={`${mono.className} inline-flex items-center gap-1 rounded-full bg-[#10B981]/10 px-2.5 py-0.5 text-[10.5px] font-medium text-[#04916C] dark:text-[#10B981]`}>
                                            <Check size={11} strokeWidth={2.5} />
                                            {t('alwaysActive')}
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                        {t('essentialDesc')}
                                    </p>
                                </div>

                                {/* Analytics */}
                                <div className="rounded-2xl border border-[#E7E5E0] bg-white p-4 dark:border-[#232327] dark:bg-white/[0.04]">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-semibold text-[13.5px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                                            {t('analyticsTitle')}
                                        </span>
                                        <ToggleSwitch
                                            checked={analyticsAllowed}
                                            onChange={setAnalyticsAllowed}
                                            aria-label={t('analyticsTitle')}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                        {t('analyticsDesc')}
                                    </p>
                                </div>

                                {/* Functional */}
                                <div className="rounded-2xl border border-[#E7E5E0] bg-white p-4 dark:border-[#232327] dark:bg-white/[0.04]">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-semibold text-[13.5px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                                            {t('functionalTitle')}
                                        </span>
                                        <ToggleSwitch
                                            checked={functionalAllowed}
                                            onChange={setFunctionalAllowed}
                                            aria-label={t('functionalTitle')}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                        {t('functionalDesc')}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#E7E5E0] dark:border-[#232327]">
                                <button
                                    type="button"
                                    onClick={handleSaveCustom}
                                    className="rounded-xl border border-[#E7E5E0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0A0A0C] transition-colors hover:bg-black/5 dark:border-[#232327] dark:bg-white/5 dark:text-[#F5F4F2] dark:hover:bg-white/10">
                                    {t('savePreferences')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAcceptAll}
                                    className="rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-[#3B82F6]/25 transition-opacity hover:opacity-95">
                                    {t('acceptAll')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
