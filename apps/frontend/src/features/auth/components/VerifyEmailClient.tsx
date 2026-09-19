'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2, RotateCw, ShieldCheck } from 'lucide-react';

import { AuthService } from '../api/auth.service';
import { display, mono } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { AuthShell } from './AuthShell';
import { OtpInput } from './OtpInput';
import { SmartMailboxButton } from './SmartMailboxButton';

const RESEND_COOLDOWN = 30;

export function VerifyEmailClient() {
    const router = useRouter();
    const params = useSearchParams();
    const email = params.get('email') ?? '';
    const status = params.get('status'); // 'verified' | 'invalid' | 'error'

    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [done, setDone] = useState(status === 'verified');

    const timer = useRef<ReturnType<typeof setInterval> | null>(null);

    const startCooldown = useCallback(() => {
        setCooldown(RESEND_COOLDOWN);
        timer.current = setInterval(() => {
            setCooldown((c) => {
                if (c <= 1 && timer.current) clearInterval(timer.current);
                return c - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        return () => {
            if (timer.current) clearInterval(timer.current);
        };
    }, []);

    async function handleVerify(codeToVerify: string) {
        if (!email) {
            setError('We lost your email address. Please sign up again.');
            return;
        }
        setVerifying(true);
        setError(null);
        try {
            await AuthService.verifyOtp({ email, code: codeToVerify });
            setDone(true);
            router.push('/onboarding');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed');
            setCode('');
        } finally {
            setVerifying(false);
        }
    }

    async function handleResend() {
        if (!email || cooldown > 0) return;
        setResending(true);
        setError(null);
        try {
            await AuthService.resendCode(email);
            startCooldown();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not resend code');
        } finally {
            setResending(false);
        }
    }

    return (
        <AuthShell
            side={
                <div className="relative">
                    <div className="rounded-[28px] border border-white/60 bg-white/80 p-10 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
                        <p className={`${mono.className} text-[12px] uppercase tracking-[0.2em] text-[#6B6A65] dark:text-[#94938D]`}>
                            Step 02
                        </p>
                        <h2 className={`${display.className} mt-3 text-[28px] font-bold leading-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Your venue is almost live.
                        </h2>
                        <p className="mt-4 text-[15px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                            Verify your email to unlock your dashboard, invite teammates, and publish your first digital menu.
                        </p>
                        <div className="mt-8 space-y-3">
                            {['One-click magic link', '6-digit fallback code', 'Smart inbox redirect'].map((f) => (
                                <div key={f} className="flex items-center gap-3 text-[14px] text-[#0A0A0C] dark:text-[#F5F4F2]">
                                    <ShieldCheck size={18} className="text-[#3B82F6]" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}>
                {done ? (
                    <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#3B82F6]/10">
                            <CheckCircle2 size={32} className="text-[#3B82F6]" />
                        </div>
                        <h1 className={`${display.className} mt-6 text-[30px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Email verified
                        </h1>
                        <p className="mt-2 text-[14.5px] text-[#6B6A65] dark:text-[#94938D]">
                            Taking you to your workspace…
                        </p>
                        <div className="mt-6 flex justify-center">
                            <Loader2 size={20} className="animate-spin text-[#6B6A65]" />
                        </div>
                    </div>
                ) : (
                    <>
                        <p className={`${mono.className} text-[12px] uppercase tracking-[0.2em] text-[#6B6A65] dark:text-[#94938D]`}>
                            Confirm your email
                        </p>
                        <h1 className={`${display.className} mt-3 text-[30px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Enter your code
                        </h1>
                        <p className="mb-7 mt-1.5 text-[14.5px] text-[#6B6A65] dark:text-[#94938D]">
                            We sent a 6-digit code to{' '}
                            <span className="font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">{email || 'your email'}</span>.
                        </p>

                        <OtpInput
                            value={code}
                            onChange={(next) => {
                                setCode(next);
                                setError(null);
                            }}
                            onComplete={handleVerify}
                            disabled={verifying}
                            error={!!error}
                        />

                        {error && (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/5 px-3.5 py-2.5 text-[13px] text-red-500">
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => handleVerify(code)}
                            disabled={verifying || code.length < 6}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A0A0C] px-5 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-[#232327] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white">
                            {verifying ? <Loader2 size={18} className="animate-spin" /> : <>Verify & continue <ArrowRight size={18} /></>}
                        </button>

                        <div className="my-6 flex items-center gap-3">
                            <span className="h-px flex-1 bg-[#E7E5E0] dark:bg-[#232327]" />
                            <span className={`${mono.className} text-[11px] uppercase tracking-[0.18em] text-[#A8A6A0]`}>or</span>
                            <span className="h-px flex-1 bg-[#E7E5E0] dark:bg-[#232327]" />
                        </div>

                        {email && <SmartMailboxButton email={email} />}

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending || cooldown > 0}
                            className="mt-4 flex w-full items-center justify-center gap-2 text-[13.5px] font-medium text-[#6B6A65] transition-colors hover:text-[#0A0A0C] disabled:opacity-60 dark:text-[#94938D] dark:hover:text-[#F5F4F2]">
                            <RotateCw size={15} className={resending ? 'animate-spin' : ''} />
                            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Didn’t get it? Resend code'}
                        </button>
                    </>
                )}
            </motion.div>
        </AuthShell>
    );
}
