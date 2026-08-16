import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => (
        <textarea
            ref={ref}
            className={cn(
                'flex min-h-[80px] w-full rounded-xl border border-[#E7E5E0] bg-white px-3 py-2 text-sm text-[#0A0A0C] outline-none transition-colors',
                'placeholder:text-[#A8A6A0] focus:border-[#3B82F6]/60 focus:ring-2 focus:ring-[#3B82F6]/15',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2] dark:placeholder:text-[#5A5A56]',
                className,
            )}
            {...props}
        />
    ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
