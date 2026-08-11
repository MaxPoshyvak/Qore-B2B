'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Based on `HTMLMotionProps` rather than `ButtonHTMLAttributes`: Framer Motion
// redefines the drag event handlers, so the two prop sets are incompatible.
// `children` is narrowed back to `ReactNode` since motion widens it with `MotionValue`.
type PrimaryButtonProps = Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> & {
    children?: React.ReactNode;
    loading?: boolean;
    size?: 'sm' | 'md';
    icon?: React.ReactNode;
};

/** Primary call-to-action styled with the brand blue → purple gradient. */
export function PrimaryButton({
    children,
    loading = false,
    size = 'md',
    icon,
    className = '',
    disabled,
    ...props
}: PrimaryButtonProps) {
    const sizeClasses = size === 'sm' ? 'gap-1.5 rounded-xl px-3 py-2 text-sm' : 'gap-2 rounded-2xl px-5 py-3 text-sm';

    return (
        <motion.button
            whileHover={disabled || loading ? undefined : { scale: 1.02 }}
            whileTap={disabled || loading ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses} ${className}`}
            {...props}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
            {children}
        </motion.button>
    );
}

/** Neutral secondary action that sits next to a `PrimaryButton`. */
export function SecondaryButton({
    children,
    size = 'md',
    className = '',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: 'sm' | 'md' }) {
    const sizeClasses = size === 'sm' ? 'rounded-xl px-3 py-2 text-sm' : 'rounded-2xl px-5 py-3 text-sm';

    return (
        <button
            className={`inline-flex items-center justify-center border border-black/10 bg-white/60 font-medium text-[#0A0A0C] transition-colors hover:border-black/20 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-[#F5F4F2] dark:hover:border-white/20 dark:hover:bg-white/10 ${sizeClasses} ${className}`}
            {...props}>
            {children}
        </button>
    );
}
