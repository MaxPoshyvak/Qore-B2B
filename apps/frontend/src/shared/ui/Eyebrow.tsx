'use client';

import { mono } from '@/shared/lib/fonts';

export function Eyebrow({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'violet' | 'green' }) {
    const colors = {
        blue: 'text-[#3B82F6]',
        violet: 'text-[#8B5CF6]',
        green: 'text-[#04916C] dark:text-[#10B981]',
    } as const;
    const lines = {
        blue: 'bg-[#3B82F6]',
        violet: 'bg-[#8B5CF6]',
        green: 'bg-[#04916C] dark:bg-[#10B981]',
    } as const;
    return (
        <div
            className={`${mono.className} mb-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] ${colors[tone]}`}>
            <span className={`h-px w-6 ${lines[tone]}`} />
            {children}
        </div>
    );
}
