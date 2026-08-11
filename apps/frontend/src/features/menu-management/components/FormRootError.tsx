'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

import { EASE } from '@/shared/config/animations';

/**
 * Renders the form-level API error.
 *
 * Per the project auth/state rules, `errors.root` is the single source of
 * truth for global API failures inside React Hook Form.
 */
export function FormRootError({ message }: { message?: string }) {
    return (
        <AnimatePresence initial={false}>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="flex items-center gap-2 overflow-hidden rounded-xl border border-red-400/30 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-500">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
