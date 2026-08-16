import * as React from 'react';
import { cn } from '@/shared/lib/utils';

const Avatar = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
    ({ className, ...props }, ref) => (
        <span
            ref={ref}
            className={cn(
                'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
                className,
            )}
            {...props}
        />
    ),
);
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
    ({ className, ...props }, ref) => (
        <img
            ref={ref}
            className={cn('aspect-square h-full w-full object-cover', className)}
            {...props}
        />
    ),
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
    ({ className, ...props }, ref) => (
        <span
            ref={ref}
            className={cn(
                'flex h-full w-full items-center justify-center rounded-full bg-black/[0.06] text-xs font-medium text-[#6B6A65] dark:bg-white/[0.08] dark:text-[#94938D]',
                className,
            )}
            {...props}
        />
    ),
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
