'use client';

import { forwardRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

type AuthInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    label: string;
    error?: string;
    size?: 'md' | 'lg';
};

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
    { label, error, type = 'text', id, className = '', size = 'md', ...props },
    ref,
) {
    const [reveal, setReveal] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (reveal ? 'text' : 'password') : type;

    const sizeClasses =
        size === 'lg'
            ? 'rounded-3xl px-5 py-4 text-[17px] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]'
            : 'rounded-2xl px-4 py-3 text-[15px]';

    return (
        <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#6B6A65] dark:text-[#94938D]">
                {label}
            </span>
            <div className="relative">
                <input
                    ref={ref}
                    id={id}
                    type={inputType}
                    className={`w-full border bg-white text-[#0A0A0C] outline-none transition-colors placeholder:text-[#A8A6A0] dark:bg-[#141417] dark:text-[#F5F4F2] dark:placeholder:text-[#5A5A56] ${
                        error
                            ? 'border-red-400/70 focus:border-red-400'
                            : 'border-[#E7E5E0] focus:border-[#3B82F6]/60 dark:border-[#232327]'
                    } ${sizeClasses} ${isPassword ? 'pr-11' : ''} ${className}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        aria-label={reveal ? 'Hide password' : 'Show password'}
                        onClick={() => setReveal((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A6A0] transition-colors hover:text-[#0A0A0C] dark:hover:text-[#F5F4F2]">
                        {reveal ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            <AnimatePresence initial={false}>
                {error && (
                    <motion.span
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-[12.5px] text-red-500">
                        <AlertCircle size={13} className="shrink-0" />
                        {error}
                    </motion.span>
                )}
            </AnimatePresence>
        </label>
    );
});
