'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type {
    MenuItemResponse,
    PublicMenuCategoryResponse,
    PublicMenuResponseDTO,
} from '@my-app/types';

import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { Reveal } from '@/shared/ui/Reveal';
import { GuestItemModal } from './GuestItemModal';
import { PublicMenuItem } from './PublicMenuItem';
import { pickBestDiscount, type ActiveHappyHourRule } from '../hooks/usePublicHappyHour';

type PublicMenuListProps = {
    categories: PublicMenuResponseDTO['categories'];
    tableId: string | null;
    takeawaySessionId: string | null;
    /** Поточні активні правила Happy Hour (з дисконт-калькуляцією). */
    activeHappyHourRules?: ActiveHappyHourRule[];
};

// Staggered fade-up: each item rises into place after the previous one.
const listContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
};

const listItem = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: EASE } },
};

/** Форматує бейдж знижки Happy Hour у людський вигляд. */
function formatDiscountBadge(discount: ReturnType<typeof pickBestDiscount>): string | undefined {
    if (!discount) return undefined;
    return discount.rule.discountType === 'PERCENTAGE'
        ? `-${discount.rule.discountValue}%`
        : `-$${discount.rule.discountValue}`;
}

export function PublicMenuList({
    categories,
    tableId,
    takeawaySessionId,
    activeHappyHourRules = [],
}: PublicMenuListProps) {
    // Одна модалка на все меню: тримаємо лише обрану страву, а не N інстансів.
    const [selectedItem, setSelectedItem] = useState<MenuItemResponse | null>(null);

    return (
        <div className="mt-10 flex flex-col gap-12">
            {categories.map((category: PublicMenuCategoryResponse) => (
                <Reveal key={category.id} className="scroll-mt-32" delay={0}>
                    <section id={`cat-${category.id}`}>
                        <h2
                            className={`${display.className} mb-5 text-[26px] font-bold leading-tight tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-[34px]`}>
                            {category.name}
                        </h2>

                        {/* Mobile: 1 column · Tablet: 2 columns · Desktop: 3 columns */}
                        <motion.div
                            variants={listContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: '-60px' }}
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {category.items.map((item) => {
                                const discount = pickBestDiscount(item, activeHappyHourRules);
                                return (
                                    <PublicMenuItem
                                        key={item.id}
                                        item={item}
                                        variants={listItem}
                                        onSelect={setSelectedItem}
                                        discountedPrice={discount?.finalPrice}
                                        discountBadge={formatDiscountBadge(discount)}
                                    />
                                );
                            })}
                        </motion.div>
                    </section>
                </Reveal>
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
