'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';
import { cn } from '@/shared/lib/utils';

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    scrollable?: boolean;
    className?: string;
    maxHeightClass?: string;
};

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    scrollable = false,
    className = 'max-w-md',
    maxHeightClass = 'max-h-[85vh]',
}: ModalProps) {
    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose();
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        layout
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.98 }}
                        // Розділяємо анімації: поява/зникнення (opacity) і плавна зміна розміру (layout spring)
                        transition={{
                            layout: { type: 'spring', bounce: 0, duration: 0.4 },
                            default: { duration: 0.2, ease: EASE },
                        }}
                        className={cn(
                            // ВИДАЛЕНО: transition-transform duration-75 та overflow-y-scroll
                            'relative flex flex-col overflow-y-scroll rounded-3xl bg-white/80 backdrop-blur-2xl shadow-xl dark:bg-[#121215]/95 border border-black/10 dark:border-white/10',
                            className || 'max-w-md',
                            scrollable ? maxHeightClass : 'max-h-[85vh]',
                        )}>
                        {/* layout="position" гарантує, що контент шапки лише зміщується, але не розтягується (scale) */}
                        <motion.div layout="position" className="shrink-0 p-6 pb-4 border-b border-white/10">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2
                                        className={`${display.className} text-lg font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                                        {title}
                                    </h2>
                                    {description && (
                                        <p className="mt-1 text-sm text-[#6B6A65] dark:text-[#94938D]">{description}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close dialog"
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#6B6A65] transition-colors hover:border-black/20 hover:text-[#0A0A0C] dark:border-white/10 dark:text-[#94938D] dark:hover:border-white/20 dark:hover:text-[#F5F4F2]">
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Аналогічно layout="position" для тіла модалки */}
                        <motion.div
                            layout="position"
                            className={cn(
                                'flex-1 min-h-0 overflow-y-auto p-6',
                                scrollable && '[&::-webkit-scrollbar]:hidden [scrollbar-width:none]',
                            )}>
                            {children}
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
