'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChefHat, Lock, AlertTriangle } from 'lucide-react';

import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { Logo } from '@/shared/ui/Logo';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useTheme } from '@/shared/hooks/useTheme';
import { display, mono } from '@/shared/lib/fonts';
import { useKdsStore } from '@/shared/store/useKdsStore';
import { ApiError } from '@/lib/api-client';
import { useKdsOrders } from '@/features/dashboard-orders/hooks/useOrders';
import { LiveOrdersBoard } from '@/features/dashboard-orders/components/LiveOrdersBoard';
import { KdsLockScreen } from '@/features/dashboard-orders/components/KdsLockScreen';

export default function KdsBoardPage() {
    const { token } = useParams<{ token: string }>();
    const resolvedToken = token ?? '';
    const pin = useKdsStore((s) => s.pin);
    const setPin = useKdsStore((s) => s.setPin);
    const clearPin = useKdsStore((s) => s.clearPin);
    const [unlocked, setUnlocked] = useState(false);
    const [pinError, setPinError] = useState(false);
    const { theme, toggle } = useTheme();

    const kds = useKdsOrders(resolvedToken, pin);

    const kdsError = kds.error instanceof ApiError ? kds.error : null;
    const isInvalidToken = kdsError != null && (kdsError.status === 404 || kdsError.status === 403);

    useEffect(() => {
        if (!pin || !kds.error) return;
        if (kds.error instanceof ApiError && kds.error.status === 401) {
            clearPin();
            setUnlocked(false);
            setPinError(true);
        }
    }, [kds.error, pin, clearPin]);

    function handleUnlock(submittedPin: string) {
        setPinError(false);
        setPin(submittedPin);
        setUnlocked(true);
    }

    function handleLock() {
        clearPin();
        setUnlocked(false);
    }

    // Invalid/expired token: dedicated full-screen error, never reveal the board.
    if (isInvalidToken) {
        return (
            <main className="relative flex min-h-screen items-center justify-center bg-[#FAFAF9] px-6 text-center dark:bg-[#08080A]">
                <AmbientBackground />
                <div className="relative flex max-w-sm flex-col items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg shadow-[#3B82F6]/30">
                        <AlertTriangle size={28} strokeWidth={2.5} />
                    </div>
                    <h1
                        className={`${display.className} mt-5 text-[24px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        Invalid or expired KDS link
                    </h1>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        This kitchen display link is no longer valid. Generate a new KDS link from your
                        venue Settings.
                    </p>
                </div>
            </main>
        );
    }

    const isUnlocked = Boolean(pin) && unlocked;

    return (
        <main className="relative min-h-screen bg-[#FAFAF9] text-[#0A0A0C] antialiased dark:bg-[#08080A] dark:text-[#F5F4F2]">
            <AmbientBackground />

            {!isUnlocked ? (
                <KdsLockScreen token={resolvedToken} onUnlock={handleUnlock} pinError={pinError} />
            ) : (
                <>
                    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#FAFAF9]/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#08080A]/80">
                        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white">
                                    <ChefHat size={18} />
                                </span>
                                <Logo />
                                <span
                                    className={`${mono.className} ml-1 hidden text-[10px] uppercase tracking-widest text-[#04916C] dark:text-[#10B981] sm:inline`}>
                                    Kitchen Display
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ThemeToggle theme={theme} toggle={toggle} />
                                <button
                                    type="button"
                                    onClick={handleLock}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-[13px] font-medium text-[#6B6A65] transition-colors hover:border-[#3B82F6]/40 dark:border-white/15 dark:text-[#94938D]"
                                    aria-label="Lock kitchen display">
                                    <Lock size={14} /> Lock
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="px-6 py-8">
                        <LiveOrdersBoard slug="" tenantId="" kdsToken={resolvedToken} isKds />
                    </div>
                </>
            )}
        </main>
    );
}
