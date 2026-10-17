'use client';

import { useState, useEffect, useRef } from 'react';
import type { PublicMenuCategoryResponse } from '@my-app/types';
import { body } from '@/shared/lib/fonts';

interface StickyCategoryNavProps {
    categories: PublicMenuCategoryResponse[];
}

export function StickyCategoryNav({ categories }: StickyCategoryNavProps) {
    const [activeId, setActiveId] = useState<string>('');
    const [stickyTop, setStickyTop] = useState<number>(80);
    const activeIdRef = useRef<string>('');
    const navRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isClickScrolling = useRef<boolean>(false);

    // Dynamically calculate sticky top offset so category bar never touches or overlaps BaseHeader
    useEffect(() => {
        const updateStickyTop = () => {
            const header = document.querySelector('header');
            if (header) {
                const computedHeaderTop =
                    parseFloat(window.getComputedStyle(header).top) ||
                    (window.innerWidth < 640 ? 12 : 16);
                const headerHeight = header.offsetHeight;
                const gap = window.innerWidth < 640 ? 10 : 12;
                setStickyTop(computedHeaderTop + headerHeight + gap);
            }
        };

        updateStickyTop();
        window.addEventListener('resize', updateStickyTop);
        const timer = setTimeout(updateStickyTop, 150);
        return () => {
            window.removeEventListener('resize', updateStickyTop);
            clearTimeout(timer);
        };
    }, []);

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

            const navBarHeight = wrapperRef.current?.offsetHeight ?? 38;
            const triggerLine = stickyTop + navBarHeight + 16;

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
    }, [categories, stickyTop]);

    const handleCategoryClick = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(`cat-${id}`);
        if (!element) return;

        isClickScrolling.current = true;

        const sectionId = `cat-${id}`;
        activeIdRef.current = sectionId;
        setActiveId(sectionId);
        centerCategoryPill(sectionId);

        const navBarHeight = wrapperRef.current?.offsetHeight ?? 38;
        const offset = stickyTop + navBarHeight + 12;

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
            style={{
                top: `${stickyTop}px`,
                borderRadius: 'var(--theme-radius)',
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-surface-border)',
            }}
            className="sticky z-30 my-2 border p-1 shadow-xs backdrop-blur-xl sm:my-3 sm:p-1.5">
            <div
                ref={navRef}
                className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar px-0.5 py-0.5 scroll-smooth">
                {categories.map((category) => {
                    const sectionId = `cat-${category.id}`;
                    const isActive = activeId === sectionId;

                    return (
                        <button
                            key={category.id}
                            type="button"
                            data-category={sectionId}
                            onClick={(e) => handleCategoryClick(category.id, e)}
                            style={
                                isActive
                                    ? {
                                          backgroundColor: 'var(--theme-primary)',
                                          color: 'var(--theme-primary-text)',
                                          borderRadius: 'calc(var(--theme-radius) * 0.6)',
                                      }
                                    : {
                                          borderRadius: 'calc(var(--theme-radius) * 0.6)',
                                      }
                            }
                            className={`font-theme-body relative shrink-0 px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                                isActive
                                    ? 'shadow-xs'
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
