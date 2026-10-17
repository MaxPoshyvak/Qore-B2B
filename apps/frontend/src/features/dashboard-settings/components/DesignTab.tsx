'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    Palette,
    Sun,
    Moon,
    Sparkles,
    Smartphone,
    UtensilsCrossed,
    CalendarDays,
    Star,
    Layers,
    Type,
    Wand2,
    Loader2,
    Lock,
    ArrowRight,
    SlidersHorizontal,
    Trash2,
    Undo2,
    X,
} from 'lucide-react';
import {
    THEME_PRESETS,
    THEME_PRESET_IDS,
    type ThemeConfig,
    type ThemePresetId,
    type PublicTenantResponse,
} from '@my-app/types';
import { useThemeSettings } from '../hooks/use-theme-settings';
import { getFontFamily, getRadiusValue } from '@/features/public-venue/theme/PublicThemeInjector';

type DesignTabProps = {
    slug: string;
    initialData: PublicTenantResponse;
};

const SUGGESTED_PROMPTS = [
    { label: '🍸 Speakeasy', prompt: 'Atmospheric candlelit speakeasy with velvet emerald, brass gold accents and romantic serif typography' },
    { label: '🥐 Patisserie', prompt: 'Vintage French bakery with warm cream, soft pastel rose and elegant serif typography' },
    { label: '🍣 Cyberpunk', prompt: 'Futuristic Tokyo neon izakaya with magenta glow, electric cyan and midnight slate' },
    { label: '🌿 Nordic Cafe', prompt: 'Scandinavian botanical bistro with natural sage green, warm almond and clean organic lines' },
    { label: '🥩 Steakhouse', prompt: 'Dark brutalist craft steakhouse with charcoal black, warm ember flame accents and modern typography' },
];

const REFINE_SUGGESTIONS = [
    { label: '☁️ Softer glow', prompt: 'Make atmospheric background softer, less foggy, and more transparent' },
    { label: '🔘 Pill corners', prompt: 'Change border radius to maximum pill rounded corners' },
    { label: '🍷 Warmer amber', prompt: 'Make the color palette warmer with rich terracotta, deep amber and cream' },
    { label: '💎 High contrast', prompt: 'Add deeper obsidian contrast and a luminous champagne gold accent' },
];

