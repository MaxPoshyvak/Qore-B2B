// src/shared/ui/BaseHeader.tsx
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { EASE } from '@/shared/config/animations';

interface BaseHeaderProps {
    children?: ReactNode; // Кнопки/дії справа
    centerContent?: ReactNode; // Навігація по центру (для лендінгу)
    bottomContent?: ReactNode; // Мобільне меню (для лендінгу)
    scrolled?: boolean; // Тінь при скролі
}

export function BaseHeader({ children, centerContent, bottomContent, scrolled = false }: BaseHeaderProps) {
    return (
        <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-6">
            <motion.div
                animate={{
                    boxShadow: scrolled ? '0 12px 40px -16px rgba(10,10,12,0.18)' : '0 0px 0px 0px rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.3, ease: EASE }}
                className="mx-auto max-w-6xl rounded-[2rem] border border-[#E7E5E0]/80 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/40 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 sm:px-5">
                    <Logo />

                    {centerContent && <div className="hidden md:flex">{centerContent}</div>}

                    {/* Права частина (дії) */}
                    <div className="flex items-center gap-2.5">{children}</div>
                </div>

                {bottomContent}
            </motion.div>
        </header>
    );
}
