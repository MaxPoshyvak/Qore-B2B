'use client';

import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import {
    Sparkles,
    X,
    Send,
    RotateCcw,
    UtensilsCrossed,
    Plus,
    Check,
    SlidersHorizontal,
    Bot,
} from 'lucide-react';
import type {
    CartSessionResponse,
    MenuItemResponse,
    PublicMenuResponseDTO,
    AiWaiterRecommendedDish,
} from '@my-app/types';

import { body, display, mono } from '@/shared/lib/fonts';
import { cn, formatPrice, sanitizeImageUrl } from '@/shared/lib/utils';
import { EASE } from '@/shared/config/animations';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';
import { useTableSessionStore } from '@/shared/store/useTableSessionStore';
import { useCartStore } from '../store/useCartStore';
import { useAddCartItem } from '../hooks/useSharedCart';
import { useAiWaiterChat } from '../hooks/useAiWaiterChat';
import { pickBestDiscount, type ActiveHappyHourRule } from '../hooks/usePublicHappyHour';

interface AiWaiterModalProps {
    isOpen: boolean;
    onClose: () => void;
    venueSlug: string;
    subscriptionPlan?: 'free' | 'pro' | 'business';
    tableId: string | null;
    takeawaySessionId: string | null;
    cart?: CartSessionResponse;
    categories?: PublicMenuResponseDTO['categories'];
    activeHappyHourRules?: ActiveHappyHourRule[];
}

