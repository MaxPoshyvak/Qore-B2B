'use client';

import { motion, type Variants } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { MenuItemResponse } from '@my-app/types';

import { cn, formatPrice } from '@/shared/lib/utils';
import { display } from '@/shared/lib/fonts';
import { toStringArray } from '@/shared/lib/menu-attributes';
import { TiltCard } from '@/shared/ui/TiltCard';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';
import { useCartStore } from '../store/useCartStore';

// Inherit the stagger variants from the parent list.
type PublicMenuItemProps = {
    item: MenuItemResponse;
    variants?: Variants;
    /** Відкриває `GuestItemModal` — картка тепер цілком є тригером. */
    onSelect: (item: MenuItemResponse) => void;
    /**
     * Якщо передано — показуємо оригінальну ціну перекресленою
     * та нову ціну у фірмовому бурштиновому кольорі.
     */
    discountedPrice?: number;
    /** Текст бейджа знижки ("20% off", "$5 off"). */
    discountBadge?: string;
};

/**
 * Преміальна картка страви для публічного меню.
 *
 * Уся картка — один клікабельний тригер, що відкриває модалку кастомізації.
 * Покрокові кнопки `+`/`−` прибрано: кількість і модифікатори тепер живуть у
 * `GuestItemModal`, а редагування вже доданого — у `CartDrawer`.
 */
export function PublicMenuItem({ item, onSelect, discountedPrice, discountBadge }: PublicMenuItemProps) {
    const t = useTranslations('publicMenu');
    const isDesktop = useIsDesktop();
    const currency = useCartStore((s) => s.currency);

    const tags = toStringArray(item.tags);
    const allergens = toStringArray(item.allergens);
    // Показуємо максимум три пілюлі, щоб не ламати висоту сітки.
    const visiblePills = [...tags, ...allergens].slice(0, 3);
    const hasModifiers = (item.modifiers?.length ?? 0) > 0;

    return (
        <li className="h-full list-none marker:content-none">
            {/* TiltCard важкий для мобільних — вимикаємо поза десктопом. */}
            <TiltCard strength={6} disabled={!isDesktop} className="h-full">
                <button
                    type="button"
                    onClick={() => onSelect(item)}
                    aria-label={`Customize ${item.name}`}
                    style={{
                        borderRadius: 'var(--theme-radius)',
                        backgroundColor: 'var(--theme-surface)',
                        borderColor: 'var(--theme-surface-border)',
                    }}
                    className={cn(
                        'group flex h-full w-full flex-col overflow-hidden border text-left shadow-lg backdrop-blur-xl transition-all duration-300',
                        // Ховер-ефекти лише для пристроїв зі справжнім курсором.
                        '[@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-[var(--theme-card-border-hover,var(--theme-primary))] [@media(hover:hover)]:hover:shadow-[var(--theme-card-glow,0_20px_25px_-5px_rgba(0,0,0,0.1))]',
                        !item.isActive && 'opacity-60',
                    )}>
                    {/* Медіа 4:3 */}
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#3B82F6]/20 via-[#8B5CF6]/12 to-transparent">
                        {item.imageUrl ? (
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className={cn(
                                    'object-cover transition-transform duration-500',
                                    '[@media(hover:hover)]:group-hover:scale-105',
                                    !item.isActive && 'grayscale',
                                )}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <UtensilsCrossed
                                    size={32}
                                    strokeWidth={1.4}
                                    className="text-[#3B82F6]/40 dark:text-[#8B5CF6]/50"
                                />
                            </div>
                        )}

                        {/* Скляні пілюлі атрибутів — накладені на зображення */}
                        {visiblePills.length > 0 && (
                            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 pr-3">
                                {visiblePills.map((pill) => (
                                    <span
                                        key={pill}
                                        className="rounded-full border border-white/60 bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-[#0A0A0C] backdrop-blur-md dark:border-white/15 dark:bg-black/45 dark:text-[#F5F4F2]">
                                        {pill}
                                    </span>
                                ))}
                            </div>
                        )}

                        {discountBadge && (
                            <span className="absolute right-3 top-3 rounded-full bg-[#F59E0B] px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                                {discountBadge}
                            </span>
                        )}

                        {!item.isActive && (
                            <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                                {t('soldOut')}
                            </span>
                        )}
                    </div>

                    {/* Текст + ціна */}
                    <div className="flex flex-1 flex-col p-5">
                        <h3
                            className="font-theme-heading text-[17px] font-bold leading-snug tracking-tight text-[var(--theme-text-primary)]">
                            {item.name}
                        </h3>

                        {item.description && (
                            <p className="font-theme-body mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--theme-text-secondary)]">
                                {item.description}
                            </p>
                        )}

                        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                            <div className="min-w-0">
                                {discountedPrice !== undefined ? (
                                    <div className="flex flex-wrap items-baseline gap-2">
                                        <span className="text-xs font-medium text-[#6B6A65] line-through dark:text-[#94938D]">
                                            {formatPrice(item.price, currency)}
                                        </span>
                                        <span className="text-xl font-bold text-[var(--theme-accent)]">
                                            {formatPrice(discountedPrice, currency)}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xl font-bold text-[var(--theme-text-primary)]">
                                        {formatPrice(item.price, currency)}
                                    </span>
                                )}
                            </div>

                            {/* Підказка, що страву можна зібрати під себе */}
                            {hasModifiers && item.isActive && (
                                <span className="shrink-0 text-[11px] font-semibold text-[var(--theme-primary)]">
                                    {t('customize')}
                                </span>
                            )}
                        </div>
                    </div>
                </button>
            </TiltCard>
        </li>
    );
}
