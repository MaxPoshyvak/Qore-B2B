'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { body } from '@/shared/lib/fonts';

// Висота BaseHeader (шапки сайту)
const HEADER_HEIGHT = 64;
// Відступ, щоб панель категорій "дихала" під хедером
const GAP_UNDER_HEADER = 25;
const STICKY_TOP = HEADER_HEIGHT + GAP_UNDER_HEADER;

export function StickyCategoryNav({ categories }: { categories: any[] }) {
    const [activeId, setActiveId] = useState<string>('');
    const activeIdRef = useRef<string>(''); // Зберігаємо для уникнення зайвих рендерів
    const navRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Блокуємо ScrollSpy під час плавного автоскролу по кліку
    const isClickScrolling = useRef<boolean>(false);

    useEffect(() => {
        const handleScrollSpy = () => {
            // Якщо зараз відбувається автоскрол після кліку — ігноруємо
            if (isClickScrolling.current || !categories || categories.length === 0) return;

            const navBarHeight = wrapperRef.current?.offsetHeight ?? 64;
            // Лінія тригера: трохи нижче самої липкої панелі
            const triggerLine = STICKY_TOP + navBarHeight + 15;

            let currentActiveId = '';

            // Вимірюємо реальні координати в реальному часі
            for (let i = 0; i < categories.length; i++) {
                const el = document.getElementById(`cat-${categories[i].id}`);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // Оскільки ми йдемо зверху вниз, остання секція, верх
                    // якої перетнув тригерну лінію, стає активною
                    if (rect.top <= triggerLine) {
                        currentActiveId = `cat-${categories[i].id}`;
                    }
                }
            }

            // Fallback 1: Якщо ми на самому верху сторінки
            if (!currentActiveId && categories.length > 0) {
                currentActiveId = `cat-${categories[0].id}`;
            }

            // Fallback 2: Якщо доскролили до самого низу екрану
            // (вирішує проблему, коли остання категорія надто коротка)
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
                currentActiveId = `cat-${categories[categories.length - 1].id}`;
            }

            // Оновлюємо стан, якщо активна категорія змінилася
            if (currentActiveId && currentActiveId !== activeIdRef.current) {
                activeIdRef.current = currentActiveId;
                setActiveId(currentActiveId);

                // Плавно центруємо активну кнопку в горизонтальному меню
                const navElement = navRef.current;
                const activeLink = navElement?.querySelector(`[data-category="${currentActiveId}"]`);
                if (navElement && activeLink) {
                    activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }
        };

        window.addEventListener('scroll', handleScrollSpy, { passive: true });
        handleScrollSpy(); // Ініціалізуємо при завантаженні

        return () => window.removeEventListener('scroll', handleScrollSpy);
    }, [categories]);

    const handleCategoryClick = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(`cat-${id}`);
        if (!element) return;

        // Вмикаємо блокування ScrollSpy
        isClickScrolling.current = true;

        // Оновлюємо UI миттєво після кліку
        const sectionId = `cat-${id}`;
        activeIdRef.current = sectionId;
        setActiveId(sectionId);

        const navElement = navRef.current;
        const activeLink = navElement?.querySelector(`[data-category="${sectionId}"]`);
        if (navElement && activeLink) {
            activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        // Розраховуємо правильний відступ і скролимо
        const navBarHeight = wrapperRef.current?.offsetHeight ?? 64;
        const offset = STICKY_TOP + navBarHeight + GAP_UNDER_HEADER;
        const y = element.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top: y, behavior: 'smooth' });

        // Вимикаємо блокування, коли скрол гарантовано завершився (~800мс)
        setTimeout(() => {
            isClickScrolling.current = false;
        }, 800);
    };

    if (!categories || categories.length === 0) return null;

    return (
        <div
            ref={wrapperRef}
            style={{ top: STICKY_TOP }}
            className="sticky mt-5 z-40 mb-6 rounded-[2rem] border border-[#E7E5E0]/80 bg-white/70 px-3 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
            <div
                ref={navRef}
                className="flex items-center gap-2 overflow-x-auto px-1 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {categories.map((category) => {
                    const sectionId = `cat-${category.id}`;
                    const isActive = activeId === sectionId;

                    return (
                        <button
                            key={category.id}
                            data-category={sectionId}
                            onClick={(e) => handleCategoryClick(category.id, e)}
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
