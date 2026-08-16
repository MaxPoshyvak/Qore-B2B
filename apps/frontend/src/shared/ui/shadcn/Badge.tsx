import * as React from 'react';
import { cn } from '@/shared/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

const badgeVariants: Record<BadgeVariant, string> = {
    default:
        'border-transparent bg-[#3B82F6]/10 text-[#2563EB] dark:bg-[#3B82F6]/15 dark:text-[#93C5FD]',
    secondary:
        'border-transparent bg-black/[0.06] text-[#6B6A65] dark:bg-white/[0.08] dark:text-[#94938D]',
    outline: 'border-black/10 text-[#0A0A0C] dark:border-white/15 dark:text-[#F5F4F2]',
    destructive:
        'border-transparent bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                badgeVariants[variant],
                className,
            )}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
