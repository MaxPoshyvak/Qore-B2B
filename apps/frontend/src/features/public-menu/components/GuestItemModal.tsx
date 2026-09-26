'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Check, Minus, Plus, UtensilsCrossed, X } from 'lucide-react';
import type { MenuItemResponse, ModifierGroupResponse, ModifierOptionResponse } from '@my-app/types';

import { EASE } from '@/shared/config/animations';
import { body, display } from '@/shared/lib/fonts';
import { toStringArray } from '@/shared/lib/menu-attributes';
import { cn, formatPrice } from '@/shared/lib/utils';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';
import { useCartStore } from '../store/useCartStore';
import { useTableSessionStore } from '@/shared/store/useTableSessionStore';
import { useAddConfiguredCartItem } from '../hooks/useSharedCart';
import { pickBestDiscountForSubtotal, type ActiveHappyHourRule } from '../hooks/usePublicHappyHour';

type GuestItemModalProps = {
    /** Страва до кастомізації; `null` тримає модалку закритою. */
    item: MenuItemResponse | null;
    tableId: string | null;
    takeawaySessionId: string | null;
    onClose: () => void;
    /**
     * Активні правила Happy Hour.
     *
     * Свідомо передаємо ПРАВИЛА, а не готову знижену ціну: знижку треба
     * порахувати від повної конфігурації (база + модифікатори), а модалка
     * єдина знає, що саме гість обрав.
     */
    activeHappyHourRules?: ActiveHappyHourRule[];
};

/** Мапа `groupId -> обрані optionId`. */
type SelectionMap = Record<string, string[]>;

/**
 * Витягує суму надбавок обраних опцій.
 * `priceAdjustment` приходить рядком (Prisma `Decimal`), тож парсимо і
 * страхуємось від NaN, щоб один битий рядок не зламав усю суму.
 */
function sumAdjustments(options: ModifierOptionResponse[]): number {
    return options.reduce((total, option) => {
        const value = Number.parseFloat(option.priceAdjustment);
        return total + (Number.isFinite(value) ? value : 0);
    }, 0);
}

/**
 * Модалка кастомізації страви для гостя.
 *
 * Мобільний — bottom sheet (виїзд знизу), десктоп — центрована скляна панель.
 * Герой-зображення та футер зафіксовані, а список модифікаторів прокручується
 * окремо (`flex-1 min-h-0 overflow-y-auto`).
 */
