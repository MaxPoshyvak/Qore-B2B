'use client';

import { display } from '@/shared/lib/fonts';

export function Logo() {
    return (
        <a href="#" className="flex items-center gap-2">
            <span
                className="relative flex h-8 w-8 items-center justify-center rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                <span className={`${display.className} text-[14px] font-bold`}>Q</span>
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#FAFAF9] bg-[#10B981] dark:border-[#08080A]" />
            </span>
            <span
                className={`${display.className} text-[16px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                Qore
            </span>
        </a>
    );
}
