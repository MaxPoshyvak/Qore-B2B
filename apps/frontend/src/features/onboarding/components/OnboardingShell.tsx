'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/shared/hooks/useTheme';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { BaseHeader } from '@/shared/ui/BaseHeader';

export function OnboardingShell({ children }: { children: React.ReactNode }) {
    const { theme, toggle, mounted } = useTheme();

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#FAFAF9] text-[#0A0A0C] antialiased dark:bg-[#08080A] dark:text-[#F5F4F2]">
            {/* Animated gradient field */}
            <div className="pointer-events-none absolute inset-0">
                <motion.div
                    className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.22),transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(59,130,246,0.16),transparent_70%)]"
                    animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute right-0 top-1/3 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.20),transparent_70%)] blur-3xl"
                    animate={{ x: [0, -30, 20, 0], y: [0, 25, -15, 0] }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16),transparent_70%)] blur-3xl"
                    animate={{ x: [0, 25, -25, 0], y: [0, -20, 10, 0] }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            {/* Subtle grid */}
            <div className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:56px_56px] dark:bg-[image:linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)]" />

            {/* Vignette to keep content readable */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_38%,transparent_35%,#FAFAF9_100%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_38%,transparent_35%,#08080A_100%)]" />

            <BaseHeader>{mounted && <ThemeToggle theme={theme} toggle={toggle} />}</BaseHeader>

            <main className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-2xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6">
                {children}
            </main>
        </div>
    );
}