export function GuestItemModal({
    item,
    tableId,
    takeawaySessionId,
    onClose,
    activeHappyHourRules = [],
}: GuestItemModalProps) {
    const isDesktop = useIsDesktop();
    const guestName = useCartStore((s) => s.guestName);
    const setPendingCartItem = useCartStore((s) => s.setPendingCartItem);
    const setOrderTypeModalOpen = useCartStore((s) => s.setOrderTypeModalOpen);
    const setNameModalOpen = useCartStore((s) => s.setNameModalOpen);
    const guestSessionId = useTableSessionStore((s) => s.guestSessionId);
    const { addConfigured } = useAddConfiguredCartItem(tableId, takeawaySessionId);

    const [quantity, setQuantity] = useState(1);
    const [selection, setSelection] = useState<SelectionMap>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const open = !!item;
    const groups: ModifierGroupResponse[] = item?.modifiers ?? [];

    /*
     * Скидаємо конфігурацію на кожне відкриття: інакше гість, який щойно
     * зібрав капучино, побачив би ті самі галочки на наступній страві.
     * Обов'язкові радіо-групи (min>0, max===1) одразу отримують перший варіант,
     * щоб кнопка не була заблокованою без візуальної причини.
     */
    useEffect(() => {
        if (!item) return;

        const preset: SelectionMap = {};
        for (const group of item.modifiers ?? []) {
            const isRequiredRadio = group.minSelections > 0 && group.maxSelections === 1;
            preset[group.id] = isRequiredRadio && group.options[0] ? [group.options[0].id] : [];
        }

        setSelection(preset);
        setQuantity(1);
    }, [item]);

    // Блокування скролу фону + закриття по Escape.
    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose();
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    const allergens = toStringArray(item?.allergens);
    const tags = toStringArray(item?.tags);

    // Плоский список обраних опцій — потрібен і для математики, і для payload.
    const selectedOptions = useMemo(() => {
        const picked: ModifierOptionResponse[] = [];
        for (const group of groups) {
            const ids = selection[group.id] ?? [];
            for (const option of group.options) {
                if (ids.includes(option.id)) picked.push(option);
            }
        }
        return picked;
    }, [groups, selection]);

    /*
     * Математика ціни — та сама формула, що й на сервері:
     *   subtotal  = базова ціна + Σ надбавок обраних опцій
     *   unitPrice = subtotal − знижка Happy Hour (від SUBTOTAL, не від бази!)
     *   total     = unitPrice × quantity
     */
    const rawBase = Number(item?.price ?? 0);
    const basePrice = Number.isFinite(rawBase) ? rawBase : 0;
    const subtotalPerUnit = basePrice + sumAdjustments(selectedOptions);

    const bestDiscount = item
        ? pickBestDiscountForSubtotal(item, activeHappyHourRules, subtotalPerUnit)
        : null;

    const unitPrice = bestDiscount ? bestDiscount.finalPrice : subtotalPerUnit;
    const subtotalTotal = subtotalPerUnit * quantity;
    const total = unitPrice * quantity;

    // Бейдж знижки для шапки модалки ("-20%" / "-$5").
    const discountBadge = bestDiscount
        ? bestDiscount.rule.discountType === 'PERCENTAGE'
            ? `-${bestDiscount.rule.discountValue}%`
            : `-$${bestDiscount.rule.discountValue}`
        : undefined;

    // Валідація: усі групи з `minSelections > 0` мають бути заповнені.
    const unmetGroups = groups.filter(
        (group) => group.minSelections > 0 && (selection[group.id]?.length ?? 0) < group.minSelections,
    );
    const isSoldOut = item ? !item.isActive : false;
    const canAdd = unmetGroups.length === 0 && !isSoldOut;

    function toggleOption(group: ModifierGroupResponse, optionId: string) {
        setSelection((previous) => {
            const current = previous[group.id] ?? [];

            // Радіо-поведінка: один вибір завжди замінює попередній.
            if (group.maxSelections === 1) {
                // Необов'язкову радіо-групу можна скинути повторним тапом.
                const next = current.includes(optionId) && group.minSelections === 0 ? [] : [optionId];
                return { ...previous, [group.id]: next };
            }

            // Чекбокси: знімаємо завжди, додаємо лише поки не досягнуто ліміту.
            if (current.includes(optionId)) {
                return { ...previous, [group.id]: current.filter((id) => id !== optionId) };
            }
            if (current.length >= group.maxSelections) return previous;

            return { ...previous, [group.id]: [...current, optionId] };
        });
    }

    function handleAddToCart() {
        if (!item || !canAdd) return;

        const pending = {
            menuItemId: item.id,
            quantity,
            selectedOptionIds: selectedOptions.map((option) => option.id),
        };

        // Немає активного кошика (ні сканованого столика, ні takeaway-сесії):
        // спершу питаємо формат замовлення, конфігурацію тримаємо в стору.
        if (!tableId && !takeawaySessionId) {
            setPendingCartItem(pending);
            setOrderTypeModalOpen(true);
            onClose();
            return;
        }

        // Гість ще не назвався — конфігурація доживе до закриття діалогу імені.
        if (!guestName || !guestSessionId) {
            setPendingCartItem(pending);
            setNameModalOpen(true);
            onClose();
            return;
        }

        /*
         * Модалка МУСИТЬ закритися незалежно від результату запиту:
         * `addConfigured` кидає помилку, якщо сервер повернув 500 (наприклад,
         * міграція модифікаторів ще не накатана). Тому ховаємо її у `finally`,
         * а саму відправку — в `try`, щоб невдалий додаток не залишив модалку
         * відкритою «нісенітницею» (візуально нічого не змінилося б).
         */
        try {
            addConfigured({
                item,
                selectedOptions,
                unitPrice,
                quantity,
                guestSessionId,
                guestName,
            });
        } finally {
            onClose();
        }
    }

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && item && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
                    {/* Затемнення + клік для закриття */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/*
                      Панель: на мобільному — лист, що виїзджає знизу на всю
                      ширину із закругленим верхом; на десктопі — центрована
                      скляна картка `max-w-lg`.
                    */}
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={item.name}
                        initial={isDesktop ? { opacity: 0, y: 24, scale: 0.97 } : { y: '100%' }}
                        animate={isDesktop ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
                        exit={isDesktop ? { opacity: 0, y: 16, scale: 0.98 } : { y: '100%' }}
                        transition={{ duration: 0.32, ease: EASE }}
                        className={`${body.className} relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-2xl sm:max-h-[85vh] sm:max-w-lg sm:rounded-3xl dark:border-white/10 dark:bg-[#121215]/90`}>
                        {/* 1. Герой: зафіксований, не скролиться */}
                        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#3B82F6]/20 via-[#8B5CF6]/12 to-transparent">
                            {item.imageUrl ? (
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, 512px"
                                    className={cn('object-cover', isSoldOut && 'opacity-50 grayscale')}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <UtensilsCrossed
                                        size={44}
                                        strokeWidth={1.4}
                                        className="text-[#3B82F6]/40 dark:text-[#8B5CF6]/50"
                                    />
                                </div>
                            )}

                            {/* Плавний перехід зображення у поверхню панелі */}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/80 to-transparent dark:from-[#121215]/90" />

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/80 text-[#0A0A0C] shadow-lg backdrop-blur-xl transition-colors [@media(hover:hover)]:hover:bg-white dark:border-white/15 dark:bg-black/50 dark:text-[#F5F4F2]">
                                <X size={17} strokeWidth={2.2} />
                            </button>

                            {isSoldOut && (
                                <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                                    Sold out
                                </span>
                            )}
                        </div>

                        {/* 2. Прокручувана середина */}
                        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                                <h2
                                    className={`${display.className} text-2xl font-bold leading-tight tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                    {item.name}
                                </h2>
                                <div className="shrink-0 text-right">
                                    {bestDiscount ? (
                                        <>
                                            <span className="block text-xs font-medium text-[#6B6A65] line-through dark:text-[#94938D]">
                                                {formatPrice(item.price)}
                                            </span>
                                            <span className="text-lg font-bold text-[#F59E0B]">
                                                {formatPrice(bestDiscount.finalPrice)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-lg font-bold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                            {formatPrice(item.price)}
                                        </span>
                                    )}
                                    {discountBadge && (
                                        <span className="mt-1 block rounded-full bg-[#F59E0B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                            {discountBadge}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {item.description && (
                                <p className="mt-2.5 text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                    {item.description}
                                </p>
                            )}

                            {(tags.length > 0 || allergens.length > 0) && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={`tag-${tag}`}
                                            className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            {tag}
                                        </span>
                                    ))}
                                    {allergens.map((allergen) => (
                                        <span
                                            key={`allergen-${allergen}`}
                                            className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                            Contains {allergen}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* 3. Динамічні групи модифікаторів */}
                            {groups.map((group) => {
                                const selectedIds = selection[group.id] ?? [];
                                const isRadio = group.maxSelections === 1;
                                const isRequired = group.minSelections > 0;
                                const atLimit = !isRadio && selectedIds.length >= group.maxSelections;

                                return (
                                    <section key={group.id} className="mt-6">
                                        <div className="flex items-center justify-between gap-3">
                                            <h3
                                                className={`${display.className} text-[15px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                                {group.name}
                                            </h3>
                                            <span
                                                className={cn(
                                                    'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                                                    isRequired
                                                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-500'
                                                        : 'border-black/10 text-[#6B6A65] dark:border-white/15 dark:text-[#94938D]',
                                                )}>
                                                {isRequired ? 'Required' : 'Optional'}
                                            </span>
                                        </div>

                                        {!isRadio && (
                                            <p className="mt-1 text-xs text-[#6B6A65] dark:text-[#94938D]">
                                                Choose up to {group.maxSelections}
                                            </p>
                                        )}

                                        <div className="mt-3 flex flex-col gap-2.5">
                                            {group.options.map((option) => {
                                                const checked = selectedIds.includes(option.id);
                                                const adjustment = Number.parseFloat(option.priceAdjustment);
                                                const hasAdjustment =
                                                    Number.isFinite(adjustment) && adjustment !== 0;
                                                // Досягнуто ліміту — решту глушимо, але вибране лишаємо активним.
                                                const isBlocked = atLimit && !checked;

                                                return (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        role={isRadio ? 'radio' : 'checkbox'}
                                                        aria-checked={checked}
                                                        disabled={isBlocked}
                                                        onClick={() => toggleOption(group, option.id)}
                                                        className={cn(
                                                            'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200',
                                                            checked
                                                                ? 'border-blue-500/40 bg-blue-500/10'
                                                                : 'border-black/10 bg-white/40 dark:border-white/10 dark:bg-white/[0.03]',
                                                            isBlocked
                                                                ? 'cursor-not-allowed opacity-40'
                                                                : '[@media(hover:hover)]:hover:border-blue-500/30',
                                                        )}>
                                                        {/* Кастомний індикатор: коло для радіо, квадрат для чекбокса */}
                                                        <span
                                                            className={cn(
                                                                'flex h-5 w-5 shrink-0 items-center justify-center border transition-colors',
                                                                isRadio ? 'rounded-full' : 'rounded-md',
                                                                checked
                                                                    ? 'border-blue-500 bg-blue-500'
                                                                    : 'border-black/20 dark:border-white/25',
                                                            )}>
                                                            <AnimatePresence>
                                                                {checked &&
                                                                    (isRadio ? (
                                                                        <motion.span
                                                                            key="dot"
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            exit={{ scale: 0 }}
                                                                            transition={{
                                                                                duration: 0.18,
                                                                                ease: EASE,
                                                                            }}
                                                                            className="h-2 w-2 rounded-full bg-white"
                                                                        />
                                                                    ) : (
                                                                        <motion.span
                                                                            key="check"
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            exit={{ scale: 0 }}
                                                                            transition={{
                                                                                duration: 0.18,
                                                                                ease: EASE,
                                                                            }}
                                                                            className="flex text-white">
                                                                            <Check size={13} strokeWidth={3} />
                                                                        </motion.span>
                                                                    ))}
                                                            </AnimatePresence>
                                                        </span>

                                                        <span className="flex-1 text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                            {option.name}
                                                        </span>

                                                        {/* "+ $0" не показуємо — безкоштовне лишається чистим */}
                                                        {hasAdjustment && (
                                                            <span className="shrink-0 text-sm font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                                                                {adjustment > 0 ? '+' : '−'}{' '}
                                                                {formatPrice(Math.abs(adjustment))}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>

                        {/* 4. Липкий скляний футер: кількість + додавання */}
                        <div className="shrink-0 border-t border-white/60 bg-white/70 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:py-4 backdrop-blur-2xl dark:border-white/10 dark:bg-[#121215]/80">
                            <div className="flex items-center gap-3">
                                {/* Пілюля кількості */}
                                <div className="flex shrink-0 items-center gap-1 rounded-full border border-black/10 bg-white/60 p-1 dark:border-white/15 dark:bg-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        disabled={quantity <= 1}
                                        aria-label="Decrease quantity"
                                        className="flex h-9 w-9 items-center justify-center rounded-full text-[#0A0A0C] transition-colors disabled:opacity-30 [@media(hover:hover)]:hover:bg-black/5 dark:text-[#F5F4F2] dark:[@media(hover:hover)]:hover:bg-white/10">
                                        <Minus size={15} strokeWidth={2.5} />
                                    </button>
                                    <span className="w-6 text-center text-sm font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((q) => q + 1)}
                                        aria-label="Increase quantity"
                                        className="flex h-9 w-9 items-center justify-center rounded-full text-[#0A0A0C] transition-colors [@media(hover:hover)]:hover:bg-black/5 dark:text-[#F5F4F2] dark:[@media(hover:hover)]:hover:bg-white/10">
                                        <Plus size={15} strokeWidth={2.5} />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={!canAdd}
                                    className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none [@media(hover:hover)]:hover:opacity-95">
                                    {isSoldOut ? (
                                        'Sold out'
                                    ) : !canAdd ? (
                                        // Обов'язкова група модифікаторів не заповнена — саме це
                                        // блокує кнопку, тому текст має вказувати причину.
                                        'Select required options'
                                    ) : (
                                        <>
                                            {/* `truncate` + `shrink` — щоб дві ціни не розпирали футер */}
                                            <span className="truncate">Add to Cart</span>
                                            <span className="shrink-0 opacity-70">—</span>
                                            {bestDiscount ? (
                                                <span className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
                                                    <span className="text-white/50 line-through">
                                                        {formatPrice(subtotalTotal)}
                                                    </span>
                                                    <span className="font-bold text-[#F59E0B]">
                                                        {formatPrice(total)}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="shrink-0 tabular-nums">{formatPrice(total)}</span>
                                            )}
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Підказка, чому кнопка заблокована */}
                            <AnimatePresence>
                                {!isSoldOut && unmetGroups.length > 0 && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden pt-2 text-center text-xs text-[#6B6A65] dark:text-[#94938D]">
                                        Please choose {unmetGroups.map((group) => group.name).join(', ')}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
