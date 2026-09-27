'use client';

import Link from 'next/link';
import { display } from '@/shared/lib/fonts';
import { cn } from '@/shared/lib/utils';
import { LogoIcon } from './LogoIcon';

export { LogoIcon };

export type LogoProps = {
    className?: string;
    showText?: boolean;
    size?: number;
    href?: string;
};

export function Logo({ className, showText = true, size = 32, href = '/' }: LogoProps) {
    return (
        <Link href={href} className={cn('group flex items-center gap-2.5', className)}>
            <div className="relative shrink-0 transition-transform duration-200 md:group-hover:scale-105">
                <LogoIcon size={size} />
            </div>
            {showText && (
                <span
                    className={`${display.className} text-[16px] font-bold tracking-tight text-[#0A0A0C] transition-colors dark:text-[#F5F4F2]`}>
                    Qore
                </span>
            )}
        </Link>
    );
}
