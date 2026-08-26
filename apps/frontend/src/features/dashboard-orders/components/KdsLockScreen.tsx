'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Lock } from 'lucide-react';

import { EASE } from '@/shared/config/animations';
import { display, mono } from '@/shared/lib/fonts';
import { useKdsStore } from '@/shared/store/useKdsStore';

/**
 * Full-screen PIN gate for the isolated KDS. The 4-digit `x-kds-pin` is stored in the
 * Zustand store (sessionStorage) once entered; a wrong PIN is rejected by the API and
 * the caller clears it, bouncing the user back here.
 */
export function KdsLockScreen({
    token,
    onUnlock,
    pinError = false,
}: {
    token: string;
    onUnlock: (pin: string) => void;
    pinError?: boolean;
}) {
    const [digits, setDigits] = useState<string[]>(['', '', '', '']);
    const [error, setError] = useState(false);
    const inputs = useRef<Array<HTMLInputElement | null>>([]);

    const pin = digits.join('');

    function setDigit(index: number, value: string) {
        const next = [...digits];
        next[index] = value;
        setDigits(next);
        setError(false);

        if (value && index < 3) inputs.current[index + 1]?.focus();
    }

    function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            submit();
            return;
        }
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        if (!pasted) return;
        e.preventDefault();
        const next = pasted.split('');
        while (next.length < 4) next.push('');
        setDigits(next);
        setError(false);
        inputs.current[Math.min(pasted.length, 3)]?.focus();
    }

    function submit() {
        if (pin.length !== 4) {
            setError(true);
            return;
        }
        onUnlock(pin);
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FAFAF9] px-6 dark:bg-[#08080A]">
            <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 50% at 20% 20%, rgba(59,130,246,0.08), transparent 70%), radial-gradient(ellipse 50% 60% at 80% 80%, rgba(139,92,246,0.07), transparent 70%)',
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(59,130,246,0.10),transparent_70%)]" />

                <div className="relative flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 18 }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg shadow-[#3B82F6]/30">
                        {error ? <Lock size={28} strokeWidth={2.5} /> : <ChefHat size={28} strokeWidth={2} />}
                    </motion.div>

                    <h1
                        className={`${display.className} mt-5 text-[24px] font-bold leading-tight tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        Enter KDS PIN
                    </h1>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        This kitchen display is locked. Enter the 4-digit PIN from your venue Settings.
                    </p>

                    <div className="mt-7 flex justify-center gap-3">
                        {digits.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => {
                                    inputs.current[i] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                autoFocus={i === 0}
                                maxLength={1}
                                value={digit}
                                onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, '').slice(0, 1))}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={handlePaste}
                                aria-label={`PIN digit ${i + 1}`}
                                className={`h-14 w-12 rounded-2xl border bg-white/70 text-center text-[22px] font-semibold tabular-nums text-[#0A0A0C] outline-none transition-colors focus:border-[#3B82F6]/60 dark:bg-white/[0.04] dark:text-[#F5F4F2] ${
                                    error
                                        ? 'border-red-400/60'
                                        : 'border-[#E7E5E0] dark:border-white/15'
                                }`}
                            />
                        ))}
                    </div>

                    {(error || pinError) && (
                        <p className={`${mono.className} mt-3 text-[11px] uppercase tracking-widest text-red-500`}>
                            {pinError ? 'Incorrect PIN, please try again' : 'Enter the full 4-digit PIN'}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={submit}
                        disabled={pin.length !== 4}
                        className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3.5 text-[14px] font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50">
                        Unlock Kitchen
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