export function DesignTab({ slug, initialData }: DesignTabProps) {
    const t = useTranslations('dashboard.settings.design');
    const storageKey = `qore_recent_ai_themes_${slug}`;

    const {
        theme: activeTheme,
        updateTheme,
        isUpdating,
        generateTheme,
        isGenerating,
    } = useThemeSettings(
        slug,
        initialData.activeTheme?.themeConfig as ThemeConfig | undefined,
    );

    const isPro = initialData.subscriptionPlan === 'pro' || initialData.subscriptionPlan === 'business';

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Tabs & Mobile views
    const [activeTab, setActiveTab] = useState<'presets' | 'ai'>('presets');
    const [mobileActiveView, setMobileActiveView] = useState<'editor' | 'preview'>('editor');

    // Recent AI themes history
    const [recentAiThemes, setRecentAiThemes] = useState<ThemeConfig[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            let list: ThemeConfig[] = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(list)) list = [];

            // If active theme is AI-generated, ensure it's in the history list
            if (
                initialData.activeTheme &&
                Boolean((initialData.activeTheme as any).isAiGenerated) &&
                (initialData.activeTheme as any).themeConfig
            ) {
                const cfg = (initialData.activeTheme as any).themeConfig as ThemeConfig;
                if (!list.some((item) => item.id === cfg.id || item.name === cfg.name)) {
                    list.unshift(cfg);
                }
            }
            setRecentAiThemes(list.slice(0, 4));
        } catch {
            // fallback
        }
    }, [storageKey, initialData.activeTheme]);

    function saveRecentThemes(updated: ThemeConfig[]) {
        setRecentAiThemes(updated);
        try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save themes to localStorage:', e);
        }
    }

    // Active selection
    const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
        if (activeTheme?.id) return activeTheme.id;
        return 'modern-minimal';
    });

    // Refine mode
    const [refiningTheme, setRefiningTheme] = useState<ThemeConfig | null>(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    // Mockup preview options
    const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
    const [previewScreen, setPreviewScreen] = useState<'hub' | 'menu'>('hub');
    const [savedSuccessfully, setSavedSuccessfully] = useState(false);

    // Resolving previewConfig
    const previewConfig: ThemeConfig =
        recentAiThemes.find((t) => t.id === selectedThemeId) ??
        THEME_PRESETS[selectedThemeId as ThemePresetId] ??
        activeTheme;

    const isCurrentActive = Boolean(
        activeTheme?.id === previewConfig.id ||
        (!previewConfig.isPreset && activeTheme?.name === previewConfig.name)
    );

    async function handleSave() {
        try {
            if (!previewConfig.isPreset) {
                await updateTheme({ customConfig: previewConfig });
            } else {
                await updateTheme({ presetId: previewConfig.id as ThemePresetId });
            }
            setSavedSuccessfully(true);
            setTimeout(() => setSavedSuccessfully(false), 3000);
        } catch (error) {
            console.error('Failed to update theme:', error);
        }
    }

    function handleRevert() {
        if (activeTheme?.id) {
            setSelectedThemeId(activeTheme.id);
        } else {
            setSelectedThemeId('modern-minimal');
        }
    }

    async function handleGenerateOrRefine(promptToUse?: string) {
        const text = (promptToUse ?? aiPrompt).trim();
        if (!text) return;
        setAiError(null);
        try {
            const isRefining = Boolean(refiningTheme);
            const res = await generateTheme({
                prompt: text,
                venueName: initialData.name,
                venueType: (initialData.settings as any)?.cuisineType,
                currentTheme: refiningTheme ?? undefined,
                mode: isRefining ? 'refine' : 'create',
            });

            // Update recent themes history
            const newTheme = res.themeConfig;
            const updated = [newTheme, ...recentAiThemes.filter((t) => t.id !== newTheme.id && t.name !== newTheme.name)].slice(0, 4);
            saveRecentThemes(updated);

            setSelectedThemeId(newTheme.id);
            setAiExplanation(res.explanation ?? null);
            setRefiningTheme(null);
            setAiPrompt('');
        } catch (err: any) {
            setAiError(err?.message || 'Failed to generate theme. Please try again.');
        }
    }

    function handleDeleteRecentTheme(themeId: string, e: React.MouseEvent) {
        e.stopPropagation();
        const updated = recentAiThemes.filter((t) => t.id !== themeId);
        saveRecentThemes(updated);
        if (selectedThemeId === themeId) {
            setSelectedThemeId(activeTheme?.id ?? 'modern-minimal');
        }
    }

    function startRefining(theme: ThemeConfig, e?: React.MouseEvent) {
        e?.stopPropagation();
        setRefiningTheme(theme);
        setAiPrompt('');
        setActiveTab('ai');
    }

    const currentPalette = previewMode === 'light' ? previewConfig.light : previewConfig.dark;
    const previewRadius = getRadiusValue(previewConfig.radius);
    const headingFont = getFontFamily(previewConfig.fontHeading);
    const bodyFont = getFontFamily(previewConfig.fontBody);

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header intro */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]">
                            {t('title')}
                        </h2>
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                            {t('badge')}
                        </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-[#6B6A65] dark:text-[#94938D]">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Mobile View Switcher (Editor vs Live Preview) */}
                <div className="flex lg:hidden rounded-2xl border border-black/10 bg-black/5 p-1 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
                    <button
                        type="button"
                        onClick={() => setMobileActiveView('editor')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 transition-all ${
                            mobileActiveView === 'editor'
                                ? 'bg-white text-[#0A0A0C] shadow-sm dark:bg-[#1C1C1E] dark:text-[#F5F4F2]'
                                : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-white'
                        }`}>
                        <SlidersHorizontal size={14} />
                        <span>{t('mobileTabEditor')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileActiveView('preview')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 transition-all ${
                            mobileActiveView === 'preview'
                                ? 'bg-white text-[#0A0A0C] shadow-sm dark:bg-[#1C1C1E] dark:text-[#F5F4F2]'
                                : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-white'
                        }`}>
                        <Smartphone size={14} />
                        <span className="truncate">{t('mobileTabPreview')}</span>
                        <span
                            style={{ backgroundColor: currentPalette.primary }}
                            className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                        />
                    </button>
                </div>
            </div>

            {/* Split layout: Presets Grid on the Left, Interactive Phone Mockup on the Right */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Left column: AI Generator & Presets (7 cols) */}
                <div
                    className={`space-y-6 lg:col-span-7 ${
                        mobileActiveView === 'preview' ? 'hidden lg:block' : 'block'
                    }`}>
                    {/* Sub-tabs: Curated Presets vs AI Theme Studio */}
                    <div className="flex rounded-2xl border border-black/10 bg-black/5 p-1 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
                        <button
                            type="button"
                            onClick={() => setActiveTab('presets')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 transition-all ${
                                activeTab === 'presets'
                                    ? 'bg-white text-[#0A0A0C] shadow-sm dark:bg-[#1C1C1E] dark:text-[#F5F4F2]'
                                    : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-white'
                            }`}>
                            <Palette size={14} />
                            <span>{t('tabPresets')} (5)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('ai')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 transition-all ${
                                activeTab === 'ai'
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                                    : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-white'
                            }`}>
                            <Sparkles size={14} />
                            <span>{t('tabAiStudio')}</span>
                            {recentAiThemes.length > 0 && (
                                <span
                                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                                        activeTab === 'ai'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
                                    }`}>
                                    {recentAiThemes.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* AI STUDIO VIEW */}
                    {activeTab === 'ai' && (
                        <div className="space-y-6">
                            {/* AI Prompt Architect Box */}
                            <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.05] via-indigo-500/[0.02] to-transparent p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
                                            <Sparkles size={18} className="shrink-0" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                    {t('aiHeading')}
                                                </h3>
                                                <span className="rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs">
                                                    {t('aiBadge')}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-[#6B6A65] dark:text-[#94938D]">
                                                {t('aiSubtitle')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {!isPro ? (
                                    <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 sm:flex-row">
                                        <div className="flex items-center gap-2.5 text-xs text-[#6B6A65] dark:text-[#94938D]">
                                            <Lock size={15} className="text-violet-500 shrink-0" />
                                            <span>{t('aiUpgradePrompt')}</span>
                                        </div>
                                        <Link
                                            href={`/dashboard/${slug}/settings?section=billing`}
                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/20 transition-all hover:opacity-95">
                                            <span>{t('aiUpgradeBtn')}</span>
                                            <ArrowRight size={13} className="shrink-0" />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <textarea
                                                rows={2}
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                placeholder={t('aiPlaceholder')}
                                                className="w-full min-h-[68px] resize-none overflow-hidden rounded-2xl border border-black/10 bg-white/80 p-3 text-xs leading-relaxed text-[#0A0A0C] placeholder-[#6B6A65]/70 outline-none backdrop-blur-md transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-black/40 dark:text-[#F5F4F2] dark:placeholder-[#94938D]/70"
                                            />
                                        </div>

                                        {/* Suggested prompt pills - 1 clean horizontal scroll row on mobile */}
                                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                                Idea:
                                            </span>
                                            {SUGGESTED_PROMPTS.map((item) => (
                                                <button
                                                    key={item.label}
                                                    type="button"
                                                    onClick={() => {
                                                        setAiPrompt(item.prompt);
                                                        void handleGenerateOrRefine(item.prompt);
                                                    }}
                                                    disabled={isGenerating}
                                                    className="shrink-0 whitespace-nowrap rounded-full border border-black/5 bg-white/70 px-2.5 py-1 text-[10px] font-medium text-[#6B6A65] transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-600 dark:border-white/5 dark:bg-white/5 dark:text-[#94938D] dark:hover:border-violet-400/40 dark:hover:text-violet-400">
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>

                                        {aiError && (
                                            <p className="text-xs text-rose-500 font-medium">
                                                {aiError}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-end pt-1">
                                            <button
                                                type="button"
                                                onClick={() => handleGenerateOrRefine()}
                                                disabled={isGenerating || !aiPrompt.trim()}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/20 transition-all hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 size={13} className="animate-spin shrink-0" />
                                                        <span className="whitespace-nowrap">{t('aiGenerating')}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wand2 size={13} className="shrink-0" />
                                                        <span className="whitespace-nowrap">{t('aiGenerateBtn')}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {aiExplanation && (
                                            <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-2.5 text-[11px] text-[#6B6A65] dark:text-[#94938D]">
                                                <span className="font-semibold text-violet-600 dark:text-violet-400">✨ Concept Rationale: </span>
                                                {aiExplanation}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Recent AI Themes List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                        {t('recentAiThemes')} ({recentAiThemes.length}/4)
                                    </span>
                                </div>

                                {recentAiThemes.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-black/10 p-6 text-center text-xs text-[#6B6A65] dark:border-white/10 dark:text-[#94938D]">
                                        {t('noRecentAiThemes')}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {recentAiThemes.map((theme) => {
                                            const isSelected = selectedThemeId === theme.id;
                                            const isActiveInDb = activeTheme?.id === theme.id || (!activeTheme?.isPreset && activeTheme?.name === theme.name);

                                            return (
                                                <div
                                                    key={theme.id}
                                                    onClick={() => setSelectedThemeId(theme.id)}
                                                    role="button"
                                                    tabIndex={0}
                                                    className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                                                        isSelected
                                                            ? 'border-violet-500 bg-violet-500/[0.06] shadow-md shadow-violet-500/10 dark:border-violet-400 dark:bg-violet-400/[0.08]'
                                                            : 'border-violet-500/20 bg-white/60 hover:border-violet-500/40 hover:bg-white dark:border-violet-500/20 dark:bg-[#121215]/60'
                                                    }`}>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <h4 className="text-sm font-bold text-[#0A0A0C] dark:text-[#F5F4F2] truncate">
                                                                    {theme.name}
                                                                </h4>
                                                                <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[9px] font-bold text-violet-600 dark:text-violet-400">
                                                                    AI Concept
                                                                </span>
                                                                {isActiveInDb && (
                                                                    <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                        {t('current')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="mt-1 line-clamp-2 text-xs text-[#6B6A65] dark:text-[#94938D]">
                                                                {theme.description}
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                                <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-[9.5px] font-semibold text-violet-600 dark:text-violet-400">
                                                                    ✨ {theme.atmosphere}
                                                                </span>
                                                                {theme.brandStamp && (
                                                                    <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                                                                        {theme.brandStamp}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Radio indicator */}
                                                        <div
                                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                                                isSelected
                                                                    ? 'border-violet-600 bg-violet-600 text-white'
                                                                    : 'border-black/20 dark:border-white/20'
                                                            }`}>
                                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                                        </div>
                                                    </div>

                                                    {/* Footer row: Color swatches & Action buttons (Refine / Delete) */}
                                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-3 dark:border-white/5">
                                                        <div className="flex items-center gap-1.5">
                                                            <span
                                                                title={`Primary: ${theme.light.primary}`}
                                                                style={{ backgroundColor: theme.light.primary }}
                                                                className="h-5 w-5 rounded-full shadow-xs ring-1 ring-black/10"
                                                            />
                                                            <span
                                                                title={`Light BG: ${theme.light.bg}`}
                                                                style={{ backgroundColor: theme.light.bg }}
                                                                className="h-5 w-5 rounded-full shadow-xs ring-1 ring-black/15"
                                                            />
                                                            <span
                                                                title={`Dark BG: ${theme.dark.bg}`}
                                                                style={{ backgroundColor: theme.dark.bg }}
                                                                className="h-5 w-5 rounded-full shadow-xs ring-1 ring-white/15"
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => startRefining(theme, e)}
                                                                title="Tune or refine this theme with AI"
                                                                className="inline-flex items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-600 transition-colors hover:bg-violet-500/20 dark:text-violet-400">
                                                                <Wand2 size={11} className="shrink-0" />
                                                                <span className="whitespace-nowrap">{t('refineBtn')}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleDeleteRecentTheme(theme.id, e)}
                                                                title="Remove theme from history"
                                                                className="rounded-lg p-1 text-[#6B6A65] transition-colors hover:bg-rose-500/10 hover:text-rose-500 dark:text-[#94938D]">
                                                                <Trash2 size={13} className="shrink-0" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CURATED PRESETS VIEW */}
                    {activeTab === 'presets' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                    {t('presetsHeading')}
                                </span>
                                <span className="text-xs text-[#9C9B95]">
                                    {t('presetsCount', { count: THEME_PRESET_IDS.length })}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {THEME_PRESET_IDS.map((presetId) => {
                                    const preset = THEME_PRESETS[presetId];
                                    const isSelected = selectedThemeId === presetId;
                                    const isActiveInDb = activeTheme?.id === presetId && activeTheme?.isPreset !== false;

                                    return (
                                        <button
                                            key={presetId}
                                            type="button"
                                            onClick={() => setSelectedThemeId(presetId)}
                                            className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-500/[0.04] shadow-md shadow-blue-500/10 dark:border-blue-400 dark:bg-blue-400/[0.05]'
                                                    : 'border-black/10 bg-white/60 hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-[#121215]/60 dark:hover:border-white/20 dark:hover:bg-[#121215]'
                                            }`}>
                                            {/* Top Row: Name + Radio badge */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <h3 className="text-sm font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                            {preset.name}
                                                        </h3>
                                                        {isActiveInDb && (
                                                            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                {t('current')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 line-clamp-2 text-xs text-[#6B6A65] dark:text-[#94938D]">
                                                        {preset.description}
                                                    </p>
                                                    {/* Design DNA tags */}
                                                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                                        <span className="rounded-md bg-black/5 dark:bg-white/5 px-2 py-0.5 text-[9.5px] font-semibold text-[#6B6A65] dark:text-[#94938D]">
                                                            {preset.atmosphere === 'noir-gold' && '✨ Haute Noir & Gold'}
                                                            {preset.atmosphere === 'cyber-glow' && '⚡ Neon Cyberpunk'}
                                                            {preset.atmosphere === 'warm-grain' && '🍷 Tuscan Warm Grain'}
                                                            {preset.atmosphere === 'organic-soft' && '🌿 Organic Artisan'}
                                                            {preset.atmosphere === 'minimal-grid' && '💎 Precision Minimal'}
                                                        </span>
                                                        {preset.brandStamp && (
                                                            <span className="rounded-md bg-blue-500/10 dark:bg-blue-400/10 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                                                                {preset.brandStamp}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                                        isSelected
                                                            ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-black'
                                                            : 'border-black/20 dark:border-white/20'
                                                    }`}>
                                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                                </div>
                                            </div>

                                            {/* Middle: Color Swatches Preview */}
                                            <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/5">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        title={`Primary: ${preset.light.primary}`}
                                                        style={{ backgroundColor: preset.light.primary }}
                                                        className="h-5 w-5 rounded-full shadow-xs ring-1 ring-black/10 dark:ring-white/10"
                                                    />
                                                    <span
                                                        title={`Light BG: ${preset.light.bg}`}
                                                        style={{ backgroundColor: preset.light.bg }}
                                                        className="h-5 w-5 rounded-full shadow-xs ring-1 ring-black/15 dark:ring-white/15"
                                                    />
                                                    <span
                                                        title={`Dark BG: ${preset.dark.bg}`}
                                                        style={{ backgroundColor: preset.dark.bg }}
                                                        className="h-5 w-5 rounded-full shadow-xs ring-1 ring-white/15"
                                                    />
                                                    <span
                                                        title={`Dark Surface: ${preset.dark.surface}`}
                                                        style={{ backgroundColor: preset.dark.primary }}
                                                        className="h-5 w-5 rounded-full opacity-60 shadow-xs ring-1 ring-black/10"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-1 text-[10px] text-[#6B6A65] dark:text-[#94938D]">
                                                    <span className="capitalize">{preset.fontHeading}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{preset.radius}</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                </div>

                {/* Right column: Interactive Live Phone Preview Mockup (5 cols) */}
                <div
                    className={`lg:col-span-5 ${
                        mobileActiveView === 'editor' ? 'hidden lg:block' : 'block'
                    }`}>
                    <div className="sticky top-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                <Smartphone size={14} />
                                {t('livePreviewHeading')}
                            </span>

                            {/* Mode controls: Screen toggle & Theme toggle */}
                            <div className="flex items-center gap-2">
                                {/* Hub vs Menu view */}
                                <div className="flex rounded-lg border border-black/10 bg-black/5 p-0.5 text-[11px] font-semibold dark:border-white/10 dark:bg-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewScreen('hub')}
                                        className={`rounded-md px-2 py-0.5 transition-colors ${
                                            previewScreen === 'hub'
                                                ? 'bg-white text-black shadow-xs dark:bg-black dark:text-white'
                                                : 'text-[#6B6A65] hover:text-black dark:text-[#94938D] dark:hover:text-white'
                                        }`}>
                                        {t('previewHub')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewScreen('menu')}
                                        className={`rounded-md px-2 py-0.5 transition-colors ${
                                            previewScreen === 'menu'
                                                ? 'bg-white text-black shadow-xs dark:bg-black dark:text-white'
                                                : 'text-[#6B6A65] hover:text-black dark:text-[#94938D] dark:hover:text-white'
                                        }`}>
                                        {t('previewMenu')}
                                    </button>
                                </div>

                                {/* Light vs Dark toggle */}
                                <div className="flex rounded-lg border border-black/10 bg-black/5 p-0.5 text-[11px] font-semibold dark:border-white/10 dark:bg-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('light')}
                                        aria-label="Preview Light Mode"
                                        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                                            previewMode === 'light'
                                                ? 'bg-white text-amber-500 shadow-xs dark:bg-black dark:text-amber-400'
                                                : 'text-[#6B6A65] hover:text-black dark:text-[#94938D]'
                                        }`}>
                                        <Sun size={13} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('dark')}
                                        aria-label="Preview Dark Mode"
                                        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                                            previewMode === 'dark'
                                                ? 'bg-white text-indigo-500 shadow-xs dark:bg-black dark:text-indigo-400'
                                                : 'text-[#6B6A65] hover:text-black dark:text-[#94938D]'
                                        }`}>
                                        <Moon size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Phone Bezel */}
                        <div className="relative mx-auto max-w-[320px] overflow-hidden rounded-[36px] border-[6px] border-[#1C1C1E] bg-[#1C1C1E] shadow-2xl shadow-black/30">
                            {/* iPhone Dynamic Island */}
                            <div className="absolute top-2.5 inset-x-0 z-30 flex justify-center pointer-events-none">
                                <div className="h-4 w-20 rounded-full bg-black" />
                            </div>

                            {/* Simulated Screen Content with Active Theme Styles */}
                            <div
                                style={{
                                    backgroundColor: currentPalette.bg,
                                    color: currentPalette.textPrimary,
                                    fontFamily: bodyFont,
                                }}
                                className="relative flex h-[540px] flex-col overflow-y-auto hide-scrollbar px-3 pt-8 pb-6 transition-colors duration-300">
                                {/* Atmospheric simulated background */}
                                {previewConfig.atmosphere === 'minimal-grid' && (
                                    <>
                                        <div
                                            style={{
                                                background: `radial-gradient(ellipse at 50% 0%, ${currentPalette.primary}30, transparent 75%)`,
                                            }}
                                            className="pointer-events-none absolute inset-0 -z-10"
                                        />
                                        <div
                                            style={{
                                                backgroundImage: `radial-gradient(${currentPalette.primary}20 1px, transparent 1px)`,
                                                backgroundSize: '16px 16px',
                                            }}
                                            className="pointer-events-none absolute inset-0 -z-10 opacity-40"
                                        />
                                    </>
                                )}

                                {previewConfig.atmosphere === 'warm-grain' && (
                                    <>
                                        <div
                                            style={{
                                                background: `radial-gradient(circle at 50% 20%, ${currentPalette.primary}25, transparent 65%)`,
                                            }}
                                            className="pointer-events-none absolute inset-0 -z-10"
                                        />
                                        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(194,65,12,0.15),transparent_70%)]" />
                                    </>
                                )}

                                {previewConfig.atmosphere === 'noir-gold' && (
                                    <>
                                        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(212,175,55,0.22),transparent_70%)]" />
                                        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
                                    </>
                                )}

                                {previewConfig.atmosphere === 'cyber-glow' && (
                                    <>
                                        <div className="pointer-events-none absolute top-0 left-0 h-44 w-44 rounded-full bg-[#06B6D4]/25 blur-2xl -z-10" />
                                        <div className="pointer-events-none absolute top-1/3 right-0 h-44 w-44 rounded-full bg-[#EC4899]/20 blur-2xl -z-10" />
                                        <div
                                            style={{
                                                backgroundImage:
                                                    'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(34,211,238,0.06) 3px, rgba(34,211,238,0.06) 4px)',
                                            }}
                                            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
                                        />
                                    </>
                                )}

                                {previewConfig.atmosphere === 'organic-soft' && (
                                    <>
                                        <div className="pointer-events-none absolute top-4 left-6 h-36 w-36 rounded-full bg-[#0D9488]/20 blur-2xl -z-10" />
                                        <div className="pointer-events-none absolute top-1/2 right-4 h-40 w-40 rounded-full bg-[#14B8A6]/18 blur-2xl -z-10" />
                                    </>
                                )}

                                {/* Top venue avatar + status */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            style={{
                                                backgroundColor: currentPalette.primary,
                                                color: currentPalette.primaryText,
                                                borderRadius:
                                                    previewConfig.cardVariant === 'organic'
                                                        ? '40% 60% 70% 30% / 40% 50% 60% 55%'
                                                        : previewConfig.buttonVariant === 'gilded'
                                                          ? '9999px'
                                                          : previewRadius,
                                                border:
                                                    previewConfig.buttonVariant === 'gilded'
                                                        ? '2px solid rgba(212, 175, 55, 0.8)'
                                                        : previewConfig.buttonVariant === 'neon-glow'
                                                          ? '2px solid #22D3EE'
                                                          : 'none',
                                                boxShadow:
                                                    previewConfig.buttonVariant === 'neon-glow'
                                                        ? '0 0 12px rgba(6, 182, 212, 0.6)'
                                                        : 'none',
                                            }}
                                            className="flex h-8 w-8 items-center justify-center text-xs font-bold shadow-xs">
                                            {initialData.name ? initialData.name.charAt(0) : 'Q'}
                                        </div>
                                        <span className="text-[11px] font-semibold opacity-90">
                                            {initialData.name || 'Artisan Cafe'}
                                        </span>
                                    </div>
                                    <span
                                        style={{
                                            borderRadius: previewRadius,
                                            backgroundColor:
                                                previewConfig.buttonVariant === 'neon-glow'
                                                    ? 'rgba(6, 182, 212, 0.15)'
                                                    : 'rgba(16, 185, 129, 0.15)',
                                            color:
                                                previewConfig.buttonVariant === 'neon-glow'
                                                    ? '#22D3EE'
                                                    : '#10B981',
                                            border:
                                                previewConfig.buttonVariant === 'neon-glow'
                                                    ? '1px solid rgba(34, 211, 238, 0.4)'
                                                    : 'none',
                                        }}
                                        className="px-2 py-0.5 text-[9px] font-bold">
                                        {previewConfig.buttonVariant === 'neon-glow' ? 'ONLINE // LIVE' : 'Open'}
                                    </span>
                                </div>

                                {previewScreen === 'hub' ? (
                                    /* Hub Screen Preview */
                                    <div className="mt-6 space-y-4">
                                        <div className="text-center">
                                            {/* Brand Stamp Badge */}
                                            {previewConfig.brandStamp && (
                                                <div className="mb-1 text-[9px] font-bold uppercase tracking-wider">
                                                    {previewConfig.badgeVariant === 'luxury-crest' && (
                                                        <span style={{ color: currentPalette.primary }}>
                                                            ★ {previewConfig.brandStamp} ★
                                                        </span>
                                                    )}
                                                    {previewConfig.badgeVariant === 'cyber-tag' && (
                                                        <span
                                                            style={{ color: currentPalette.primary }}
                                                            className="font-mono">
                                                            [ {previewConfig.brandStamp} ]
                                                        </span>
                                                    )}
                                                    {previewConfig.badgeVariant === 'editorial-flourish' && (
                                                        <span style={{ color: currentPalette.primary }}>
                                                            ✦ {previewConfig.brandStamp} ✦
                                                        </span>
                                                    )}
                                                    {previewConfig.badgeVariant === 'organic-leaf' && (
                                                        <span style={{ color: currentPalette.primary }}>
                                                            🌿 {previewConfig.brandStamp}
                                                        </span>
                                                    )}
                                                    {previewConfig.badgeVariant === 'minimal' && (
                                                        <span style={{ color: currentPalette.primary }}>
                                                            ● {previewConfig.brandStamp}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <h4
                                                style={{ fontFamily: headingFont, color: currentPalette.textPrimary }}
                                                className="text-base font-bold">
                                                {initialData.name || 'The Artisan Kitchen'}
                                            </h4>
                                            <p
                                                style={{ color: currentPalette.textSecondary }}
                                                className="mt-0.5 text-[11px]">
                                                {initialData.settings?.description ||
                                                    'Seasonal artisanal dishes & natural wine'}
                                            </p>

                                            {/* Flourish for Tuscan */}
                                            {previewConfig.atmosphere === 'warm-grain' && (
                                                <div className="my-1.5 flex items-center justify-center gap-1.5 opacity-60">
                                                    <span
                                                        className="h-px w-8"
                                                        style={{ backgroundColor: currentPalette.primary }}
                                                    />
                                                    <span
                                                        className="text-[9px]"
                                                        style={{ color: currentPalette.primary }}>
                                                        ✦ ━━━━━ ✦
                                                    </span>
                                                    <span
                                                        className="h-px w-8"
                                                        style={{ backgroundColor: currentPalette.primary }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Primary Button: View Menu */}
                                        <div
                                            style={{
                                                borderRadius:
                                                    previewConfig.buttonVariant === 'organic-pill'
                                                        ? '9999px'
                                                        : previewRadius,
                                                backgroundColor:
                                                    previewConfig.buttonVariant === 'gilded'
                                                        ? '#121215'
                                                        : previewConfig.buttonVariant === 'warm-terracotta'
                                                          ? '#C2410C'
                                                          : currentPalette.primary,
                                                color:
                                                    previewConfig.buttonVariant === 'gilded'
                                                        ? '#F5E6B3'
                                                        : currentPalette.primaryText,
                                                border:
                                                    previewConfig.buttonVariant === 'gilded'
                                                        ? '1px solid rgba(212, 175, 55, 0.6)'
                                                        : previewConfig.buttonVariant === 'neon-glow'
                                                          ? '1px solid #22D3EE'
                                                          : 'none',
                                                boxShadow:
                                                    previewConfig.buttonVariant === 'gilded'
                                                        ? '0 6px 16px -2px rgba(212, 175, 55, 0.35)'
                                                        : previewConfig.buttonVariant === 'neon-glow'
                                                          ? '0 0 16px rgba(6, 182, 212, 0.55)'
                                                          : previewConfig.buttonVariant === 'warm-terracotta'
                                                            ? '0 6px 14px -2px rgba(194, 65, 12, 0.4)'
                                                            : '0 4px 12px rgba(0,0,0,0.1)',
                                            }}
                                            className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold ${
                                                previewConfig.buttonVariant === 'gilded'
                                                    ? 'tracking-wider uppercase font-bold text-[11px]'
                                                    : previewConfig.buttonVariant === 'neon-glow'
                                                      ? 'font-mono tracking-wider uppercase font-bold text-[11px]'
                                                      : previewConfig.buttonVariant === 'warm-terracotta'
                                                        ? 'font-serif italic font-bold'
                                                        : ''
                                            }`}>
                                            <UtensilsCrossed size={13} />
                                            <span>
                                                {previewConfig.buttonVariant === 'neon-glow'
                                                    ? '// VIEW DIGITAL MENU'
                                                    : 'View Digital Menu'}
                                            </span>
                                        </div>

                                        {/* Secondary 2 Buttons */}
                                        <div className="flex gap-2">
                                            <div
                                                style={{
                                                    backgroundColor:
                                                        previewConfig.buttonVariant === 'gilded'
                                                             ? 'rgba(18, 18, 21, 0.9)'
                                                             : previewConfig.buttonVariant === 'neon-glow'
                                                               ? 'rgba(6, 16, 30, 0.85)'
                                                               : currentPalette.surface,
                                                    borderColor:
                                                        previewConfig.buttonVariant === 'gilded'
                                                            ? 'rgba(212, 175, 55, 0.35)'
                                                            : previewConfig.buttonVariant === 'neon-glow'
                                                              ? 'rgba(6, 182, 212, 0.4)'
                                                              : currentPalette.surfaceBorder,
                                                    borderRadius:
                                                        previewConfig.buttonVariant === 'organic-pill'
                                                            ? '9999px'
                                                            : previewRadius,
                                                }}
                                                className="flex flex-1 flex-col items-center justify-center gap-1 border py-2 text-center">
                                                <CalendarDays size={13} style={{ color: currentPalette.primary }} />
                                                <span
                                                    style={{ color: currentPalette.textPrimary }}
                                                    className="text-[10px] font-medium">
                                                    Book Table
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    backgroundColor:
                                                        previewConfig.buttonVariant === 'gilded'
                                                            ? 'rgba(18, 18, 21, 0.9)'
                                                            : previewConfig.buttonVariant === 'neon-glow'
                                                              ? 'rgba(6, 16, 30, 0.85)'
                                                              : currentPalette.surface,
                                                    borderColor:
                                                        previewConfig.buttonVariant === 'gilded'
                                                            ? 'rgba(212, 175, 55, 0.35)'
                                                            : previewConfig.buttonVariant === 'neon-glow'
                                                              ? 'rgba(6, 182, 212, 0.4)'
                                                              : currentPalette.surfaceBorder,
                                                    borderRadius:
                                                        previewConfig.buttonVariant === 'organic-pill'
                                                            ? '9999px'
                                                            : previewRadius,
                                                }}
                                                className="flex flex-1 flex-col items-center justify-center gap-1 border py-2 text-center">
                                                <Star
                                                    size={13}
                                                    style={{ color: currentPalette.accent ?? currentPalette.primary }}
                                                />
                                                <span
                                                    style={{ color: currentPalette.textPrimary }}
                                                    className="text-[10px] font-medium">
                                                    Reviews (4.9)
                                                </span>
                                            </div>
                                        </div>

                                        {/* Information Section Preview */}
                                        <div
                                            style={{
                                                backgroundColor: currentPalette.surface,
                                                borderColor: currentPalette.surfaceBorder,
                                                borderRadius: previewRadius,
                                            }}
                                            className="border p-2.5 text-[10px]">
                                            <div className="flex items-center justify-between text-[#9C9B95]">
                                                <span>Working Hours</span>
                                                <span className="font-semibold text-emerald-500">Open Now</span>
                                            </div>
                                            <div
                                                style={{ color: currentPalette.textPrimary }}
                                                className="mt-1 font-medium">
                                                10:00 — 23:00 (Today)
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Menu Screen Preview */
                                    <div className="mt-3 space-y-3">
                                        {/* Category pills */}
                                        <div className="flex items-center gap-1 overflow-x-hidden pt-1">
                                            <span
                                                style={{
                                                    backgroundColor: currentPalette.primary,
                                                    color: currentPalette.primaryText,
                                                    borderRadius: `calc(${previewRadius} * 0.6)`,
                                                }}
                                                className="px-2.5 py-1 text-[10px] font-bold shadow-xs whitespace-nowrap">
                                                Starters
                                            </span>
                                            <span
                                                style={{
                                                    borderRadius: `calc(${previewRadius} * 0.6)`,
                                                    color: currentPalette.textSecondary,
                                                }}
                                                className="px-2 py-1 text-[10px] font-medium whitespace-nowrap">
                                                Mains
                                            </span>
                                            <span
                                                style={{
                                                    borderRadius: `calc(${previewRadius} * 0.6)`,
                                                    color: currentPalette.textSecondary,
                                                }}
                                                className="px-2 py-1 text-[10px] font-medium whitespace-nowrap">
                                                Desserts
                                            </span>
                                            <span
                                                style={{
                                                    borderRadius: `calc(${previewRadius} * 0.6)`,
                                                    color: currentPalette.textSecondary,
                                                }}
                                                className="px-2 py-1 text-[10px] font-medium whitespace-nowrap">
                                                Wine
                                            </span>
                                        </div>

                                        {/* Sample Dish Card 1 */}
                                        <div
                                            style={{
                                                backgroundColor: currentPalette.surface,
                                                borderColor:
                                                    previewConfig.cardVariant === 'luxury'
                                                        ? 'rgba(212, 175, 55, 0.4)'
                                                        : previewConfig.cardVariant === 'cyber'
                                                          ? 'rgba(34, 211, 238, 0.45)'
                                                          : previewConfig.cardVariant === 'editorial'
                                                            ? 'rgba(194, 65, 12, 0.35)'
                                                            : currentPalette.surfaceBorder,
                                                borderRadius:
                                                    previewConfig.cardVariant === 'organic'
                                                        ? '1.25rem'
                                                        : previewRadius,
                                                boxShadow:
                                                    previewConfig.cardVariant === 'cyber'
                                                        ? '0 0 12px rgba(6, 182, 212, 0.18)'
                                                        : previewConfig.cardVariant === 'luxury'
                                                          ? '0 4px 16px rgba(212, 175, 55, 0.12)'
                                                          : '0 1px 3px rgba(0,0,0,0.05)',
                                            }}
                                            className="overflow-hidden border shadow-sm transition-all">
                                            <div
                                                style={{
                                                    background:
                                                        previewConfig.cardVariant === 'cyber'
                                                            ? 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(236,72,153,0.15))'
                                                            : previewConfig.cardVariant === 'luxury'
                                                              ? 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(18,18,21,0.6))'
                                                              : `linear-gradient(135deg, ${currentPalette.primary}30, ${currentPalette.primary}10)`,
                                                }}
                                                className="relative flex h-20 items-center justify-center">
                                                <UtensilsCrossed size={20} style={{ color: currentPalette.primary }} />
                                                {/* Mini signature tag */}
                                                {previewConfig.cardVariant === 'luxury' && (
                                                    <span className="absolute top-1.5 left-2 rounded-full border border-amber-400/40 bg-black/60 px-1.5 py-0.5 text-[8px] font-bold text-amber-300">
                                                        ★ SIGNATURE ★
                                                    </span>
                                                )}
                                                {previewConfig.cardVariant === 'cyber' && (
                                                    <span className="absolute top-1.5 left-2 rounded-sm border border-cyan-400/60 bg-black/80 px-1.5 py-0.2 font-mono text-[8px] font-bold text-cyan-300">
                                                        [ REC:99% ]
                                                    </span>
                                                )}
                                                {previewConfig.cardVariant === 'editorial' && (
                                                    <span className="absolute top-1.5 left-2 rounded-sm bg-stone-900/60 px-1.5 py-0.5 font-serif text-[8px] italic text-[#FED7AA]">
                                                        ✦ Chef's Choice
                                                    </span>
                                                )}
                                                {previewConfig.cardVariant === 'organic' && (
                                                    <span className="absolute top-1.5 left-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-1.5 py-0.5 text-[8px] font-medium text-teal-200">
                                                        🌿 Farm Fresh
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-2.5">
                                                <div className="flex items-start justify-between">
                                                    <span
                                                        style={{
                                                            fontFamily: headingFont,
                                                            color: currentPalette.textPrimary,
                                                        }}
                                                        className="text-xs font-bold leading-tight">
                                                        Truffle Burrata
                                                    </span>
                                                    <span
                                                        style={{
                                                            color: currentPalette.primary,
                                                            fontFamily:
                                                                previewConfig.cardVariant === 'cyber'
                                                                    ? 'monospace'
                                                                    : undefined,
                                                        }}
                                                        className="text-xs font-bold">
                                                        $16.50
                                                    </span>
                                                </div>
                                                <p
                                                    style={{ color: currentPalette.textSecondary }}
                                                    className="mt-1 line-clamp-2 text-[9.5px]">
                                                    Heirloom tomatoes, balsamic pearls, aged olive oil, and toasted sourdough.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Sample Dish Card 2 */}
                                        <div
                                            style={{
                                                backgroundColor: currentPalette.surface,
                                                borderColor:
                                                    previewConfig.cardVariant === 'luxury'
                                                        ? 'rgba(212, 175, 55, 0.4)'
                                                        : previewConfig.cardVariant === 'cyber'
                                                          ? 'rgba(34, 211, 238, 0.45)'
                                                          : previewConfig.cardVariant === 'editorial'
                                                            ? 'rgba(194, 65, 12, 0.35)'
                                                            : currentPalette.surfaceBorder,
                                                borderRadius:
                                                    previewConfig.cardVariant === 'organic'
                                                        ? '1.25rem'
                                                        : previewRadius,
                                                boxShadow:
                                                    previewConfig.cardVariant === 'cyber'
                                                        ? '0 0 12px rgba(6, 182, 212, 0.18)'
                                                        : previewConfig.cardVariant === 'luxury'
                                                          ? '0 4px 16px rgba(212, 175, 55, 0.12)'
                                                          : '0 1px 3px rgba(0,0,0,0.05)',
                                            }}
                                            className="overflow-hidden border shadow-sm transition-all">
                                            <div className="p-2.5">
                                                <div className="flex items-start justify-between">
                                                    <span
                                                        style={{
                                                            fontFamily: headingFont,
                                                            color: currentPalette.textPrimary,
                                                        }}
                                                        className="text-xs font-bold leading-tight">
                                                        Handmade Pappardelle
                                                    </span>
                                                    <span
                                                        style={{
                                                            color: currentPalette.primary,
                                                            fontFamily:
                                                                previewConfig.cardVariant === 'cyber'
                                                                    ? 'monospace'
                                                                    : undefined,
                                                        }}
                                                        className="text-xs font-bold">
                                                        $24.00
                                                    </span>
                                                </div>
                                                <p
                                                    style={{ color: currentPalette.textSecondary }}
                                                    className="mt-1 line-clamp-1 text-[9.5px]">
                                                    Slow-braised wild boar ragù, parmigiano reggiano.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Simulated Floating Cart Pill */}
                                        <div
                                            style={{
                                                backgroundColor:
                                                    previewConfig.buttonVariant === 'gilded'
                                                        ? '#121215'
                                                        : previewConfig.buttonVariant === 'warm-terracotta'
                                                          ? '#C2410C'
                                                          : currentPalette.primary,
                                                color:
                                                    previewConfig.buttonVariant === 'gilded'
                                                        ? '#F5E6B3'
                                                        : currentPalette.primaryText,
                                                border:
                                                    previewConfig.buttonVariant === 'gilded'
                                                        ? '1px solid rgba(212, 175, 55, 0.5)'
                                                        : previewConfig.buttonVariant === 'neon-glow'
                                                          ? '1px solid #22D3EE'
                                                          : 'none',
                                                borderRadius:
                                                    previewConfig.buttonVariant === 'organic-pill'
                                                        ? '9999px'
                                                        : `calc(${previewRadius} * 0.8)`,
                                                boxShadow:
                                                    previewConfig.buttonVariant === 'neon-glow'
                                                        ? '0 0 16px rgba(6, 182, 212, 0.5)'
                                                        : '0 4px 12px rgba(0,0,0,0.15)',
                                            }}
                                            className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold shadow-md">
                                            <span>2 items in cart</span>
                                            <span>$40.50</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preset summary specs */}
                        <div className="rounded-xl border border-black/5 bg-black/[0.02] p-2.5 text-center text-[11px] text-[#6B6A65] dark:border-white/5 dark:bg-white/[0.02] dark:text-[#94938D]">
                            <div className="flex items-center justify-center gap-3">
                                <span className="flex items-center gap-1">
                                    <Type size={12} />
                                    <span className="font-semibold">{previewConfig.name}</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Layers size={12} />
                                    <span>{previewConfig.radius} radius</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Portaled Overlays (Refine Modal & Floating Action Bar) attached directly to document.body so they stay truly FIXED to the viewport regardless of parent backdrop-filter or scroll */}
            {mounted &&
                createPortal(
                    <>
                        {/* Refine Theme Modal Dialog */}
                        <AnimatePresence>
                            {refiningTheme && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                                    onClick={() => setRefiningTheme(null)}>
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0, y: 15 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.95, opacity: 0, y: 15 }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-violet-500/20 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#141418] sm:p-6">
                                        {/* Modal Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
                                                    <Wand2 size={18} className="shrink-0" />
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-base font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                            {t('refineModalTitle')}
                                                        </h3>
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-bold text-violet-600 dark:text-violet-400">
                                                            <span
                                                                style={{ backgroundColor: refiningTheme.light.primary }}
                                                                className="h-2 w-2 rounded-full shrink-0 shadow-xs"
                                                            />
                                                            {refiningTheme.name}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 text-xs text-[#6B6A65] dark:text-[#94938D]">
                                                        {t('refineModalSubtitle')}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setRefiningTheme(null)}
                                                className="rounded-xl p-1.5 text-[#6B6A65] transition-colors hover:bg-rose-500/10 hover:text-rose-500 dark:text-[#94938D]">
                                                <X size={16} className="shrink-0" />
                                            </button>
                                        </div>

                                        {/* Form */}
                                        <div className="mt-4 space-y-3">
                                            <textarea
                                                autoFocus
                                                rows={2}
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                placeholder={t('refinePlaceholder')}
                                                className="w-full min-h-[72px] resize-none overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02] p-3 text-xs leading-relaxed text-[#0A0A0C] placeholder-[#6B6A65]/70 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-[#F5F4F2] dark:placeholder-[#94938D]/70 dark:focus:bg-black/40"
                                            />

                                            {/* Suggested Quick Adjustments */}
                                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                                    Quick:
                                                </span>
                                                {REFINE_SUGGESTIONS.map((item) => (
                                                    <button
                                                        key={item.label}
                                                        type="button"
                                                        onClick={() => {
                                                            setAiPrompt(item.prompt);
                                                            void handleGenerateOrRefine(item.prompt);
                                                        }}
                                                        disabled={isGenerating}
                                                        className="shrink-0 whitespace-nowrap rounded-full border border-black/5 bg-black/[0.03] px-2.5 py-1 text-[10px] font-medium text-[#6B6A65] transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-600 dark:border-white/5 dark:bg-white/5 dark:text-[#94938D] dark:hover:border-violet-400/40 dark:hover:text-violet-400">
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {aiError && (
                                                <p className="text-xs font-medium text-rose-500">
                                                    {aiError}
                                                </p>
                                            )}

                                            {/* Modal Footer */}
                                            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                                                <button
                                                    type="button"
                                                    onClick={() => setRefiningTheme(null)}
                                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-500/10">
                                                    {t('cancel')}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleGenerateOrRefine()}
                                                    disabled={isGenerating || !aiPrompt.trim()}
                                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/20 transition-all hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                                                    {isGenerating ? (
                                                        <>
                                                            <Loader2 size={13} className="animate-spin shrink-0" />
                                                            <span className="whitespace-nowrap">{t('refiningTheme')}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Wand2 size={13} className="shrink-0" />
                                                            <span className="whitespace-nowrap">{t('refineThemeBtn')}</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Persistent Animated Floating Bottom Action Bar for Easy Theme Applying */}
                        <AnimatePresence>
                            {!isCurrentActive && (
                                <motion.div
                                    initial={{ y: 80, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 80, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    className="fixed bottom-6 inset-x-4 z-50 mx-auto max-w-xl pointer-events-auto">
                                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/95 p-3.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#141418]/95 sm:px-5">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span
                                                style={{ backgroundColor: currentPalette.primary }}
                                                className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/10"
                                            />
                                            <div className="min-w-0">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                                    {t('floatingPreviewing')}:
                                                </span>
                                                <p className="truncate text-xs font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                    {previewConfig.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={handleRevert}
                                                className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-[#6B6A65] transition-colors hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-white">
                                                <Undo2 size={13} className="shrink-0" />
                                                <span className="hidden sm:inline">{t('floatingRevert')}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSave}
                                                disabled={isUpdating}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                                                {isUpdating ? (
                                                    <Loader2 size={13} className="animate-spin shrink-0" />
                                                ) : (
                                                    <Check size={13} strokeWidth={2.5} className="shrink-0" />
                                                )}
                                                <span className="whitespace-nowrap">
                                                    {isUpdating ? t('saving') : t('floatingApply')}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>,
                    document.body,
                )}
        </div>
    );
}
