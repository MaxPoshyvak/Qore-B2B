'use client';

import { useFormContext } from 'react-hook-form';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import type { UpdateTenantSettingsDto } from '@my-app/types';
import { AuthInput } from '@/shared/ui/AuthInput';
import { FormTextarea } from '@/shared/ui/FormControls';

export function GeneralTab() {
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<UpdateTenantSettingsDto>();

    const logoUrl = watch('logoUrl');
    const coverUrl = watch('coverUrl');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]">
                    General
                </h2>
                <p className="mt-1 text-sm text-[#6B6A65] dark:text-[#94938D]">
                    Basic information about your venue that guests will see.
                </p>
            </div>

                <div className="max-w-xl space-y-5">
                    <AuthInput
                        id="venue-name"
                        label="Venue name"
                        placeholder="Your venue name"
                        error={errors.name?.message}
                        {...register('name')}
                    />
                    <FormTextarea
                        id="venue-description"
                        label="Description"
                        rows={3}
                        placeholder="Tell guests what makes your venue special"
                        error={errors.description?.message}
                        {...register('description')}
                    />

                    <div className="rounded-2xl border border-black/5 bg-card/50 p-4 backdrop-blur-sm dark:border-white/10">
                        <div className="mb-1 text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">Logo</div>
                        <p className="mb-3 text-xs text-[#6B6A65] dark:text-[#94938D]">Upload or enter image URL</p>
                        <div className="flex items-center gap-5">
                            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E7E5E0] bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.06]">
                                {logoUrl ? <Image src={logoUrl} alt="Logo preview" fill sizes="80px" className="object-cover" unoptimized /> : <ImageIcon className="h-7 w-7 text-[#94938D]" />}
                            </div>
                            <div className="flex-1"><AuthInput id="logo-url" label="Image URL" type="url" placeholder="https://…/logo.png" error={errors.logoUrl?.message} {...register('logoUrl')} /></div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-black/5 bg-card/50 p-4 backdrop-blur-sm dark:border-white/10">
                        <div className="mb-1 text-sm font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">Cover image</div>
                        <p className="mb-3 text-xs text-[#6B6A65] dark:text-[#94938D]">Upload or enter image URL</p>
                        <div className="relative mb-3 flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border border-[#E7E5E0] bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.06]">
                            {coverUrl ? <Image src={coverUrl} alt="Cover preview" fill sizes="(max-width: 768px) 100vw, 576px" className="object-cover" unoptimized /> : <ImageIcon className="h-7 w-7 text-[#94938D]" />}
                        </div>
                        <AuthInput id="cover-url" label="Image URL" type="url" placeholder="https://…/cover.jpg" error={errors.coverUrl?.message} {...register('coverUrl')} />
                    </div>
                </div>
            </div>
    );
}
