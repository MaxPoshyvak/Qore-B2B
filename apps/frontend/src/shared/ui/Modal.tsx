'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { EASE } from '@/shared/config/animations';
import { display } from '@/shared/lib/fonts';

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
};

/** Generic animated dialog: blurred backdrop, escape-to-close, scroll lock. */
export function Modal({ open, onClose, title, description, children }: ModalProps) {
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
                <div key="modal-root" className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#08080A]/60 backdrop-blur-sm"
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.98 }}
                        transition={{ duration: 0.28, ease: EASE }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-black/10 bg-white/90 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#121215]/95">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/40 to-transparent" />

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

                        <div className="mt-5">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
