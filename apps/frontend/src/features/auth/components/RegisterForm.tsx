'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
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
    const t = useTranslations('auth');
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
                setError('root', { message: t('regFailedSignIn') });
                setLoading(false);
                return;
            }
            router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
            router.refresh();
        } catch (err) {
            setError('root', {
                message: err instanceof Error ? err.message : t('regFailed'),
            });
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
                {t('registerTitle')}
            </h1>
            <p className="mb-7 mt-1.5 text-[14.5px] text-[#6B6A65] dark:text-[#94938D]">
                {t('registerSubtitle')}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <AuthInput
                    id="name"
                    type="text"
                    label={t('name')}
                    placeholder={t('namePlaceholder')}
                    error={errors.name?.message}
                    autoComplete="name"
                    {...register('name')}
                />
                <AuthInput
                    id="email"
                    type="email"
                    label={t('email')}
                    placeholder={t('emailPlaceholder')}
                    error={errors.email?.message}
                    autoComplete="email"
                    {...register('email')}
                />
                <AuthInput
                    id="password"
                    type="password"
                    label={t('password')}
                    placeholder={t('passwordMinPlaceholder')}
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

                <AuthButton loading={loading || isSubmitting}>{t('createAccount')}</AuthButton>
            </form>

            <p className="mt-6 text-center text-[13.5px] text-[#6B6A65] dark:text-[#94938D]">
                {t('alreadyHaveAccount')}{' '}
                <Link
                    href="/login"
                    className="font-medium text-[#0A0A0C] transition-colors hover:text-[#3B82F6] dark:text-[#F5F4F2] dark:hover:text-[#3B82F6]">
                    {t('logIn')}
                </Link>
            </p>
        </motion.div>
    );
}
