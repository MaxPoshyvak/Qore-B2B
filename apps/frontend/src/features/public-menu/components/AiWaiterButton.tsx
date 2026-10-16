'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

type AiWaiterButtonProps = {
    hasCartItems: boolean;
    isOpen: boolean;
    onClick: () => void;
    isCartDrawerOpen?: boolean;
    isDishModalOpen?: boolean;
};

export function AiWaiterButton({
    hasCartItems,
    isOpen,
    onClick,
    isCartDrawerOpen = false,
    isDishModalOpen = false,
}: AiWaiterButtonProps) {
    const t = useTranslations('publicMenu.aiWaiter');

    // Hide FAB when modal, drawer, or dish details are open
    const isVisible = !isOpen && !isCartDrawerOpen && !isDishModalOpen;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ scale: 0.3, opacity: 0, y: 32, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                    exit={{ scale: 0.4, opacity: 0, y: 20, rotate: 8 }}
                    transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 22,
                        mass: 0.75,
                    }}
                    whileTap={{ scale: 0.94 }}
                    style={{
                        bottom: hasCartItems ? 108 : 20,
                    }}
                    className="fixed right-4 sm:right-6 z-40 transition-[bottom] duration-300 ease-out group">
                    {/* Ambient glowing aura / pulse */}
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 opacity-60 blur-md transition-opacity duration-300 animate-pulse [@media(hover:hover)]:group-hover:opacity-90"
                    />

                    <button
                        type="button"
                        onClick={onClick}
                        className="relative flex h-9.5 items-center gap-2 overflow-hidden rounded-full border border-white/30 bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 px-3.5 text-white shadow-lg shadow-violet-600/30 backdrop-blur-xl transition-all active:scale-95 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-xl [@media(hover:hover)]:hover:shadow-violet-600/40"
                        aria-label={t('button')}>
                        {/* Shimmer light sweep */}
                        <motion.span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 -translate-x-full rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{
                                repeat: Infinity,
                                duration: 3.5,
                                ease: 'easeInOut',
                                repeatDelay: 1.5,
                            }}
                        />

                        {/* Twinkling Sparkles icon */}
                        <motion.div
                            animate={{
                                rotate: [0, -12, 12, -6, 0],
                                scale: [1, 1.2, 0.95, 1.15, 1],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 3,
                                ease: 'easeInOut',
                                repeatDelay: 1.2,
                            }}
                            className="relative flex items-center justify-center">
                            <Sparkles className="h-3.5 w-3.5 text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]" />
                        </motion.div>

                        <span className="relative hidden text-xs font-medium tracking-tight sm:inline">
                            {t('button')}
                        </span>
                        <span className="relative text-[11px] font-semibold uppercase tracking-wider sm:hidden">
                            AI
                        </span>

                        <span className="relative rounded-full bg-white/20 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-white">
                            {t('proBadge')}
                        </span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
