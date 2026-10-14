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
                className="mx-auto max-w-6xl rounded-[2rem] border border-[#E7E5E0]/80 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
                {/* Flex layout: logo on the left, center content with overflow safety,
                    happy hour banner + actions on the right without squeezing */}
                <div className="flex items-center justify-between w-full px-3.5 py-1.5 sm:px-5 sm:py-2.5 gap-2 sm:gap-4">
                    {/* Left column: logo */}
                    <div className="flex items-center justify-start shrink-0">
                        <Logo />
                    </div>

                    {/* Center column: venue name / navigation (hidden on small mobile to avoid crushing actions) */}
                    {centerContent && (
                        <div className="hidden min-w-0 flex-1 items-center justify-center text-center sm:flex px-2">
                            {centerContent}
                        </div>
                    )}

                    {/* Right column: Happy Hour banner + actions */}
                    <div className="flex items-center justify-end gap-2 sm:gap-2.5 shrink-0 ml-auto">
                        {activeRules && activeRules.length > 0 && <HappyHourBanner rules={activeRules} />}
                        {children}
                    </div>
                </div>

                {bottomContent}
            </motion.div>
        </header>
    );
}
