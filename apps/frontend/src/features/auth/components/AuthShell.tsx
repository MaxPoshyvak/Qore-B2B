'use client';

import { useTheme } from '@/shared/hooks/useTheme';
import { Logo } from '@/shared/ui/Logo';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
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

            <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-6">
                <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-[#E7E5E0]/80 bg-white/70 px-4 py-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-black/40 sm:px-5">
                    <Logo />
                    {mounted && <ThemeToggle theme={theme} toggle={toggle} />}
                </div>
            </header>

            <main className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:gap-16 lg:px-6">
                <div className="mx-auto w-full max-w-md">{children}</div>
                <div className="hidden lg:block">{side}</div>
            </main>
        </div>
    );
}
