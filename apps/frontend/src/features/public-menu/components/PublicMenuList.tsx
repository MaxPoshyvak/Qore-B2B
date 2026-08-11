'use client';

import { motion } from 'framer-motion';
import type { PublicMenuCategoryResponse, PublicMenuResponseDTO } from '@my-app/types';

import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { PublicMenuItem } from './PublicMenuItem';

type PublicMenuListProps = {
    categories: PublicMenuResponseDTO['categories'];
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

export function PublicMenuList({ categories }: PublicMenuListProps) {
    return (
        <div className="mt-10 flex flex-col gap-10">
            {categories.map((category: PublicMenuCategoryResponse) => (
                <section
                    key={category.id}
                    id={`cat-${category.id}`}
                    className="scroll-mt-32">
                    <h2
                        className={`${display.className} mb-4 text-xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        {category.name}
                    </h2>

                    {/* Mobile: 1 column · Tablet/desktop: 2 columns */}
                    <motion.div
                        variants={listContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-60px' }}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                        {category.items.map((item) => (
                            <PublicMenuItem key={item.id} item={item} variants={listItem} />
                        ))}
                    </motion.div>
                </section>
            ))}
        </div>
    );
}
