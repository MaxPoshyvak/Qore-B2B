'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    UtensilsCrossed,
    Sparkles,
    QrCode,
    Users,
    Bell,
    Clock,
    TrendingUp,
    Settings,
    ArrowRight,
    ArrowLeft,
    X,
    CheckCircle2,
    Lightbulb,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useOnboardingTour, TOUR_STEPS } from '../model/useOnboardingTour';
import { EASE } from '@/shared/config/animations';

const STEP_ICONS: Record<string, typeof LayoutDashboard> = {
    overview: LayoutDashboard,
    'menu-builder': UtensilsCrossed,
    'menu-promotions': Sparkles,
    'tables-floor': QrCode,
    'tables-reservations': Users,
    'orders-live': Bell,
    'orders-history': Clock,
    'analytics-overview': TrendingUp,
    'settings-general': Settings,
};

export function DashboardTourGuide({ slug }: { slug: string }) {
    const t = useTranslations();
    const router = useRouter();

    const {
        isOpen,
        stepIndex,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        finishTour,
    } = useOnboardingTour();

    // Auto-start for first-time visitors of this tenant
    useEffect(() => {
        if (!slug) return;
        const timer = setTimeout(() => {
            startTour(slug, false);
        }, 900);
        return () => clearTimeout(timer);
    }, [slug, startTour]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                skipTour();
            } else if (e.key === 'ArrowRight') {
                nextStep((url) => router.push(url));
            } else if (e.key === 'ArrowLeft') {
                prevStep((url) => router.push(url));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, nextStep, prevStep, skipTour, router]);

    if (!isOpen) return null;

    const currentStep = TOUR_STEPS[stepIndex];
    const isLastStep = stepIndex === TOUR_STEPS.length - 1;
    const progressPercent = ((stepIndex + 1) / TOUR_STEPS.length) * 100;
    const StepIcon = STEP_ICONS[currentStep.id] || LayoutDashboard;

    const navigate = (url: string) => router.push(url);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="fixed bottom-5 right-5 z-50 w-96 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-3xl border border-black/10 bg-white/95 p-5 text-[#0A0A0C] shadow-2xl backdrop-blur-2xl dark:border-white/15 dark:bg-[#141417]/95 dark:text-[#F5F4F2]">
                {/* Ambient Top Glow */}
                <div className="pointer-events-none absolute -top-12 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#3B82F6]/25 to-[#8B5CF6]/25 blur-2xl" />

                {/* Header: Progress & Close */}
                <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] text-white shadow-md shadow-[#3B82F6]/20">
                            <StepIcon size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3B82F6] dark:text-[#60A5FA]">
                                {t('dashboard.tour.stepCounter', {
                                    current: stepIndex + 1,
                                    total: TOUR_STEPS.length,
                                })}
                            </span>
                            <span className="text-[10px] text-[#9C9B95] dark:text-[#71717A]">
                                {t('dashboard.tour.productTour')}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={skipTour}
                        aria-label={t('dashboard.tour.skip')}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9C9B95] transition-colors hover:bg-black/5 hover:text-[#0A0A0C] dark:hover:bg-white/10 dark:hover:text-white">
                        <X size={15} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.35, ease: EASE }}
                    />
                </div>

                {/* Step Content */}
                <div className="relative mt-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep.id}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.25, ease: EASE }}>
                            <h3 className="text-base font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]">
                                {t(currentStep.titleKey)}
                            </h3>
                            <p className="mt-1.5 text-xs leading-relaxed text-[#6B6A65] dark:text-[#A1A1AA]">
                                {t(currentStep.descKey)}
                            </p>

                            {/* Pro-Tip Box */}
                            <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-black/5 bg-black/[0.02] p-2.5 dark:border-white/5 dark:bg-white/[0.03]">
                                <Lightbulb size={14} className="mt-0.5 shrink-0 text-[#F59E0B]" />
                                <span className="text-[11px] leading-relaxed text-[#52525B] dark:text-[#D4D4D8]">
                                    {t(currentStep.tipKey)}
                                </span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="relative mt-5 flex items-center justify-between gap-2 border-t border-black/5 pt-3 dark:border-white/10">
                    <button
                        type="button"
                        onClick={skipTour}
                        className="text-[11.5px] font-medium text-[#71717A] transition-colors hover:text-[#0A0A0C] dark:text-[#A1A1AA] dark:hover:text-white">
                        {t('dashboard.tour.skip')}
                    </button>

                    <div className="flex items-center gap-2">
                        {stepIndex > 0 && (
                            <button
                                type="button"
                                onClick={() => prevStep(navigate)}
                                aria-label={t('dashboard.tour.back')}
                                className="flex h-8 items-center gap-1 rounded-xl border border-black/10 px-2.5 text-xs font-semibold text-[#0A0A0C] transition-all hover:bg-black/5 active:scale-95 dark:border-white/10 dark:text-[#F5F4F2] dark:hover:bg-white/10">
                                <ArrowLeft size={13} />
                                <span>{t('dashboard.tour.back')}</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => (isLastStep ? finishTour(navigate) : nextStep(navigate))}
                            className="flex h-8 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-3.5 text-xs font-semibold text-white shadow-md shadow-[#3B82F6]/20 transition-all hover:opacity-95 active:scale-95">
                            {isLastStep ? (
                                <>
                                    <CheckCircle2 size={13} />
                                    <span>{t('dashboard.tour.finish')}</span>
                                </>
                            ) : (
                                <>
                                    <span>{t('dashboard.tour.next')}</span>
                                    <ArrowRight size={13} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
