'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { LoginSchema, type LoginDTO } from '@my-app/types';
import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { AuthInput } from '@/shared/ui/AuthInput';
import { AuthButton } from '@/shared/ui/AuthButton';

export function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginDTO>({
        resolver: zodResolver(LoginSchema),
        mode: 'onTouched',
    });

    async function onSubmit(values: LoginDTO) {
        setLoading(true);
        try {
            const res = await signIn('credentials', { ...values, redirect: false });
            if (res?.error) {
                setError('root', { message: 'Invalid email or password.' });
                return;
            }
            router.push('/dashboard');
            router.refresh();
        } catch {
            setError('root', { message: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}>
            <h1
                className={`${display.className} text-[30px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                Welcome back
            </h1>
            <p className="mb-7 mt-1.5 text-[14.5px] text-[#6B6A65] dark:text-[#94938D]">
                Log in to your Qore dashboard.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <AuthInput
                    id="email"
                    type="email"
                    label="Email"
                    placeholder="you@venue.com"
                    error={errors.email?.message}
                    autoComplete="email"
                    {...register('email')}
                />
                <AuthInput
                    id="password"
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    autoComplete="current-password"
                    {...register('password')}
                />

                {errors.root && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/5 px-3.5 py-2.5 text-[13px] text-red-500">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{errors.root.message}</span>
                    </div>
                )}

                <div className="mt-1 flex items-center justify-end">
                    <Link href="/auth/forgot-password" className="text-[13px] text-[#3B82F6] transition-colors hover:text-[#2563EB]">
                        Forgot password?
                    </Link>
                </div>

                <AuthButton loading={loading || isSubmitting}>Log in</AuthButton>
            </form>

            <p className="mt-6 text-center text-[13.5px] text-[#6B6A65] dark:text-[#94938D]">
                New to Qore?{' '}
                <Link
                    href="/register"
                    className="font-medium text-[#0A0A0C] transition-colors hover:text-[#3B82F6] dark:text-[#F5F4F2] dark:hover:text-[#3B82F6]">
                    Create an account
                </Link>
            </p>
        </motion.div>
    );
}
