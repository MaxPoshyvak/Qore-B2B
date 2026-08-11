'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { PublicMenuCategoryResponse } from '@my-app/types';

type StickyCategoryNavProps = {
    categories: PublicMenuCategoryResponse[];
};

// Clears the `BaseHeader` (sticky top-3) and this floating bar when jumping.
const STICKY_OFFSET = 128;

export function StickyCategoryNav({ categories }: StickyCategoryNavProps) {
    const [activeId, setActiveId] = useState<string | null>(categories[0]?.id ?? null);
    const rafId = useRef<number | null>(null);

    // Highlight the category whose section is currently under the floating bar.
    useEffect(() => {
        function handleScroll() {
            if (rafId.current !== null) return;
            rafId.current = requestAnimationFrame(() => {
                rafId.current = null;
                let current: string | null = categories[0]?.id ?? null;
                for (const category of categories) {
                    const el = document.getElementById(`cat-${category.id}`);
                    if (!el) continue;
                    if (el.getBoundingClientRect().top - STICKY_OFFSET <= 1) current = category.id;
                }
                setActiveId(current);
            });
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        };
    }, [categories]);

    function scrollToCategory(id: string) {
        const el = document.getElementById(`cat-${id}`);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
        setActiveId(id);
    }

    return (
        <nav className="sticky top-4 z-40 mx-auto mt-8 w-[calc(100%-2rem)] max-w-2xl rounded-full border border-white/20 bg-white/60 p-1.5 shadow-lg shadow-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-black/40">
            <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((category) => {
                    const isActive = category.id === activeId;
                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => scrollToCategory(category.id)}
                            className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                isActive
                                    ? 'text-white'
                                    : 'text-[#6B6A65] hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2]'
                            }`}>
                            {isActive && (
                                <motion.span
                                    layoutId="activeCategory"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                                />
                            )}
                            {category.name}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
