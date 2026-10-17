'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
    Sparkles,
    MessageSquare,
    Palette,
    ShoppingBag,
    Star,
    Check,
    Plus,
    Wine,
    Send,
    Loader2,
    ThumbsUp,
    TrendingUp,
    Bot,
    X,
    Wand2,
} from 'lucide-react';

import { display, mono } from '@/shared/lib/fonts';
import { usePhoneDemo, type DemoScene } from '../../hooks/usePhoneDemo';
import { TiltCard } from '../ui/TiltCard';

export function PhoneDemo() {
    const t = useTranslations('landing.phoneDemo');
    const { activeScene, elapsedMs, progress, isPaused, setIsPaused, setScene } = usePhoneDemo();

    const tabs = useMemo(
        () => [
            { id: 'waiter' as DemoScene, label: t('tabWaiter'), icon: MessageSquare },
            { id: 'themes' as DemoScene, label: t('tabThemes'), icon: Palette },
            { id: 'upsell' as DemoScene, label: t('tabUpsell'), icon: ShoppingBag },
            { id: 'reviews' as DemoScene, label: t('tabReviews'), icon: Star },
        ],
        [t],
    );

    const activeDescription = useMemo(() => {
        switch (activeScene) {
            case 'waiter':
                return t('descWaiter');
            case 'themes':
                return t('descThemes');
            case 'upsell':
                return t('descUpsell');
            case 'reviews':
                return t('descReviews');
        }
    }, [activeScene, t]);

    return (
        <div
            className="relative mx-auto w-full max-w-[320px] sm:max-w-[335px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}>
            {/* Interactive Feature Tabs */}
            <div className="mb-2 grid grid-cols-4 gap-1 sm:gap-1.5 rounded-2xl border border-black/5 bg-black/[0.03] p-1 backdrop-blur-md dark:border-white/5 dark:bg-white/[0.04]">
                {tabs.map((tab) => {
                    const isActive = activeScene === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setScene(tab.id)}
                            className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl px-1 sm:px-2 py-1.5 sm:py-2 text-center transition-all ${
                                isActive
                                    ? 'bg-white text-[#0A0A0C] shadow-sm dark:bg-[#1E1D24] dark:text-white'
                                    : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-white'
                            }`}>
                            <Icon
                                size={12}
                                className={`shrink-0 ${isActive ? 'text-violet-600 dark:text-violet-400' : ''}`}
                            />
                            <span className="text-[10.5px] sm:text-[11.5px] font-semibold tracking-tight whitespace-nowrap">
                                {tab.label}
                            </span>

                            {/* Active progress indicator line */}
                            {isActive && (
                                <motion.div
                                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400"
                                    style={{ width: `${progress}%` }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Contextual Narrative Subtitle Banner */}
            <div className="mb-3 text-center px-1 min-h-[30px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={activeScene}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.2 }}
                        className="text-[11.5px] sm:text-[12px] font-medium text-[#6B6A65] dark:text-[#94938D]">
                        {activeDescription}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Glowing Backdrop Aura */}
            <div
                className="absolute -inset-4 rounded-full opacity-35 blur-3xl transition-all duration-700 pointer-events-none"
                style={{
                    background:
                        activeScene === 'waiter'
                            ? 'radial-gradient(circle, rgba(139,92,246,0.4), rgba(59,130,246,0.15), transparent 70%)'
                            : activeScene === 'themes'
                              ? 'radial-gradient(circle, rgba(236,72,153,0.35), rgba(6,182,212,0.25), transparent 70%)'
                              : activeScene === 'upsell'
                                ? 'radial-gradient(circle, rgba(139,92,246,0.35), rgba(16,185,129,0.2), transparent 70%)'
                                : 'radial-gradient(circle, rgba(245,158,11,0.3), rgba(139,92,246,0.2), transparent 70%)',
                }}
            />

            {/* 3D Tilt Wrapper */}
            <TiltCard strength={6}>
                {/* Clean Smartphone Chassis Frame - compact h-[580px] sm:h-[600px] */}
                <div className="relative mx-auto h-[580px] sm:h-[600px] w-full rounded-[44px] border-[8px] border-[#18181B] bg-[#0A0A0C] ring-1 ring-white/10 dark:border-[#27272A] dark:ring-white/15 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5),0_0_25px_rgba(0,0,0,0.15)]">
                    {/* Screen Viewport */}
                    <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#0A0A0C] select-none">
                        {/* Dynamic Island Pill */}
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 h-4.5 w-24 rounded-full bg-black flex items-center justify-between px-2.5 shadow-md pointer-events-none">
                            <div className="h-2 w-2 rounded-full bg-[#111116] border border-blue-950/40 flex items-center justify-center">
                                <div className="h-0.5 w-0.5 rounded-full bg-blue-400/60" />
                            </div>
                            <div className="h-1.5 w-1.5 rounded-full bg-[#14141A]" />
                        </div>

                        <AnimatePresence mode="wait">
                            {activeScene === 'waiter' && (
                                <WaiterScene key="waiter" elapsedMs={elapsedMs} t={t} />
                            )}
                            {activeScene === 'themes' && (
                                <ThemesScene key="themes" elapsedMs={elapsedMs} t={t} />
                            )}
                            {activeScene === 'upsell' && (
                                <UpsellScene key="upsell" elapsedMs={elapsedMs} t={t} />
                            )}
                            {activeScene === 'reviews' && (
                                <ReviewsScene key="reviews" elapsedMs={elapsedMs} t={t} />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </TiltCard>
        </div>
    );
}

/* ===================================================================== */
/*  Scene 1: AI Waiter & Sommelier Concierge                             */
/* ===================================================================== */
function WaiterScene({ elapsedMs, t }: { elapsedMs: number; t: any }) {
    // Stage triggers (Total scene duration: 8500ms)
    // 0 - 1.8s: Empty state with bot greeting and 4 suggested questions chips
    // 1.8s: Chip 1 ("What pairs well with white wine?") is clicked
    // 1.8s - 2.8s: User message bubble sent to chat
    // 2.8s - 4.0s: Bot thinking indicator with bouncing dots
    // 4.0s - 8.5s: Bot reply bubble + Wine recommendation card
    // 6.4s - 8.5s: "Add to Cart" clicked -> "Added to Cart ✓"
    const isChipClicked = elapsedMs > 1800;
    const showUserMsg = elapsedMs > 1800;
    const showThinking = elapsedMs > 2800 && elapsedMs < 4000;
    const showAiResponse = elapsedMs >= 4000;
    const isAddedToCart = elapsedMs > 6400;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col justify-between bg-[#0E0D15] text-[#F5F4F2] pt-8.5">
            {/* Header (1:1 replica of AiWaiterModal header) */}
            <div className="relative flex items-center justify-between border-b border-white/5 px-3.5 py-2.5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-violet-500/25">
                        <Sparkles className="h-4 w-4 text-amber-200" />
                    </div>
                    <div className="leading-tight">
                        <div className="flex items-center gap-1.5">
                            <h2 className={`${display.className} text-[11.5px] font-bold text-white`}>
                                {t('waiterTitle')}
                            </h2>
                            <span className="rounded-full bg-violet-400/20 px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider text-violet-300">
                                {t('waiterProBadge')}
                            </span>
                        </div>
                        <p className="text-[8.5px] text-[#94938D] line-clamp-1">
                            {t('waiterSubtitle')}
                        </p>
                    </div>
                </div>

                <div className="flex h-6 w-6 items-center justify-center rounded-lg text-[#94938D]">
                    <X size={13} />
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5 no-scrollbar">
                {/* Bot Welcome Greeting Bubble */}
                <div className="flex items-start gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-400/20 text-violet-300">
                        <Sparkles size={11} />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm border border-white/5 bg-white/[0.05] p-2.5 text-[9.5px] leading-relaxed text-[#F5F4F2]">
                        {t('waiterEmptyGreeting')}
                    </div>
                </div>

                {/* Suggested Questions (Visible before user clicks or fades slightly) */}
                {!showUserMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-1">
                        <p className="mb-1.5 text-[8.5px] font-bold uppercase tracking-wider text-[#94938D]">
                            {t('waiterSuggestedTitle')}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            <motion.button
                                animate={
                                    elapsedMs > 1500 && elapsedMs < 1800
                                        ? { scale: [1, 0.94, 1] }
                                        : {}
                                }
                                className={`rounded-full border px-2.5 py-1 text-[8.5px] font-medium transition-all ${
                                    isChipClicked
                                        ? 'border-violet-500 bg-violet-600 text-white shadow-xs'
                                        : 'border-white/10 bg-[#1E1E22] text-[#F5F4F2]'
                                }`}>
                                {t('waiterPrompt1')}
                            </motion.button>
                            <span className="rounded-full border border-white/10 bg-[#1E1E22] px-2.5 py-1 text-[8.5px] font-medium text-[#F5F4F2]/80">
                                {t('waiterPrompt2')}
                            </span>
                            <span className="rounded-full border border-white/10 bg-[#1E1E22] px-2.5 py-1 text-[8.5px] font-medium text-[#F5F4F2]/80">
                                {t('waiterPrompt3')}
                            </span>
                            <span className="rounded-full border border-white/10 bg-[#1E1E22] px-2.5 py-1 text-[8.5px] font-medium text-[#F5F4F2]/80">
                                {t('waiterPrompt4')}
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* User Message Bubble */}
                {showUserMsg && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-right text-[9.5px] text-white shadow-sm">
                        {t('waiterUserMsg')}
                    </motion.div>
                )}

                {/* Thinking / Consultation Indicator */}
                {showThinking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-400/20 text-violet-300">
                            <Sparkles size={11} className="animate-spin" />
                        </div>
                        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/5 bg-white/[0.05] px-2.5 py-1.5 text-[8.5px] text-[#94938D]">
                            <span className="flex gap-1">
                                <span className="h-1 w-1 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
                                <span className="h-1 w-1 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
                                <span className="h-1 w-1 animate-bounce rounded-full bg-violet-400" />
                            </span>
                            <span>Consulting kitchen & cellar...</span>
                        </div>
                    </motion.div>
                )}

                {/* AI Sommelier Response & Recommended Dish Card */}
                {showAiResponse && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="space-y-2">
                        {/* Bot Bubble */}
                        <div className="flex items-start gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-400/20 text-violet-300">
                                <Sparkles size={11} />
                            </div>
                            <div className="rounded-2xl rounded-tl-sm border border-white/5 bg-white/[0.05] p-2.5 text-[9px] leading-relaxed text-[#F5F4F2]">
                                {t('waiterAiMsg')}
                            </div>
                        </div>

                        {/* Wine Recommendation Card (1:1 with AiWaiterModal dish card) */}
                        <div className="ml-8 overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E22]/95 p-2 shadow-sm">
                            <div className="flex items-start gap-2">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-950/60 border border-red-500/30 text-red-300">
                                    <Wine size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1">
                                        <h4 className="text-[10px] font-bold text-white leading-tight truncate">
                                            {t('waiterWineName')}
                                        </h4>
                                        <span className="font-mono text-[9.5px] font-bold text-violet-400 shrink-0">
                                            {t('waiterWinePrice')}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-[8px] text-[#94938D] line-clamp-1">
                                        Piedmont, Nebbiolo · Velvety pairing
                                    </p>
                                </div>
                            </div>

                            {/* Add button */}
                            <div className="mt-2 flex items-center justify-end border-t border-white/5 pt-1.5">
                                <motion.button
                                    animate={
                                        elapsedMs > 6200 && elapsedMs < 6500
                                            ? { scale: [1, 0.9, 1] }
                                            : {}
                                    }
                                    className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-[9px] font-semibold transition-all shadow-xs ${
                                        isAddedToCart
                                            ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                                            : 'bg-violet-600 text-white shadow-violet-500/20'
                                    }`}>
                                    {isAddedToCart ? (
                                        <>
                                            <Check size={9} strokeWidth={3} />
                                            <span>{t('waiterAdded')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={9} strokeWidth={3} />
                                            <span>{t('waiterAdd')}</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Footer Bar - ALWAYS VISIBLE FROM 0ms */}
            <div className="border-t border-white/5 p-2.5 bg-[#0A0A0E]">
                <div className="flex items-center gap-1.5">
                    <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[9px] text-[#94938D] truncate">
                        {t('waiterInputPlaceholder')}
                    </div>
                    <button
                        type="button"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25">
                        <Send size={11} />
                    </button>
                </div>
                <p className="mt-1.5 text-center text-[7.5px] text-[#94938D] line-clamp-1">
                    {t('waiterDisclaimer')}
                </p>
            </div>
        </motion.div>
    );
}

/* ===================================================================== */
/*  Scene 2: AI Theme Studio & Live Generation                           */
/* ===================================================================== */
function ThemesScene({ elapsedMs, t }: { elapsedMs: number; t: any }) {
    // Stage triggers (Total scene duration: 8500ms)
    // 0 - 2.4s: AI Theme Studio card shown with prompt & suggested idea pills, above Osteria Toscana menu
    // 2.4s - 4.5s: "🪄 Generate" button clicked -> loader spinning "Generating...", glowing sweep scan
    // 4.5s - 8.5s: Menu transforms into Neo-Tokyo Cyberpunk with live applied pill, cyan & magenta glowing dishes
    const isGenerating = elapsedMs > 2400 && elapsedMs < 4500;
    const isGenerated = elapsedMs >= 4500;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 flex flex-col justify-between pt-8.5 pb-2.5 px-3 transition-colors duration-700 ${
                isGenerated ? 'bg-[#080812] text-white' : 'bg-[#FAF8F5] text-[#1F1E1B]'
            }`}>
            {/* Top AI Theme Studio Card (1:1 replica of DesignTab.tsx & screenshot) */}
            <div
                className={`relative overflow-hidden rounded-2xl border p-2.5 transition-all duration-500 backdrop-blur-md ${
                    isGenerated
                        ? 'border-cyan-500/30 bg-[#0E0D18]/90 shadow-sm'
                        : 'border-violet-500/25 bg-gradient-to-br from-violet-500/[0.08] via-indigo-500/[0.03] to-white/90 shadow-xs'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xs">
                            <Sparkles size={13} />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="text-[10.5px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    {t('themeStudioTitle')}
                                </h3>
                                <span className="rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-1.5 py-0.2 text-[7.5px] font-bold uppercase tracking-wider text-white shadow-xs">
                                    {t('themeStudioBadge')}
                                </span>
                            </div>
                            <p className="text-[8px] text-[#6B6A65] dark:text-[#94938D] line-clamp-1">
                                {t('themeStudioSubtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Prompt Box */}
                <div className="mt-2 rounded-xl border border-black/10 bg-white/80 p-2 text-[8.5px] leading-snug dark:border-white/10 dark:bg-black/50">
                    <span className="font-semibold text-violet-600 dark:text-violet-400">Prompt: </span>
                    <span className="text-[#0A0A0C] dark:text-[#F5F4F2]">
                        &ldquo;{t('themeStudioPrompt')}&rdquo;
                    </span>
                </div>

                {/* Ideas row */}
                <div className="mt-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
                    <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                        {t('themeStudioIdea')}
                    </span>
                    <span className="shrink-0 rounded-full border border-black/5 bg-white/70 px-1.5 py-0.5 text-[7.5px] font-medium text-[#6B6A65] dark:border-white/5 dark:bg-white/5 dark:text-[#94938D]">
                        🍸 Speakeasy
                    </span>
                    <span className="shrink-0 rounded-full border border-black/5 bg-white/70 px-1.5 py-0.5 text-[7.5px] font-medium text-[#6B6A65] dark:border-white/5 dark:bg-white/5 dark:text-[#94938D]">
                        🥐 Patisserie
                    </span>
                    <span className="shrink-0 rounded-full border border-violet-500/40 bg-violet-500/10 px-1.5 py-0.5 text-[7.5px] font-bold text-violet-600 dark:text-violet-400">
                        🍣 Cyberpunk
                    </span>
                </div>

                {/* Generate Button Action */}
                <div className="mt-2 flex items-center justify-between">
                    {isGenerated && (
                        <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-wider">
                            {t('themeStudioRecent')}
                        </span>
                    )}
                    <motion.button
                        animate={
                            elapsedMs > 2200 && elapsedMs < 2500
                                ? { scale: [1, 0.92, 1] }
                                : {}
                        }
                        className={`ml-auto flex items-center gap-1 rounded-xl px-3 py-1 text-[9px] font-bold transition-all shadow-xs ${
                            isGenerated
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/20'
                        }`}>
                        {isGenerating ? (
                            <>
                                <Loader2 size={10} className="animate-spin" />
                                <span>{t('themeStudioGenerating')}</span>
                            </>
                        ) : isGenerated ? (
                            <>
                                <Check size={10} strokeWidth={3} />
                                <span>Applied ✓</span>
                            </>
                        ) : (
                            <>
                                <Wand2 size={10} />
                                <span>{t('themeStudioBtn')}</span>
                            </>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Menu Body Preview (Osteria Toscana -> Neo-Tokyo Izakaya) */}
            <div className="relative flex-1 flex flex-col justify-center my-1.5">
                {/* Glowing wave ripple scan during generation */}
                {isGenerating && (
                    <motion.div
                        initial={{ top: '-20%', opacity: 0 }}
                        animate={{ top: '120%', opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-cyan-400/30 to-fuchsia-500/20 pointer-events-none blur-sm"
                    />
                )}

                <motion.div
                    key={isGenerated ? 'cyber-preview' : 'tuscan-preview'}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}>
                    {/* Restaurant Header */}
                    <div className="flex items-end justify-between border-b pb-1.5 border-current/10">
                        <div>
                            <span
                                className={`${mono.className} text-[7.5px] uppercase tracking-widest ${
                                    isGenerated ? 'text-cyan-400' : 'text-amber-800'
                                }`}>
                                {isGenerated ? 'NEO-SHINJUKU · QR' : 'FIRENZE TRADIZIONE'}
                            </span>
                            <h3
                                className={`${display.className} text-[13px] font-bold tracking-tight ${
                                    isGenerated
                                        ? 'bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400 bg-clip-text text-transparent'
                                        : 'text-[#1F1E1B]'
                                }`}>
                                {isGenerated ? t('themeCyberTitle') : t('themeTuscanTitle')}
                            </h3>
                        </div>
                        <span
                            className={`rounded-full px-2 py-0.5 text-[7.5px] font-bold ${
                                isGenerated
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    : 'bg-amber-800/15 text-amber-900'
                            }`}>
                            {isGenerated ? 'Cyberpunk' : 'Warm Grain'}
                        </span>
                    </div>

                    {/* Dish Cards */}
                    <div className="mt-2 space-y-1.5">
                        {isGenerated ? (
                            <>
                                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/25 p-2 shadow-[0_0_12px_rgba(6,182,212,0.12)]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-bold text-white">
                                                {t('themeCyberDish1')}
                                            </div>
                                            <div className="text-[8px] text-cyan-200/70">
                                                {t('themeCyberDish1Desc')}
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10.5px] font-bold text-cyan-400">
                                            $32.00
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/25 p-2 shadow-[0_0_12px_rgba(236,72,153,0.12)]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-bold text-white">
                                                {t('themeCyberDish2')}
                                            </div>
                                            <div className="text-[8px] text-fuchsia-200/70">
                                                {t('themeCyberDish2Desc')}
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10.5px] font-bold text-fuchsia-400">
                                            $14.00
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="rounded-xl border border-amber-900/10 bg-white/90 p-2 shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-serif font-bold text-[#1F1E1B]">
                                                Tagliolini al Tartufo
                                            </div>
                                            <div className="text-[8px] text-[#6B6A65]">
                                                Handmade pasta, fresh black truffle
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10.5px] font-bold text-amber-800">
                                            $26.00
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-amber-900/10 bg-white/90 p-2 shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-serif font-bold text-[#1F1E1B]">
                                                Burrata Pugliese
                                            </div>
                                            <div className="text-[8px] text-[#6B6A65]">
                                                Heirloom tomatoes, organic basil oil
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10.5px] font-bold text-amber-800">
                                            $16.00
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Status Pill */}
            <div
                className={`rounded-xl border p-1.5 text-center text-[8.5px] font-semibold transition-colors ${
                    isGenerated
                        ? 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300'
                        : 'border-black/5 bg-black/5 text-[#6B6A65] dark:border-white/5 dark:bg-white/5 dark:text-[#94938D]'
                }`}>
                <span>{isGenerated ? t('themeStudioApplied') : '1-Click Prompt-to-Menu Theme'}</span>
            </div>
        </motion.div>
    );
}

/* ===================================================================== */
/*  Scene 3: AI Cart Upsell & Chef's Pairing                             */
/* ===================================================================== */
function UpsellScene({ elapsedMs, t }: { elapsedMs: number; t: any }) {
    // Stage triggers (Duration: 8500ms)
    // 0 - 2.5s: Cart with Truffle Tagliatelle ($24.00)
    // 2.5s - 5.5s: Chef's Pairing card (violet, steady, authentic to CartUpsellSection)
    // 5.5s - 7.0s: Tap + Add
    // 7.0s - 8.5s: Item added, subtotal bumps to $30.50
    const showAiUpsell = elapsedMs > 2400;
    const isAdded = elapsedMs > 5500;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-[#13121D] to-[#0A0A0C] text-white p-3.5 pt-8.5">
            {/* Cart Header */}
            <div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div>
                        <span className={`${mono.className} text-[8.5px] uppercase tracking-widest text-violet-400`}>
                            {t('upsellHeader')}
                        </span>
                        <h3 className={`${display.className} text-xs font-bold text-white`}>
                            {t('upsellTitle')}
                        </h3>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[8.5px] font-semibold text-white/70">
                        {t('upsellGuests')}
                    </span>
                </div>

                {/* Cart Items */}
                <div className="mt-2.5 space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.04] p-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10 text-[9.5px] font-bold">
                                1x
                            </span>
                            <span className="text-[10.5px] font-semibold text-white">
                                {t('waiterDishName')}
                            </span>
                        </div>
                        <span className="text-[10.5px] font-bold text-white">$24.00</span>
                    </div>

                    {/* Added Focaccia Item */}
                    {isAdded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, y: -4 }}
                            animate={{ height: 'auto', opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="flex items-center justify-between rounded-xl border border-violet-500/30 bg-violet-500/10 p-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-500/20 text-violet-300 text-[9.5px] font-bold">
                                    1x
                                </span>
                                <div>
                                    <span className="text-[10.5px] font-semibold text-violet-200">
                                        {t('upsellItemName')}
                                    </span>
                                    <span className="ml-1.5 rounded-sm bg-violet-500/25 px-1 py-0.2 text-[7.5px] font-bold text-violet-300">
                                        {t('upsellAiBadge')}
                                    </span>
                                </div>
                            </div>
                            <span className="text-[10.5px] font-bold text-violet-300">$6.50</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Chef's AI Pairing Card - Authentic Violet/Fuchsia Styling */}
            <div className="my-auto">
                {showAiUpsell && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent p-3 backdrop-blur-md">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-violet-400">
                                <Sparkles size={11} />
                                {t('upsellAiHeading')}
                            </span>
                            <span className="rounded-full bg-violet-500/20 px-1.5 py-0.2 text-[8px] font-bold text-violet-300">
                                {t('upsellAiBadge')}
                            </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                            <div>
                                <div className="text-[10.5px] font-bold text-white">
                                    {t('upsellItemName')}
                                </div>
                                <div className="text-[8.5px] text-white/50">
                                    {t('upsellItemDesc')}
                                </div>
                            </div>

                            {/* Add Button */}
                            <motion.button
                                animate={
                                    elapsedMs > 5300 && elapsedMs < 5600
                                        ? { scale: [1, 0.9, 1] }
                                        : {}
                                }
                                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-[9.5px] font-bold transition-all shadow-xs ${
                                    isAdded
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-violet-600 hover:bg-violet-500 text-white'
                                }`}>
                                {isAdded ? (
                                    <>
                                        <Check size={10} strokeWidth={3} />
                                        <span>{t('upsellAdded')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={10} strokeWidth={3} />
                                        <span>
                                            {t('upsellAdd')} {t('upsellItemPrice')}
                                        </span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Total and Checkout Footer */}
            <div className="border-t border-white/10 pt-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                    <span>{t('upsellSubtotal')}</span>
                    <motion.span
                        key={isAdded ? 'bumped' : 'initial'}
                        initial={isAdded ? { scale: 1.2, color: '#10B981' } : {}}
                        animate={{ scale: 1 }}
                        className="text-sm font-bold text-white">
                        {isAdded ? '$30.50' : '$24.00'}
                    </motion.span>
                </div>

                <button
                    type="button"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/25">
                    <span>{t('upsellCheckout')}</span>
                    <span>•</span>
                    <span>{isAdded ? '$30.50' : '$24.00'}</span>
                </button>
            </div>
        </motion.div>
    );
}

/* ===================================================================== */
/*  Scene 4: AI Reviews Digest & Guest Sentiment                         */
/* ===================================================================== */
function ReviewsScene({ elapsedMs, t }: { elapsedMs: number; t: any }) {
    // Stage triggers (Duration: 8500ms)
    // 0 - 2.8s: Rating header (4.9 Stars) & Positive 96% sentiment pill
    // 2.8s - 5.5s: AI Summary quote & topic sentiment badges
    // 5.5s - 8.5s: Strengths list & real-time badge
    const showSummary = elapsedMs > 2200;
    const showStrengths = elapsedMs > 4800;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-[#12111F] via-[#0E0D18] to-[#0A0A0C] text-white p-3.5 pt-8.5">
            {/* Header & Rating */}
            <div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                            <Star size={12} className="fill-amber-400" />
                        </span>
                        <div>
                            <h3 className={`${display.className} text-xs font-bold text-white`}>
                                {t('reviewsTitle')}
                            </h3>
                            <div className="flex items-center gap-1 text-[8.5px] text-white/50">
                                {t('reviewsRating')}
                            </div>
                        </div>
                    </div>
                    <span className="rounded-full bg-violet-500/15 px-1.5 py-0.2 text-[8px] font-bold text-violet-300">
                        {t('reviewsBadge')}
                    </span>
                </div>

                {/* Sentiment Pill Bar */}
                <div className="mt-2.5 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2">
                    <div className="flex items-center gap-1.5">
                        <TrendingUp size={13} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-300">
                            {t('reviewsSentiment')}
                        </span>
                    </div>
                    <span className="text-[8.5px] font-medium text-emerald-400/80">
                        Top 5% in Region
                    </span>
                </div>
            </div>

            {/* AI Summary Quote Card */}
            <div className="my-auto space-y-2">
                {showSummary && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 p-2.5 backdrop-blur-md">
                        <p className="text-[9.5px] leading-relaxed italic text-white/90">
                            &ldquo;{t('reviewsSummary')}&rdquo;
                        </p>

                        {/* Extracted Topic Tags */}
                        <div className="mt-2 flex flex-wrap gap-1">
                            <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium text-emerald-300">
                                {t('reviewsTopic1')}
                            </span>
                            <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium text-emerald-300">
                                {t('reviewsTopic2')}
                            </span>
                            <span className="rounded-md border border-violet-500/25 bg-violet-500/10 px-1.5 py-0.5 text-[8px] font-medium text-violet-300">
                                {t('reviewsTopic3')}
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* Key Strengths */}
                {showStrengths && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="rounded-xl border border-white/5 bg-white/[0.03] p-2 space-y-1">
                        <div className="flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-wider text-amber-300">
                            <ThumbsUp size={10} />
                            Key Guest Highlights
                        </div>
                        <div className="text-[8.5px] text-white/70">• {t('reviewsStrength1')}</div>
                        <div className="text-[8.5px] text-white/70">• {t('reviewsStrength2')}</div>
                    </motion.div>
                )}
            </div>

            {/* Footer Live Badge */}
            <div className="rounded-xl border border-white/5 bg-black/40 p-2 text-center text-[8.5px] text-white/40">
                <span>Auto-summarized from Google, TripAdvisor & QR Reviews</span>
            </div>
        </motion.div>
    );
}
