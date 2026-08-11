'use client';

import { forwardRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

type FormTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    error?: string;
};

/** Multiline counterpart to `AuthInput`, sharing its look and error affordance. */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(function FormTextarea(
    { label, error, className = '', ...props },
    ref,
) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#6B6A65] dark:text-[#94938D]">{label}</span>
            <textarea
                ref={ref}
                className={`w-full resize-none rounded-2xl border bg-white px-4 py-3 text-[15px] text-[#0A0A0C] outline-none transition-colors placeholder:text-[#A8A6A0] dark:bg-[#141417] dark:text-[#F5F4F2] dark:placeholder:text-[#5A5A56] ${
                    error
                        ? 'border-red-400/70 focus:border-red-400'
                        : 'border-[#E7E5E0] focus:border-[#3B82F6]/60 dark:border-[#232327]'
                } ${className}`}
                {...props}
            />
            <AnimatePresence initial={false}>
                {error && (
                    <motion.span
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-xs text-red-500">
                        <AlertCircle size={13} className="shrink-0" />
                        {error}
                    </motion.span>
                )}
            </AnimatePresence>
        </label>
    );
});

type FormToggleProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    label: string;
    description?: string;
};

/** Checkbox rendered as a switch, compatible with React Hook Form's `register`. */
export const FormToggle = forwardRef<HTMLInputElement, FormToggleProps>(function FormToggle(
    { label, description, className = '', ...props },
    ref,
) {
    return (
        <label
            className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/5 ${className}`}>
            <span>
                <span className="block text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">{label}</span>
                {description && (
                    <span className="mt-0.5 block text-xs text-[#6B6A65] dark:text-[#94938D]">{description}</span>
                )}
            </span>
            <span className="relative inline-flex shrink-0 items-center">
                <input
                    ref={ref}
                    type="checkbox"
                    className="peer h-6 w-11 cursor-pointer appearance-none rounded-full bg-black/15 transition-colors checked:bg-gradient-to-r checked:from-[#3B82F6] checked:to-[#8B5CF6] dark:bg-white/15"
                    {...props}
                />
                <span className="pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-5" />
            </span>
        </label>
    );
});
