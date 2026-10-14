'use client';

import { UtensilsCrossed, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MenuItemResponse, PublicMenuCategoryResponse, PublicMenuResponseDTO } from '@my-app/types';

import { display } from '@/shared/lib/fonts';
import { GuestItemModal } from './GuestItemModal';
import { PublicMenuItem } from './PublicMenuItem';
import { pickBestDiscount, type ActiveHappyHourRule } from '../hooks/usePublicHappyHour';
import { useCartStore } from '../store/useCartStore';

import { formatPrice } from '@/shared/lib/utils';

type PublicMenuListProps = {
    categories: PublicMenuResponseDTO['categories'];
    tableId: string | null;
    takeawaySessionId: string | null;
    /** Поточні активні правила Happy Hour (з дисконт-калькуляцією). */
    activeHappyHourRules?: ActiveHappyHourRule[];
    onResetFilters?: () => void;
};

/** Форматує бейдж знижки Happy Hour у людський вигляд. */
function formatDiscountBadge(discount: ReturnType<typeof pickBestDiscount>, currency = 'USD'): string | undefined {
    if (!discount) return undefined;
    return discount.rule.discountType === 'PERCENTAGE'
        ? `-${discount.rule.discountValue}%`
        : `-${formatPrice(discount.rule.discountValue, currency)}`;
}

export function PublicMenuList({
    categories,
    tableId,
    takeawaySessionId,
    activeHappyHourRules = [],
    onResetFilters,
}: PublicMenuListProps) {
    const t = useTranslations('publicMenu');
    // Single source of truth in useCartStore so CartBanner knows when a dish modal is open.
    const selectedItem = useCartStore((s) => s.selectedDish);
    const setSelectedItem = useCartStore((s) => s.setSelectedDish);
    const currency = useCartStore((s) => s.currency);

    if (categories.length === 0) {
        return (
            <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-black/5 bg-white/40 px-6 py-16 text-center shadow-sm backdrop-blur-lg dark:border-white/5 dark:bg-white/[0.02]">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
                    <UtensilsCrossed className="h-7 w-7" />
                </div>
                <h3 className={`${display.className} text-xl font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                    {t('noDishesFound')}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-[#6B6A65] dark:text-[#94938D]">
                    {t('noDishesDesc')}
                </p>
                {onResetFilters && (
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:opacity-90 active:scale-95">
                        <RotateCcw className="h-4 w-4" />
                        <span>{t('clearFilters')}</span>
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="mt-8 flex flex-col gap-12">
            {categories.map((category: PublicMenuCategoryResponse) => (
                <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-36">
                    <div className="mb-5 flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/5">
                        <h2
                            className={`${display.className} text-[22px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-[28px]`}>
                            {category.name}
                        </h2>
                        <span className="text-xs font-semibold text-[#6B6A65] dark:text-[#94938D]">
                            {category.items.length}
                        </span>
                    </div>

                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {category.items.map((item) => {
                            const discount = pickBestDiscount(item, activeHappyHourRules);
                            return (
                                <PublicMenuItem
                                    key={item.id}
                                    item={item}
                                    onSelect={setSelectedItem}
                                    discountedPrice={discount?.finalPrice}
                                    discountBadge={formatDiscountBadge(discount, currency)}
                                />
                            );
                        })}
                    </ul>
                </section>
            ))}

            <GuestItemModal
                item={selectedItem}
                tableId={tableId}
                takeawaySessionId={takeawaySessionId}
                onClose={() => setSelectedItem(null)}
                activeHappyHourRules={activeHappyHourRules}
            />
        </div>
    );
}
