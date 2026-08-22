'use client';

import { useEffect, useState } from 'react';

/** Returns `true` when the viewport is at least the `md` breakpoint (≥768px). */
export function useIsDesktop(): boolean {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia('(min-width: 768px)');
        const update = () => setIsDesktop(mql.matches);
        update();
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, []);

    return isDesktop;
}
