'use client';

import { useRef } from 'react';

import { useIsDesktop } from '@/shared/hooks/useIsDesktop';

export function GlowCard({
    children,
    className = '',
    glow = '59,130,246',
    variant = 'solid',
    disabled = false,
}: {
    children: React.ReactNode;
    className?: string;
    glow?: string;
    variant?: 'solid' | 'glass';
    /** When true (e.g. on touch/mobile), the cursor-following glow is disabled. */
    disabled?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isDesktop = useIsDesktop();
    const isDisabled = disabled || !isDesktop;

    function handleMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect || !ref.current) return;
        ref.current.style.setProperty('--x', `${e.clientX - rect.left}px`);
        ref.current.style.setProperty('--y', `${e.clientY - rect.top}px`);
    }

    const surface =
        variant === 'glass'
            ? 'rounded-[28px] border border-white/60 bg-white/80 backdrop-blur-2xl shadow-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl'
            : 'rounded-3xl border border-[#E7E5E0] bg-white transition-colors duration-300 hover:border-[#3B82F6]/40 dark:border-[#232327] dark:bg-[#141417] dark:hover:border-[#3B82F6]/40';

    return (
        <div
            ref={ref}
            onMouseMove={isDisabled ? undefined : handleMove}
            className={`group relative flex h-full flex-col overflow-hidden ${surface} ${className}`}>
            {!isDisabled && (
                <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(300px circle at var(--x,50%) var(--y,50%), rgba(${glow},0.08), transparent 70%)`,
                    }}
                />
            )}
            <div className="relative flex h-full flex-col">{children}</div>
        </div>
    );
}
