'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { usePlatformLogin } from '../hooks/usePlatformAdmin';
import { EASE } from '@/shared/config/animations';
import { Logo } from '@/shared/ui/Logo';

export function PlatformLoginCard({ onSuccess }: { onSuccess: () => void }) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loginMutation = usePlatformLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) return;

        setErrorMessage(null);
        try {
            await loginMutation.mutateAsync(password);
            onSuccess();
        } catch (err: any) {
            setErrorMessage(err?.message || 'Access denied. Invalid master key.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-[#0A0A0C] text-[#F5F4F2]">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="w-full max-w-md rounded-3xl border border-white/10 bg-[#141417]/90 p-8 shadow-2xl backdrop-blur-2xl">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                        <Logo />
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                        <ShieldCheck size={13} />
                        Founder Cockpit
                    </div>
                    <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
                        Platform Security Gate
                    </h1>
                    <p className="mt-1.5 text-xs text-[#94938D]">
                        Enter your private Master Key to access platform metrics, traffic, and subscription data.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#94938D]">
                            Master Access Key
                        </label>
                        <div className="relative mt-2">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6B6A65]">
                                <Lock size={16} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Paste your cryptographic master key"
                                autoFocus
                                required
                                className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-10 pr-12 text-sm text-white placeholder:text-[#6B6A65] focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#6B6A65] hover:text-white transition-colors"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
                            {errorMessage}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loginMutation.isPending || !password.trim()}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50">
                        {loginMutation.isPending ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            'Authorize Session'
                        )}
                    </button>
                </form>

                <div className="mt-8 border-t border-white/5 pt-4 text-center">
                    <span className="text-[11px] text-[#6B6A65]">
                        Brute-force protected. 10 attempts per minute limit.
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
