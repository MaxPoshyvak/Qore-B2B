'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

import type { Theme } from '@/shared/hooks/useTheme';

export function ThemeToggle({
    theme,
    toggle,
    className = '',
}: {
    theme: Theme;
    toggle: () => void;
    className?: string;
}) {
    return (
        <motion.button
            type="button"
            onClick={toggle}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E7E5E0] text-[#6B6A65] transition-colors hover:border-[#3B82F6]/40 hover:text-[#0A0A0C] dark:border-[#232327] dark:text-[#94938D] dark:hover:border-[#3B82F6]/40 dark:hover:text-[#F5F4F2] ${className}`}>
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={theme}
                    initial={{ opacity: 0, rotate: -90, scale: 0.3 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.3 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="flex items-center justify-center">
                    {theme === 'dark' ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
                </motion.span>
            </AnimatePresence>
        </motion.button>
    );
}
