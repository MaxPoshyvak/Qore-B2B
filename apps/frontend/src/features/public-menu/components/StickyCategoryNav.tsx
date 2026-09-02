'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { body } from '@/shared/lib/fonts';

// Висота BaseHeader (шапки сайту). Якщо у BaseHeader зміниться висота — поправ тут.
const HEADER_HEIGHT = 64;
// Відступ, щоб панель категорій "дихала" під хедером, а не прилипала впритул.
const GAP_UNDER_HEADER = 25;
const STICKY_TOP = HEADER_HEIGHT + GAP_UNDER_HEADER;

export function StickyCategoryNav({ categories }: { categories: any[] }) {
    const [activeId, setActiveId] = useState<string>('');
    const navRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Логіка відстеження скролу для активної категорії.
    // ВАЖЛИВО: id секцій у PublicMenuList — `cat-${category.id}`, тож слухаємо саме їх
    // (раніше тут був `category-${cat.id}`, який ніколи не існував у DOM — через це
    // scroll-spy і клік по категорії фактично не працювали).
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);

                        // Центрування активного елемента в скролбарі
                        const navElement = navRef.current;
                        const activeLink = navElement?.querySelector(`[data-category="${entry.target.id}"]`);
                        if (navElement && activeLink) {
                            activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        }
                    }
                });
            },
            { rootMargin: `-${STICKY_TOP + 64}px 0px -60% 0px` }, // враховуємо хедер + саму панель
        );

        categories.forEach((cat) => {
            const el = document.getElementById(`cat-${cat.id}`);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [categories]);

    const handleScroll = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(`cat-${id}`);
        if (!element) return;

        // Динамічно міряємо висоту самої панелі, замість хардкоду "на око".
        const navBarHeight = wrapperRef.current?.offsetHeight ?? 64;
        const offset = STICKY_TOP + navBarHeight + GAP_UNDER_HEADER;
        const y = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    if (!categories || categories.length === 0) return null;

    return (
        // Sticky-панель тепер живе в тому самому mx-auto max-w-6xl px-6 контейнері,
        // що й хедер і весь контент — без "-mx" full-bleed, ширина 1:1 з хедером.
        // top = висота хедера + зазор, тому вона більше на нього не налазить.
        <div
            ref={wrapperRef}
            style={{ top: STICKY_TOP }}
            className="sticky mt-5 z-40 mb-6 rounded-[2rem] border border-[#E7E5E0]/80 bg-white/70 px-3 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
            <div
                ref={navRef}
                className="flex items-center gap-2 overflow-x-auto px-1 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {categories.map((category) => {
                    const isActive = activeId === `cat-${category.id}`;

                    return (
                        <button
                            key={category.id}
                            data-category={`cat-${category.id}`}
                            onClick={(e) => handleScroll(category.id, e)}
                            className={`${body.className} relative flex-shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
                                isActive
                                    ? 'text-white'
                                    : 'bg-black/5 text-[#6B6A65] hover:bg-black/10 dark:bg-white/5 dark:text-[#94938D] dark:hover:bg-white/10'
                            }`}>
                            {isActive && (
                                <motion.div
                                    layoutId="activeCategory"
                                    className="absolute inset-0 rounded-full bg-[#3B82F6] shadow-sm dark:bg-[#3B82F6]"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{category.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
