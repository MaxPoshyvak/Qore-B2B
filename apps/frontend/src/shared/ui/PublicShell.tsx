'use client';

import { ReactNode } from 'react';
import { body } from '@/shared/lib/fonts';
import { useTheme } from '@/shared/hooks/useTheme';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { PublicNavbar } from '@/shared/ui/PublicNavbar';
import { PublicFooter } from '@/shared/ui/PublicFooter';

export function PublicShell({ children }: { children: ReactNode }) {
    const { theme, toggle, mounted } = useTheme();

    if (!mounted) return null;

    return (
        <div className={`${body.className} relative min-h-screen text-[#0A0A0C] antialiased dark:text-[#F5F4F2]`}>
            <AmbientBackground />
            <PublicNavbar theme={theme} toggleTheme={toggle} />
            <main className="relative z-10 pt-28 pb-16">{children}</main>
            <PublicFooter />
        </div>
    );
}
