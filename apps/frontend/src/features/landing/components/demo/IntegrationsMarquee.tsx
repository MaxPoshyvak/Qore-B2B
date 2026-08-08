'use client';

import { mono } from '../../lib/fonts';
import { INTEGRATIONS } from '../../config/landing-data';

export function IntegrationsMarquee() {
    return (
        <div className="overflow-hidden border-y border-[#E7E5E0] bg-[#F2F1EE] py-5 dark:border-[#232327] dark:bg-[#0F0F12]">
            <div className="flex w-max animate-[marquee_26s_linear_infinite] gap-14">
                {[...INTEGRATIONS, ...INTEGRATIONS].map((it, i) => (
                    <span
                        key={i}
                        className={`${mono.className} flex items-center gap-3 whitespace-nowrap text-[13px] uppercase tracking-widest text-[#6B6A65]/70 dark:text-[#94938D]/60`}>
                        <span className="h-1 w-1 rounded-full bg-[#3B82F6]/60" />
                        {it}
                    </span>
                ))}
            </div>
        </div>
    );
}
