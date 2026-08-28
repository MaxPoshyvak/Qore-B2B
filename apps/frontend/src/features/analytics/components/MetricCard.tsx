import type { LucideIcon } from 'lucide-react';
import { display, mono } from '@/shared/lib/fonts';

type Accent = 'blue' | 'violet' | 'green' | 'amber';

const ACCENTS: Record<Accent, { icon: string; bar: string }> = {
    blue: { icon: 'bg-[#3B82F6]/10 text-[#3B82F6]', bar: 'bg-[#3B82F6]' },
    violet: { icon: 'bg-[#8B5CF6]/15 text-[#8B5CF6]', bar: 'bg-[#8B5CF6]' },
    green: { icon: 'bg-[#04916C]/10 text-[#04916C] dark:text-[#10B981]', bar: 'bg-[#04916C] dark:bg-[#10B981]' },
    amber: { icon: 'bg-[#F59E0B]/10 text-[#F59E0B]', bar: 'bg-[#F59E0B]' },
};

export function MetricCard({
    label,
    value,
    icon: Icon,
    accent = 'blue',
}: {
    label: string;
    value: string;
    icon: LucideIcon;
    accent?: Accent;
}) {
    const tones = ACCENTS[accent];

    return (
        <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/80 px-6 pb-7 pt-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl">
            <div
                className={`absolute inset-x-0 top-0 h-px opacity-70 ${tones.bar}`}
                style={{ background: 'linear-gradient(to right, transparent, currentColor, transparent)' }}
            />
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones.icon}`}>
                <Icon size={20} strokeWidth={1.9} />
            </div>
            <p
                className={`${mono.className} mt-5 text-[10.5px] uppercase tracking-wider text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                {label}
            </p>
            <p
                className={`${display.className} mt-1 text-[28px] font-bold tabular-nums text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                {value}
            </p>
        </div>
    );
}
