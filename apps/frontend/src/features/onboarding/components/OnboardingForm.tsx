'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Link2, Loader2, Rocket, Wand2 } from 'lucide-react';

import { CreateTenantSchema, type CreateTenantDTO } from '@my-app/types';
import { cyrillicToSlug } from '@/shared/lib/utils';
import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { useCreateTenant } from '../hooks/useTenants';
import { AuthInput } from '@/shared/ui/AuthInput';

type Phase = 'idle' | 'loading' | 'success';

const SLUG_TAKEN_PATTERN = /slug|вже зайнята|already taken/i;

function sanitizeSlug(value: string): string {
    return value
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function OnboardingForm() {
    const router = useRouter();
    const { mutateAsync: createTenant } = useCreateTenant();

    const [phase, setPhase] = useState<Phase>('idle');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [isAutoGenerating, setIsAutoGenerating] = useState(false);

    const autoGenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        formState: { errors, isSubmitted },
    } = useForm<CreateTenantDTO>({
        resolver: zodResolver(CreateTenantSchema),
        mode: 'onSubmit',
        defaultValues: { name: '', slug: '' },
    });

    const name = watch('name') || '';
    const hasName = name.trim().length > 0;

    useEffect(() => {
        if (isSlugManuallyEdited) return;
        setValue('slug', cyrillicToSlug(name), { shouldValidate: false });
    }, [name, isSlugManuallyEdited, setValue]);

    useEffect(() => {
        return () => {
            if (autoGenTimeoutRef.current) clearTimeout(autoGenTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (phase !== 'success') return;
        const t = setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
        }, 1500);
        return () => clearTimeout(t);
    }, [phase, router]);

    const slugReg = register('slug');

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const clean = sanitizeSlug(e.target.value);
        e.target.value = clean;

        clearErrors('slug');

        if (autoGenTimeoutRef.current) {
            clearTimeout(autoGenTimeoutRef.current);
            autoGenTimeoutRef.current = null;
        }

        if (clean === '') {
            slugReg.onChange(e);

            if (hasName) {
                autoGenTimeoutRef.current = setTimeout(() => {
                    setIsSlugManuallyEdited(false);
                    setIsAutoGenerating(true);

                    const newSlug = cyrillicToSlug(name);
                    setValue('slug', newSlug, { shouldValidate: false });

                    setTimeout(() => setIsAutoGenerating(false), 600);
                }, 300);
            } else {
                setIsSlugManuallyEdited(false);
            }
        } else {
            setIsSlugManuallyEdited(true);
            slugReg.onChange(e);
        }
    };

    async function onSubmit(values: CreateTenantDTO) {
        if (phase !== 'idle') return;

        setFormError(null);
        clearErrors('slug');
        setPhase('loading');

        try {
            await createTenant(values);
            setPhase('success');
        } catch (err) {
            setPhase('idle');
            const message = err instanceof Error ? err.message : 'Failed to create your venue. Try again.';

            if (SLUG_TAKEN_PATTERN.test(message)) {
                setError('slug', {
                    message: 'This address is already taken — please pick another.',
                });
                return;
            }
            setFormError(message);
        }
    }

    const hasSlugError = Boolean(errors.slug && isSubmitted);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="w-full">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#04916C]/20 bg-[#04916C]/5 px-3 py-1 text-[12px] font-medium text-[#04916C] dark:text-[#10B981]">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#04916C] dark:bg-[#10B981]" />
                Onboarding — one last step
            </div>

            <h1
                className={`${display.className} text-[40px] font-bold leading-[1.02] tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-[52px]`}>
                Name your{' '}
                <span className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                    venue
                </span>
            </h1>
            <p className="mx-auto mb-9 mt-3 max-w-md text-[16px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                This is where your space goes live. Pick a name — we&apos;ll craft the rest.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
                <AuthInput
                    id="name"
                    type="text"
                    label="Venue name"
                    placeholder="e.g. My Awesome Venue"
                    error={errors.name?.message}
                    size="lg"
                    autoFocus
                    autoComplete="organization"
                    {...register('name')}
                />

                <AnimatePresence initial={false}>
                    {hasName && (
                        <motion.div
                            key="badge"
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="overflow-hidden">
                            <motion.div
                                animate={
                                    isAutoGenerating
                                        ? {
                                              scale: [1, 1.015, 1],
                                              borderColor: [
                                                  'rgba(59,130,246,0.2)',
                                                  'rgba(59,130,246,0.6)',
                                                  'rgba(59,130,246,0.2)',
                                              ],
                                          }
                                        : {}
                                }
                                transition={{ duration: 0.4 }}
                                className={`flex items-center gap-0 rounded-2xl border px-4 py-3 text-[14px] transition-colors ${
                                    hasSlugError
                                        ? 'border-red-400/50 bg-red-500/5'
                                        : 'border-[#3B82F6]/20 bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10'
                                }`}>
                                <div className="relative mr-2 flex h-4 w-4 shrink-0 items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        {isAutoGenerating ? (
                                            <motion.div
                                                key="wand"
                                                initial={{ scale: 0, rotate: -45 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 45 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                                className="absolute">
                                                <Wand2 size={16} className="text-[#3B82F6]" strokeWidth={2.5} />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="link"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute">
                                                <Link2
                                                    size={16}
                                                    className={hasSlugError ? 'text-red-500' : 'text-[#3B82F6]'}
                                                    strokeWidth={2}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <span className="whitespace-nowrap text-[#6B6A65] dark:text-[#94938D]">
                                    useqore.app/
                                </span>

                                <div className="w-full relative overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={isAutoGenerating ? 'auto-slug' : 'user-slug'}
                                            initial={isAutoGenerating ? { y: 12, opacity: 0 } : false}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                                            className="w-full">
                                            <input
                                                {...slugReg}
                                                id="slug"
                                                type="text"
                                                autoComplete="off"
                                                spellCheck={false}
                                                placeholder="your-venue"
                                                onChange={handleSlugChange}
                                                className={`w-full bg-transparent font-semibold outline-none placeholder:text-[#A8A6A0] dark:placeholder:text-[#5A5A56] ${
                                                    hasSlugError ? 'text-red-500' : 'text-[#0A0A0C] dark:text-[#F5F4F2]'
                                                }`}
                                            />
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </motion.div>

                            <AnimatePresence initial={false}>
                                {hasSlugError && (
                                    <motion.span
                                        initial={{ opacity: 0, y: -4, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -4, height: 0 }}
                                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                        className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-[12.5px] text-red-500">
                                        <AlertCircle size={13} className="shrink-0" />
                                        {errors.slug?.message}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                    {formError && (
                        <motion.div
                            initial={{ opacity: 0, y: -6, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -6, height: 0 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="flex items-center gap-2 overflow-hidden rounded-xl border border-red-400/30 bg-red-500/5 px-3.5 py-2.5 text-[13px] text-red-500">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{formError}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-3 flex justify-center">
                    <motion.button
                        type="submit"
                        disabled={phase !== 'idle'}
                        animate={{
                            width: phase === 'idle' ? '100%' : 56,
                            borderRadius: phase === 'idle' ? 16 : 999,
                        }}
                        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                        whileTap={phase === 'idle' ? { scale: 0.98 } : undefined}
                        className="relative flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-[#0A0A0C] text-white transition-colors dark:bg-[#F5F4F2] dark:text-[#0A0A0C]">
                        <AnimatePresence mode="wait" initial={false}>
                            {phase === 'idle' && (
                                <motion.span
                                    key="label"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-[15px] font-medium">
                                    <Rocket size={17} strokeWidth={2} />
                                    Launch Venue
                                </motion.span>
                            )}
                            {phase === 'loading' && (
                                <motion.span
                                    key="spin"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}>
                                    <Loader2 size={20} className="animate-spin" />
                                </motion.span>
                            )}
                            {phase === 'success' && (
                                <motion.span
                                    key="check"
                                    initial={{ scale: 0, rotate: -30 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
                                    <Check size={22} strokeWidth={3} />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </form>

            <AnimatePresence>
                {phase === 'success' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#08080A]/85 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 20 }}
                            className="flex flex-col items-center gap-4">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/15 text-[#10B981]">
                                <Check size={30} strokeWidth={3} />
                            </span>
                            <p className="text-[15px] font-medium text-[#F5F4F2]">
                                Preparing your dashboard
                                <span className="ml-0.5 inline-flex">
                                    <motion.span
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}>
                                        .
                                    </motion.span>
                                    <motion.span
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}>
                                        .
                                    </motion.span>
                                    <motion.span
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}>
                                        .
                                    </motion.span>
                                </span>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
