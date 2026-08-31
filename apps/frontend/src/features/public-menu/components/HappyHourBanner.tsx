'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

import { formatRemainingTime, type ActiveHappyHourRule } from '../hooks/usePublicHappyHour';

type HappyHourBannerProps = {
    rules: ActiveHappyHourRule[];
};

/**
 * Компактний пілбейдж Happy Hour, що рендериться ВСЕРЕДИНІ шапки (BaseHeader)
 * поряд з лого/діями.
 * Адаптований: на мобільних приховує назву і залишає лише таймер, щоб не ламати хедер.
 */
export function HappyHourBanner({ rules }: HappyHourBannerProps) {
    if (rules.length === 0) return null;

    const primary = rules[0];

    const [mounted, setMounted] = useState(false);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        setMounted(true);
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const msLeft = mounted ? Math.max(0, primary.endsAtMs - now) : Math.max(0, primary.endsAtMs - Date.now());

    return (
        <div className="flex max-w-[130px] sm:max-w-none items-center gap-1.5 sm:gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-[#F59E0B] backdrop-blur-md">
            <Sparkles size={12} strokeWidth={2.4} className="shrink-0" />
            <span className="truncate tabular-nums">
                {/* На телефоні приховуємо назву, на планшеті/ПК - показуємо */}
                <span className="hidden md:inline">{primary.name}: </span>
                {formatRemainingTime(msLeft)}
            </span>
        </div>
    );
}
