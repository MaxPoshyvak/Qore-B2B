'use client';

import { useEffect, useState } from 'react';

export type MorphPhase = 'before' | 'cursor-move' | 'click' | 'wave' | 'after' | 'reset';

export function usePhoneDemo() {
    const [phase, setPhase] = useState<MorphPhase>('before');
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];
        const reduced =
            typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        if (reduced) {
            setPhase('after');
            return;
        }

        timers.push(setTimeout(() => setPhase('cursor-move'), 2000));
        timers.push(setTimeout(() => setPhase('click'), 3200));
        timers.push(setTimeout(() => setPhase('wave'), 3400));
        timers.push(setTimeout(() => setPhase('after'), 3400));
        timers.push(
            setTimeout(() => {
                setPhase('before');
                setCycle((c) => c + 1);
            }, 8500),
        );

        return () => timers.forEach(clearTimeout);
    }, [cycle]);

    return { phase, cycle };
}
