'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

import { AuthService } from '../api/auth.service';
import { ForgotPasswordSchema, type ForgotPasswordDTO } from '@my-app/types';
import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { AuthShell } from './AuthShell';
import { AuthInput } from '@/shared/ui/AuthInput';
import { SmartMailboxButton } from './SmartMailboxButton';

export function ForgotPasswordClient() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const parsed = ForgotPasswordSchema.safeParse({ email });
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? 'Please enter a valid email.');
            return;
        }

        setLoading(true);
        try {
            await AuthService.forgotPassword(parsed.data.email);
            setSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthShell
            side={
                <div className="relative">
                    <div className="rounded-[28px] border border-white/60 bg-white/80 p-10 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
                        <p className={`${display.className} text-[12px] uppercase tracking-[0.2em] text-[#3B82F6]`}>Account recovery</p>
                        <h2 className={`${display.className} mt-3 text-[28px] font-bold leading-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Locked out? We&apos;ve got you.
                        </h2>
                        <p className="mt-4 text-[15px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                            A secure reset link will land in your inbox within seconds. No link after a minute? Check spam or request a fresh one.
                        </p>
                    </div>
                </div>
            }>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}>
                {sent ? (
                    <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#3B82F6]/10">
                            <CheckCircle2 size={32} className="text-[#3B82F6]" />
                        </div>
                        <h1 className={`${display.className} mt-6 text-[30px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Check your email
                        </h1>
                        <p className="mt-2 text-[14.5px] text-[#6B6A65] dark:text-[#94938D]">
                            We sent a reset link to{' '}
                            <span className="font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">{email}</span>. It expires in 15 minutes.
                        </p>

                        <div className="mt-7">
                            <SmartMailboxButton email={email} />
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => setSent(false)}
                                className="flex items-center justify-center gap-1.5 text-[13.5px] font-medium text-[#6B6A65] transition-colors hover:text-[#0A0A0C] dark:text-[#94938D] dark:hover:text-[#F5F4F2]">
                                <ArrowLeft size={15} /> Use a different email
                            </button>
                            <Link
                                href="/login"
                                className="text-[13.5px] font-medium text-[#0A0A0C] transition-colors hover:text-[#3B82F6] dark:text-[#F5F4F2] dark:hover:text-[#3B82F6]">
                                Back to login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className={`${display.className} text-[12px] uppercase tracking-[0.2em] text-[#6B6A65] dark:text-[#94938D]`}>
                            Forgot password
                        </p>
                        <h1 className={`${display.className} mt-3 text-[30px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Reset your password
                        </h1>
                        <p className="mb-7 mt-1.5 text-[14.5px] text-[#6B6A65] dark:text-[#94938D]">
                            Enter the email associated with your account and we&apos;ll send a reset link.
                        </p>

                        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
                            <AuthInput
                                id="email"
                                type="email"
                                label="Email"
                                placeholder="you@venue.com"
                                error={error ?? undefined}
                                autoComplete="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError(null);
                                }}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A0A0C] px-5 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-[#232327] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send reset link <Mail size={16} /></>}
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
