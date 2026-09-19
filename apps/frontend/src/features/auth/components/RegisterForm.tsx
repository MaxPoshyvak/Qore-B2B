'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { RegisterSchema, type RegisterDTO } from '@my-app/types';
import { AuthService } from '../api/auth.service';
import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { AuthInput } from '@/shared/ui/AuthInput';
import { AuthButton } from '@/shared/ui/AuthButton';

export function RegisterForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<RegisterDTO>({
        resolver: zodResolver(RegisterSchema),
        mode: 'onTouched',
    });

    async function onSubmit(values: RegisterDTO) {
        setLoading(true);
        try {
            await AuthService.register(values);
            const res = await signIn('credentials', {
                email: values.email,
                password: values.password,
                redirect: false,
            });
            if (res?.error) {
                setError('root', { message: 'Account created, but sign-in failed. Try logging in.' });
                return;
            }
            router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
            router.refresh();
        } catch (err) {
            setError('root', {
                message: err instanceof Error ? err.message : 'Registration failed. Please try again.',
            });
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
                Create your account
            </h1>
            <p className="mb-7 mt-1.5 text-[14.5px] text-[#6B6A65] dark:text-[#94938D]">
                Launch your first venue in under a minute.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <AuthInput
                    id="name"
                    type="text"
                    label="Name"
                    placeholder="Jane Doe"
                    error={errors.name?.message}
                    autoComplete="name"
                    {...register('name')}
                />
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
                    placeholder="At least 6 characters"
                    error={errors.password?.message}
                    autoComplete="new-password"
                    {...register('password')}
                />

                {errors.root && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/5 px-3.5 py-2.5 text-[13px] text-red-500">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{errors.root.message}</span>
                    </div>
                )}

                <AuthButton loading={loading || isSubmitting}>Create account</AuthButton>
            </form>

            <p className="mt-6 text-center text-[13.5px] text-[#6B6A65] dark:text-[#94938D]">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="font-medium text-[#0A0A0C] transition-colors hover:text-[#3B82F6] dark:text-[#F5F4F2] dark:hover:text-[#3B82F6]">
                    Log in
                </Link>
            </p>
        </motion.div>
    );
}
