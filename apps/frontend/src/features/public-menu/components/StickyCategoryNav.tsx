'use client';

import { useState, useEffect, useRef } from 'react';
import type { PublicMenuCategoryResponse } from '@my-app/types';
import { body } from '@/shared/lib/fonts';

interface StickyCategoryNavProps {
    categories: PublicMenuCategoryResponse[];
}

export function StickyCategoryNav({ categories }: StickyCategoryNavProps) {
    const [activeId, setActiveId] = useState<string>('');
    const activeIdRef = useRef<string>('');
    const navRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isClickScrolling = useRef<boolean>(false);

    const centerCategoryPill = (categoryId: string) => {
        const navElement = navRef.current;
        if (!navElement) return;
        const activeLink = navElement.querySelector<HTMLElement>(`[data-category="${categoryId}"]`);
        if (activeLink) {
            const scrollLeft =
                activeLink.offsetLeft - navElement.offsetWidth / 2 + activeLink.offsetWidth / 2;
            navElement.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleScrollSpy = () => {
            if (isClickScrolling.current || !categories || categories.length === 0) return;

            const navBarHeight = wrapperRef.current?.offsetHeight ?? 44;
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
            const topOffset = isMobile ? 68 : 76;
            const triggerLine = topOffset + navBarHeight + 20;

            let currentActiveId = '';

            for (let i = 0; i < categories.length; i++) {
                const el = document.getElementById(`cat-${categories[i].id}`);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= triggerLine) {
                        currentActiveId = `cat-${categories[i].id}`;
                    }
                }
            }

            if (!currentActiveId && categories.length > 0) {
                currentActiveId = `cat-${categories[0].id}`;
            }

            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 20) {
                currentActiveId = `cat-${categories[categories.length - 1].id}`;
            }

            if (currentActiveId && currentActiveId !== activeIdRef.current) {
                activeIdRef.current = currentActiveId;
                setActiveId(currentActiveId);
                centerCategoryPill(currentActiveId);
            }
        };

        window.addEventListener('scroll', handleScrollSpy, { passive: true });
        handleScrollSpy();

        return () => window.removeEventListener('scroll', handleScrollSpy);
    }, [categories]);

    const handleCategoryClick = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(`cat-${id}`);
        if (!element) return;

        isClickScrolling.current = true;

        const sectionId = `cat-${id}`;
        activeIdRef.current = sectionId;
        setActiveId(sectionId);
        centerCategoryPill(sectionId);

        const navBarHeight = wrapperRef.current?.offsetHeight ?? 44;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        const topOffset = isMobile ? 68 : 76;
        const offset = topOffset + navBarHeight + 14;

        const y = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });

        setTimeout(() => {
            isClickScrolling.current = false;
        }, 600);
    };

    if (!categories || categories.length === 0) return null;

    return (
        <div
            ref={wrapperRef}
            className="sticky top-[68px] sm:top-[76px] z-30 my-3 rounded-2xl border border-[#E7E5E0]/80 bg-white/80 p-1.5 shadow-xs backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0A0C]/80">
            <div
                ref={navRef}
                className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar px-1 py-0.5 scroll-smooth">
                {categories.map((category) => {
                    const sectionId = `cat-${category.id}`;
                    const isActive = activeId === sectionId;

                    return (
                        <button
                            key={category.id}
                            type="button"
                            data-category={sectionId}
                            onClick={(e) => handleCategoryClick(category.id, e)}
                            className={`${body.className} relative shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-150 ${
                                isActive
                                    ? 'bg-[#3B82F6] text-white shadow-xs'
                                    : 'text-[#6B6A65] hover:bg-black/5 hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:bg-white/5 dark:hover:text-[#F5F4F2]'
                            }`}>
                            <span>{category.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
