// src/shared/ui/BaseHeader.tsx
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { EASE } from '@/shared/config/animations';
import { HappyHourBanner } from '@/features/public-menu/components/HappyHourBanner';
import type { ActiveHappyHourRule } from '@/features/public-menu/hooks/usePublicHappyHour';

interface BaseHeaderProps {
    children?: ReactNode; // Кнопки/дії справа
    centerContent?: ReactNode; // Навігація по центру (для лендінгу)
    bottomContent?: ReactNode; // Мобільне меню (для лендінгу)
    scrolled?: boolean; // Тінь при скролі
    /** Активні правила Happy Hour; банер рендериться всередині шапки
     *  (права колонка), щоб не зміщувати назву закладу від центру. */
    activeRules?: ActiveHappyHourRule[];
}

export function BaseHeader({ children, centerContent, bottomContent, scrolled = false, activeRules }: BaseHeaderProps) {
    return (
        <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-6">
            <motion.div
                animate={{
                    boxShadow: scrolled ? '0 12px 40px -16px rgba(10,10,12,0.18)' : '0 0px 0px 0px rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.3, ease: EASE }}
                className="mx-auto max-w-6xl rounded-[2rem] border border-[#E7E5E0]/80 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/40 overflow-hidden">
                {/* Трьохколонкова сітка: лого зліва, назва по центру,
                    банер + дії справа. Гарантує ідеальне центрування назви
                    незалежно від ширини банера Happy Hour. */}
                <div className="grid grid-cols-3 items-center w-full px-4 py-3 sm:px-5">
                    {/* Ліва колонка: лого (або кнопка «назад») */}
                    <div className="flex justify-start">
                        <Logo />
                    </div>

                    {/* Центральна колонка: назва закладу / навігація */}
                    <div className="flex justify-center text-center">
                        {centerContent}
                    </div>

                    {/* Права колонка: банер Happy Hour + дії */}
                    <div className="flex justify-end items-center gap-3">
                        {activeRules && activeRules.length > 0 && <HappyHourBanner rules={activeRules} />}
                        {children}
                    </div>
                </div>

                {bottomContent}
            </motion.div>
        </header>
    );
}
