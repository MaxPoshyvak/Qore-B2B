'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { AuthService } from '../api/auth.service';
import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { AuthShell } from './AuthShell';
import { AuthInput } from '@/shared/ui/AuthInput';

export function ResetPasswordClient() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get('token') ?? '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (!token) {
            setError('This reset link is missing or invalid.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await AuthService.resetPassword({ token, newPassword });
            setDone(true);
            setTimeout(() => {
                router.push('/login');
                router.refresh();
            }, 1800);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <AuthShell
                side={
                    <div className="rounded-[28px] border border-white/60 bg-white/80 p-10 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
                        <p className={`${display.className} text-[12px] uppercase tracking-[0.2em] text-[#3B82F6]`}>Password reset</p>
                        <h2 className={`${display.className} mt-3 text-[28px] font-bold leading-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Secure by design.
                        </h2>
                        <p className="mt-4 text-[15px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                            Reset links are single-use and expire after 15 minutes to keep your workspace safe.
                        </p>
                    </div>
                }>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}>
                    <h1 className={`${display.className} text-[30px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        Invalid or expired link
                    </h1>
                    <p className="mt-2 text-[14.5px] text-[#6B6A65] dark:text-[#94938D]">
                        This password reset link is missing, invalid, or has already been used.
                    </p>
                    <Link
                        href="/forgot-password"
                        className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A0A0C] px-5 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-[#232327] dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white">
                        Request a new link
                    </Link>
                </motion.div>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            side={
                <div className="rounded-[28px] border border-white/60 bg-white/80 p-10 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
                    <p className={`${display.className} text-[12px] uppercase tracking-[0.2em] text-[#3B82F6]`}>Password reset</p>
                    <h2 className={`${display.className} mt-3 text-[28px] font-bold leading-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                        Choose a strong password.
                    </h2>
                    <p className="mt-4 text-[15px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                        Use at least 6 characters. We recommend a mix of letters, numbers, and symbols.
                    </p>
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
                            Password updated
                        </h1>
                        <p className="mt-2 text-[14.5px] text-[#6B6A65] dark:text-[#94938D]">
                            Redirecting you to login…
                        </p>
                        <div className="mt-6 flex justify-center">
                            <Loader2 size={20} className="animate-spin text-[#6B6A65]" />
                        </div>
                    </div>
                ) : (
                    <>
                        <p className={`${display.className} flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#6B6A65] dark:text-[#94938D]`}>
                            <KeyRound size={14} /> Set new password
                        </p>
                        <h1 className={`${display.className} mt-3 text-[30px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Create a new password
                        </h1>
                        <p className="mb-7 mt-1.5 text-[14.5px] text-[#6B6A65] dark:text-[#94938D]">
                            Enter a new password for your Qore account.
                        </p>

                        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
                            <AuthInput
                                id="newPassword"
                                type="password"
                                label="New password"
                                placeholder="••••••••"
                                error={error ?? undefined}
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setError(null);
                                }}
                            />
                            <AuthInput
                                id="confirmPassword"
                                type="password"
                                label="Confirm password"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError(null);
                                }}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A0A0C] px-5 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-[#232327] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset password'}
                            </button>
                        </form>

                        <Link
                            href="/login"
                            className="mt-6 flex items-center justify-center gap-1.5 text-[13.5px] font-medium text-[#6B6A65] transition-colors hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2]">
                            <ArrowLeft size={15} /> Back to login
                        </Link>
                    </>
                )}
            </motion.div>
        </AuthShell>
    );
}
