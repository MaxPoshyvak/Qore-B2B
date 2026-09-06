'use client';

import { useFormContext } from 'react-hook-form';
import { Store, Palette, MapPin, Wifi } from 'lucide-react';
import type { UpdateTenantSettingsDto } from '@my-app/types';

import { display, body, mono } from '@/shared/lib/fonts';
import { AuthInput } from '@/shared/ui/AuthInput';
import { FormTextarea } from '@/shared/ui/FormControls';
import { ImageUpload } from '@/shared/ui/ImageUpload';

export function GeneralTab() {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<UpdateTenantSettingsDto>();

    const logoUrl = watch('logoUrl');
    const coverUrl = watch('coverUrl');

    return (
        <div className="mx-auto max-w-3xl space-y-8 pb-12">
            <div className="mb-8">
                <h2
                    className={`${display.className} text-[26px] font-bold leading-tight text-[#0A0A0C] dark:text-[#F5F4F2] sm:text-[34px]`}>
                    General Settings
                </h2>
                <p
                    className={`${body.className} mt-2 text-[14.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]`}>
                    Manage your venue's core identity, branding, and contact details.
                </p>
            </div>

            {/* Basic Information - Blue Accent */}
            <section className="relative overflow-hidden rounded-3xl border border-[#E7E5E0] bg-white p-6 shadow-sm transition-colors hover:border-[#3B82F6]/30 dark:border-[#232327] dark:bg-[#141417] sm:p-7">
                <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#3B82F6]" />
                <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
                        <Store size={20} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className={`${display.className} text-[17px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Basic Information
                        </h3>
                        <p className={`${body.className} mt-1 text-[13.5px] text-[#6B6A65] dark:text-[#94938D]`}>
                            The core details of your venue that guests will see.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-6 pl-0 sm:pl-[60px]">
                    <AuthInput
                        id="venue-name"
                        label="Venue name"
                        placeholder="e.g. Qore Cafe"
                        error={errors.name?.message}
                        {...register('name')}
                    />
                    <FormTextarea
                        id="venue-description"
                        label="Description"
                        rows={3}
                        placeholder="Tell guests what makes your venue special..."
                        error={errors.description?.message}
                        {...register('description')}
                    />
                </div>
            </section>

            {/* Branding - Violet Accent */}
            <section className="relative overflow-hidden rounded-3xl border border-[#E7E5E0] bg-white p-6 shadow-sm transition-colors hover:border-[#8B5CF6]/30 dark:border-[#232327] dark:bg-[#141417] sm:p-7">
                <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#8B5CF6]" />
                <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#8B5CF6]/10 text-[#8B5CF6]">
                        <Palette size={20} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className={`${display.className} text-[17px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Branding
                        </h3>
                        <p className={`${body.className} mt-1 text-[13.5px] text-[#6B6A65] dark:text-[#94938D]`}>
                            Upload your logo and cover image to make your menu stand out.
                        </p>
                    </div>
                </div>

                {/* Changed to flex-col for mobile, flex-row for desktop with proper gaps */}
                <div className="flex flex-col gap-8 pl-0 sm:flex-row sm:pl-[60px]">
                    {/* Logo: Forced aspect-square to prevent rectangle stretching on mobile */}
                    <div className="flex shrink-0 flex-col">
                        <span
                            className={`${mono.className} mb-3 block text-[11px] uppercase tracking-widest text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                            Venue Logo
                        </span>
                        <ImageUpload
                            value={logoUrl}
                            folder="qore/venue-branding"
                            onChange={(url) => setValue('logoUrl', url ?? '', { shouldDirty: true })}
                            // Force width/height to be explicitly identical and aspect-square
                            className="aspect-square h-32 w-32 sm:h-40 sm:w-40"
                        />
                        {errors.logoUrl?.message && (
                            <span className="mt-2 block text-[12.5px] font-medium text-red-500">
                                {errors.logoUrl.message}
                            </span>
                        )}
                    </div>

                    {/* Cover Image */}
                    <div className="flex flex-1 flex-col">
                        <span
                            className={`${mono.className} mb-3 block text-[11px] uppercase tracking-widest text-[#6B6A65]/70 dark:text-[#94938D]/70`}>
                            Cover Image
                        </span>
                        <ImageUpload
                            value={coverUrl}
                            folder="qore/venue-branding"
                            onChange={(url) => setValue('coverUrl', url ?? '', { shouldDirty: true })}
                            // Explicit heights for cover image
                            className="h-40 w-full sm:h-40"
                        />
                        {errors.coverUrl?.message && (
                            <span className="mt-2 block text-[12.5px] font-medium text-red-500">
                                {errors.coverUrl.message}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Location & Contacts - Amber Accent */}
            <section className="relative overflow-hidden rounded-3xl border border-[#E7E5E0] bg-white p-6 shadow-sm transition-colors hover:border-[#F59E0B]/30 dark:border-[#232327] dark:bg-[#141417] sm:p-7">
                <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#F59E0B]" />
                <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F59E0B]/10 text-[#F59E0B]">
                        <MapPin size={20} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className={`${display.className} text-[17px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Location & Contacts
                        </h3>
                        <p className={`${body.className} mt-1 text-[13.5px] text-[#6B6A65] dark:text-[#94938D]`}>
                            How guests and suppliers can find and reach your venue.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 pl-0 sm:grid-cols-2 sm:pl-[60px]">
                    <AuthInput
                        id="phone"
                        label="Phone"
                        type="tel"
                        placeholder="+1 (555) 012-3456"
                        error={errors.phone?.message}
                        {...register('phone')}
                    />
                    <AuthInput
                        id="address"
                        label="Address"
                        placeholder="123 Market Street, Downtown"
                        error={errors.address?.message}
                        {...register('address')}
                    />
                    <AuthInput
                        id="instagramUrl"
                        label="Instagram URL"
                        type="url"
                        placeholder="https://instagram.com/yourvenue"
                        error={errors.instagramUrl?.message}
                        {...register('instagramUrl')}
                    />
                    <AuthInput
                        id="googleMapsUrl"
                        label="Google Maps URL"
                        type="url"
                        placeholder="https://maps.app.goo.gl/…"
                        error={errors.googleMapsUrl?.message}
                        {...register('googleMapsUrl')}
                    />
                </div>
            </section>

            {/* Guest Services - Green Accent */}
            <section className="relative overflow-hidden rounded-3xl border border-[#E7E5E0] bg-white p-6 shadow-sm transition-colors hover:border-[#10B981]/30 dark:border-[#232327] dark:bg-[#141417] sm:p-7">
                <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#10B981]" />
                <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#10B981]">
                        <Wifi size={20} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className={`${display.className} text-[17px] font-bold text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                            Guest Services
                        </h3>
                        <p className={`${body.className} mt-1 text-[13.5px] text-[#6B6A65] dark:text-[#94938D]`}>
                            Details provided to your guests while they are at the venue.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 pl-0 sm:grid-cols-2 sm:pl-[60px]">
                    <AuthInput
                        id="wifiSsid"
                        label="Wi-Fi name (SSID)"
                        placeholder="CafeBoard-Guest"
                        error={errors.wifiSsid?.message}
                        {...register('wifiSsid')}
                    />
                    <AuthInput
                        id="wifiPassword"
                        label="Wi-Fi password"
                        type="text"
                        placeholder="Password123"
                        error={errors.wifiPassword?.message}
                        {...register('wifiPassword')}
                    />
                </div>
            </section>
        </div>
    );
}