export function AiWaiterModal({
    isOpen,
    onClose,
    venueSlug,
    subscriptionPlan = 'free',
    tableId,
    takeawaySessionId,
    cart,
    categories = [],
    activeHappyHourRules = [],
}: AiWaiterModalProps) {
    const t = useTranslations('publicMenu.aiWaiter');
    const locale = useLocale();
    const isDesktop = useIsDesktop();

    const [input, setInput] = useState('');
    const [addedDishIds, setAddedDishIds] = useState<Set<string>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const guestName = useCartStore((s) => s.guestName);
    const currency = useCartStore((s) => s.currency);
    const setPendingCartItem = useCartStore((s) => s.setPendingCartItem);
    const setNameModalOpen = useCartStore((s) => s.setNameModalOpen);
    const setOrderTypeModalOpen = useCartStore((s) => s.setOrderTypeModalOpen);
    const setSelectedDish = useCartStore((s) => s.setSelectedDish);
    const guestSessionId = useTableSessionStore((s) => s.guestSessionId);

    const addItem = useAddCartItem(tableId, takeawaySessionId);

    const isDemo = venueSlug === 'admin-cafe' || venueSlug.startsWith('demo-');
    const isPro = subscriptionPlan === 'pro' || subscriptionPlan === 'business' || isDemo;

    // Cart items currently present
    const cartItemIds = useMemo(
        () => cart?.items.map((i) => i.menuItemId) ?? [],
        [cart?.items],
    );

    const { messages, isPending, sendMessage, resetChat } = useAiWaiterChat({
        venueSlug,
        language: locale,
        cartItemIds,
    });

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isPending, isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && isPro) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isPro]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isPending) return;
        setInput('');
        await sendMessage(trimmed);
    };

    const handlePromptClick = async (promptText: string) => {
        if (isPending) return;
        await sendMessage(promptText);
    };

    const handleAddDish = (dish: AiWaiterRecommendedDish) => {
        // Look up full item with all modifiers from client categories if present
        const menuItem = categories?.flatMap((c) => c.items).find((i) => i.id === dish.item.id) ?? dish.item;

        // If dish has required modifiers, open configuration modal
        if (dish.hasRequiredModifiers || menuItem.modifiers?.some((m) => m.minSelections > 0)) {
            setSelectedDish(menuItem);
            // On mobile, close AI modal so dish options modal gets full focus
            if (!isDesktop) {
                onClose();
            }
            return;
        }

        // Direct add flow
        const pending = {
            menuItemId: menuItem.id,
            quantity: 1,
            selectedOptionIds: [],
        };

        if (!tableId && !takeawaySessionId) {
            setPendingCartItem(pending);
            setOrderTypeModalOpen(true);
            onClose();
            return;
        }

        if (!guestName || !guestSessionId) {
            setPendingCartItem(pending);
            setNameModalOpen(true);
            onClose();
            return;
        }

        addItem.mutate({
            menuItemId: menuItem.id,
            quantity: 1,
            guestSessionId,
            guestName,
            selectedOptionIds: [],
        });

        // Trigger added animation state
        setAddedDishIds((prev) => new Set(prev).add(menuItem.id));
        setTimeout(() => {
            setAddedDishIds((prev) => {
                const next = new Set(prev);
                next.delete(menuItem.id);
                return next;
            });
        }, 2200);
    };

    const quickPrompts = [
        t('suggestedPrompt1'),
        t('suggestedPrompt2'),
        t('suggestedPrompt3'),
        t('suggestedPrompt4'),
    ];

    const panelMotion = isDesktop
        ? {
              initial: { opacity: 0, scale: 0.95, y: 16 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.95, y: 16 },
          }
        : {
              initial: { y: '100%' },
              animate: { y: 0 },
              exit: { y: '100%' },
          };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Chat Container: Bottom sheet on mobile, floating widget on desktop */}
                    <motion.div
                        {...panelMotion}
                        transition={{ duration: 0.35, ease: EASE }}
                        className={cn(
                            'fixed z-50 flex flex-col overflow-hidden bg-white/95 backdrop-blur-2xl dark:bg-[#141417]/95 border border-black/10 dark:border-white/10 shadow-2xl',
                            isDesktop
                                ? 'bottom-6 right-6 w-[420px] h-[600px] rounded-3xl'
                                : 'inset-x-0 bottom-0 h-[85vh] max-h-[720px] rounded-t-[28px]',
                        )}>
                        {/* Mobile drag handle */}
                        {!isDesktop && (
                            <div className="flex justify-center pt-2.5 pb-1">
                                <div className="h-1 w-12 rounded-full bg-black/20 dark:bg-white/20" />
                            </div>
                        )}

                        {/* Header */}
                        <div className="relative flex items-center justify-between border-b border-black/5 px-5 py-3.5 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-violet-500/25">
                                    <Sparkles className="h-5 w-5 text-amber-200" />
                                </div>
                                <div className="leading-tight">
                                    <div className="flex items-center gap-1.5">
                                        <h2
                                            className={`${display.className} text-base font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                            {t('title')}
                                        </h2>
                                        <span
                                            className={`${mono.className} rounded-full bg-violet-600/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-600 dark:bg-violet-400/20 dark:text-violet-300`}>
                                            {t('proBadge')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#6B6A65] dark:text-[#94938D]">
                                        {t('subtitle')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {messages.length > 0 && isPro && (
                                    <button
                                        type="button"
                                        onClick={resetChat}
                                        title={t('clearChat')}
                                        className="flex h-8 w-8 items-center justify-center rounded-xl text-[#6B6A65] transition-colors hover:bg-black/5 dark:text-[#94938D] dark:hover:bg-white/5">
                                        <RotateCcw className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl text-[#6B6A65] transition-colors hover:bg-black/5 dark:text-[#94938D] dark:hover:bg-white/5">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Free Tier Teaser */}
                        {!isPro ? (
                            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-600/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400">
                                    <Bot className="h-8 w-8" />
                                </div>
                                <h3
                                    className={`${display.className} text-lg font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                    {t('proTeaserTitle')}
                                </h3>
                                <p className="mt-2 max-w-xs text-sm text-[#6B6A65] dark:text-[#94938D]">
                                    {t('proTeaserDesc')}
                                </p>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-opacity [@media(hover:hover)]:hover:opacity-95">
                                    {t('proTeaserClose')}
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Chat Messages Body */}
                                <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 space-y-4 max-w-full">
                                    {/* Empty State / Welcome Greeting */}
                                    {messages.length === 0 && (
                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-start gap-2.5 min-w-0">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/15 text-violet-600 dark:bg-violet-400/20 dark:text-violet-300">
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-black/5 bg-black/[0.03] p-3.5 text-sm leading-relaxed text-[#0A0A0C] dark:border-white/5 dark:bg-white/[0.05] dark:text-[#F5F4F2] break-words [overflow-wrap:anywhere]">
                                                    {t('emptyGreeting')}
                                                </div>
                                            </div>

                                            {/* Starter Quick Prompt Chips */}
                                            <div className="pt-2">
                                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]">
                                                    {t('suggestedQuestionsTitle')}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {quickPrompts.map((promptText, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            disabled={isPending}
                                                            onClick={() => handlePromptClick(promptText)}
                                                            className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-[#0A0A0C] shadow-sm backdrop-blur transition-all active:scale-95 dark:border-white/10 dark:bg-[#1E1E22] dark:text-[#F5F4F2] [@media(hover:hover)]:hover:border-violet-500/40 [@media(hover:hover)]:hover:text-violet-600 dark:[@media(hover:hover)]:hover:text-violet-400">
                                                            {promptText}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Active Messages List */}
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                'flex flex-col min-w-0',
                                                msg.role === 'user' ? 'items-end' : 'items-start',
                                            )}>
                                            {msg.role === 'user' ? (
                                                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm text-white shadow-sm break-words [overflow-wrap:anywhere]">
                                                    {msg.content}
                                                </div>
                                            ) : (
                                                <div className="flex w-full min-w-0 items-start gap-2.5">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/15 text-violet-600 dark:bg-violet-400/20 dark:text-violet-300">
                                                        <Sparkles className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1 space-y-2.5">
                                                        <div className="rounded-2xl rounded-tl-sm border border-black/5 bg-black/[0.03] p-3.5 text-sm leading-relaxed text-[#0A0A0C] dark:border-white/5 dark:bg-white/[0.05] dark:text-[#F5F4F2] break-words [overflow-wrap:anywhere]">
                                                            {msg.content}
                                                        </div>

                                                        {/* Recommended Dish Cards inside Chat */}
                                                        {msg.recommendedDishes && msg.recommendedDishes.length > 0 && (
                                                            <div className="space-y-2 pt-1 w-full min-w-0">
                                                                {msg.recommendedDishes.map((dish) => {
                                                                    const menuItem = dish.item;
                                                                    const discount = pickBestDiscount(menuItem, activeHappyHourRules);
                                                                    const displayPrice = discount ? discount.finalPrice : menuItem.price;
                                                                    const isAdded = addedDishIds.has(menuItem.id);

                                                                    return (
                                                                        <div
                                                                            key={menuItem.id}
                                                                            className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white/80 p-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#1E1E22]/90 w-full min-w-0">
                                                                            <div className="flex items-start gap-2.5 min-w-0">
                                                                                {/* Dish thumbnail */}
                                                                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
                                                                                    {sanitizeImageUrl(menuItem.imageUrl) ? (
                                                                                        <Image
                                                                                            src={sanitizeImageUrl(menuItem.imageUrl)!}
                                                                                            alt={menuItem.name}
                                                                                            fill
                                                                                            className="object-cover"
                                                                                            sizes="48px"
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="flex h-full w-full items-center justify-center text-[#6B6A65] dark:text-[#94938D]">
                                                                                            <UtensilsCrossed className="h-4.5 w-4.5" />
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                {/* Dish title & Price */}
                                                                                <div className="min-w-0 flex-1">
                                                                                    <div className="flex items-start justify-between gap-2">
                                                                                        <h4 className="text-xs font-bold text-[#0A0A0C] dark:text-[#F5F4F2] break-words leading-tight">
                                                                                            {menuItem.name}
                                                                                        </h4>
                                                                                        <div className="shrink-0 text-right">
                                                                                            <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                                                                                                {formatPrice(displayPrice, currency)}
                                                                                            </span>
                                                                                            {discount && (
                                                                                                <span className="ml-1 text-[10px] text-[#6B6A65] line-through dark:text-[#94938D]">
                                                                                                    {formatPrice(menuItem.price, currency)}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                    {menuItem.description && (
                                                                                        <p className="mt-1 text-[11px] leading-relaxed text-[#6B6A65] dark:text-[#94938D] break-words [overflow-wrap:anywhere]">
                                                                                            {menuItem.description}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Action Button: Direct Add or Customize Options */}
                                                                            <div className="flex items-center justify-end pt-1 border-t border-black/5 dark:border-white/5">
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={isAdded}
                                                                                    onClick={() => handleAddDish(dish)}
                                                                                    className={cn(
                                                                                        'inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95 w-full sm:w-auto',
                                                                                        isAdded
                                                                                            ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                                                                                            : 'bg-violet-600 text-white shadow-violet-500/20 [@media(hover:hover)]:hover:bg-violet-700',
                                                                                    )}>
                                                                                    {isAdded ? (
                                                                                        <>
                                                                                            <Check className="h-3.5 w-3.5" />
                                                                                            <span>{t('addedToCart')}</span>
                                                                                        </>
                                                                                    ) : dish.hasRequiredModifiers ? (
                                                                                        <>
                                                                                            <SlidersHorizontal className="h-3.5 w-3.5" />
                                                                                            <span>{t('chooseOptions')}</span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <Plus className="h-3.5 w-3.5" />
                                                                                            <span>{t('addToCart')}</span>
                                                                                        </>
                                                                                    )}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Thinking / Streaming Indicator */}
                                    {isPending && (
                                        <div className="flex items-start gap-2.5">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600/15 text-violet-600 dark:bg-violet-400/20 dark:text-violet-300">
                                                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                                            </div>
                                            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-black/5 bg-black/[0.03] px-4 py-3 text-xs text-[#6B6A65] dark:border-white/5 dark:bg-white/[0.05] dark:text-[#94938D]">
                                                <span className="flex gap-1">
                                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-600 [animation-delay:-0.3s]" />
                                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-600 [animation-delay:-0.15s]" />
                                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-600" />
                                                </span>
                                                <span>{t('thinking')}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Footer */}
                                <div className="border-t border-black/5 p-3 sm:p-4 dark:border-white/5">
                                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder={t('inputPlaceholder')}
                                            disabled={isPending}
                                            className={`${body.className} flex-1 rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm text-[#0A0A0C] placeholder:text-[#6B6A65] focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.05] dark:text-[#F5F4F2] dark:placeholder:text-[#94938D]`}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || isPending}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 transition-all disabled:opacity-40 active:scale-95 [@media(hover:hover)]:hover:opacity-90"
                                            aria-label={t('send')}>
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </form>
                                    <p className="mt-2 text-center text-[10px] text-[#6B6A65] dark:text-[#94938D]">
                                        {t('disclaimer')}
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
