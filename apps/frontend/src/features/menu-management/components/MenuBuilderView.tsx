'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

import { MenuBoard } from './MenuBoard';
import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';

type MenuBuilderViewProps = {
    slug: string;
};

/** Dashboard "Menu Builder" section: category/item management for the venue. */
export function MenuBuilderView({ slug }: MenuBuilderViewProps) {
    const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

    return (
        <div>
            <motion.header
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/5 px-3 py-1 text-xs font-medium text-[#6D28D9] dark:text-[#C4B5FD]">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
                        Menu
                    </span>
                    <h1
                        className={`${display.className} mt-4 text-3xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-4xl`}>
                        Menu{' '}
                        <span className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                            Management
                        </span>
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        Organise categories, curate dishes and keep prices sharp — every change goes live on your
                        public menu instantly.
                    </p>
                </div>

                <motion.button
                    type="button"
                    onClick={() => setCreateCategoryOpen(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition-opacity hover:opacity-95">
                    <Plus size={17} strokeWidth={2.4} />
                    Add Category
                </motion.button>
            </motion.header>

            <div className="mt-8">
                <MenuBoard
                    slug={slug}
                    createCategoryOpen={createCategoryOpen}
                    onCreateCategoryOpenChange={setCreateCategoryOpen}
                />
            </div>
        </div>
    );
}
