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
        let rafId: number | null = null;

        const handleScrollSpy = () => {
            if (isClickScrolling.current || !categories || categories.length === 0) return;

            const triggerLine = (window.innerWidth < 640 ? 70 : 84) + 54;
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

        const onScroll = () => {
            if (rafId !== null) return;
            rafId = window.requestAnimationFrame(() => {
                handleScrollSpy();
                rafId = null;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        const timer = window.setTimeout(handleScrollSpy, 150);

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (rafId !== null) window.cancelAnimationFrame(rafId);
            window.clearTimeout(timer);
        };
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

        const offset = (window.innerWidth < 640 ? 70 : 84) + 48;
        const y = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });

        setTimeout(() => {
            isClickScrolling.current = false;
        }, 600);
    };

    if (!categories || categories.length === 0) return null;

    return (
        <div
            style={{
                top: 'calc(var(--demo-banner-height, 0px) + var(--nav-top, 70px))',
                borderRadius: 'var(--theme-radius)',
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-surface-border)',
            }}
            className="sticky z-30 my-2 border p-1 shadow-xs backdrop-blur-xl sm:my-3 sm:p-1.5 [--nav-top:70px] sm:[--nav-top:84px]">
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
