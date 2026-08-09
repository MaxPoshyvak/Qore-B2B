'use client';

import { useTheme } from '@/shared/hooks/useTheme';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { BaseHeader } from '@/shared/ui/BaseHeader';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';

export function AuthShell({
    children,
    side,
}: {
    children: React.ReactNode;
    side: React.ReactNode;
}) {
    const { theme, toggle, mounted } = useTheme();

    return (
        <div className="relative min-h-screen bg-[#FAFAF9] text-[#0A0A0C] antialiased dark:bg-[#08080A] dark:text-[#F5F4F2]">
            <AmbientBackground />

            <BaseHeader>{mounted && <ThemeToggle theme={theme} toggle={toggle} />}</BaseHeader>

            <main className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:gap-16 lg:px-6">
                <div className="mx-auto w-full max-w-md">{children}</div>
                <div className="hidden lg:block">{side}</div>
            </main>
        </div>
    );
}
