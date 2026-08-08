'use client';

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
export const THEME_STORAGE_KEY = 'qore-theme';

export type UseThemeResult = {
    theme: Theme;
    toggle: () => void;
    mounted: boolean;
};

export function useTheme(): UseThemeResult {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        const initial: Theme =
            stored === 'dark' || stored === 'light'
                ? stored
                : window.matchMedia?.('(prefers-color-scheme: light)').matches
                  ? 'light'
                  : 'dark';
        setTheme(initial);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        document.documentElement.classList.toggle('dark', theme === 'dark');
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme, mounted]);

    const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    return { theme, toggle, mounted };
}
