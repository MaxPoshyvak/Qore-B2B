import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            ref={ref}
            className={cn(
                'flex h-10 w-full rounded-xl border border-[#E7E5E0] bg-white px-3 py-2 text-sm text-[#0A0A0C] outline-none transition-colors',
                'placeholder:text-[#A8A6A0] focus:border-[#3B82F6]/60 focus:ring-2 focus:ring-[#3B82F6]/15',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2] dark:placeholder:text-[#5A5A56]',
                // Native time/date pickers need a slightly taller hit area for the widget.
                type === 'time' && 'h-11',
                className,
            )}
            {...props}
        />
    );
});
Input.displayName = 'Input';

export { Input };
