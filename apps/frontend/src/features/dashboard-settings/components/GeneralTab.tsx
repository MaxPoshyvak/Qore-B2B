'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Store, Palette, MapPin, Wifi, Coins, AlertTriangle, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    SUPPORTED_CURRENCIES,
    getCurrencyConfig,
    getSuggestedExchangeRate,
    formatCurrencyPrice,
    type UpdateTenantSettingsDto,
} from '@my-app/types';

import { display, body, mono } from '@/shared/lib/fonts';
import { AuthInput } from '@/shared/ui/AuthInput';
import { FormTextarea, FormSelect } from '@/shared/ui/FormControls';
import { ImageUpload } from '@/shared/ui/ImageUpload';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';

type GeneralTabProps = {
    initialCurrency?: string;
};

export function GeneralTab({ initialCurrency = 'USD' }: GeneralTabProps) {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<UpdateTenantSettingsDto>();

    const logoUrl = watch('logoUrl');
    const coverUrl = watch('coverUrl');
    const selectedCurrency = watch('currency') || initialCurrency;
    const convertPrices = watch('convertPrices') ?? false;
    const conversionRate = watch('conversionRate');

    const isCurrencyChanged = selectedCurrency !== initialCurrency;
    const oldConfig = getCurrencyConfig(initialCurrency);
    const newConfig = getCurrencyConfig(selectedCurrency);
    const suggestedRate = getSuggestedExchangeRate(initialCurrency, selectedCurrency);

    // Auto set suggested conversion rate when currency changes
    useEffect(() => {
        if (isCurrencyChanged) {
            setValue('conversionRate', suggestedRate, { shouldValidate: true, shouldDirty: true });
        } else {
            setValue('convertPrices', false, { shouldValidate: true, shouldDirty: true });
            setValue('conversionRate', undefined, { shouldValidate: true, shouldDirty: true });
        }
    }, [selectedCurrency, initialCurrency, suggestedRate, isCurrencyChanged, setValue]);

    const effectiveRate = Number(conversionRate) > 0 ? Number(conversionRate) : suggestedRate;
    const sampleConvertedPrice = formatCurrencyPrice(10 * effectiveRate, newConfig.code);

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
                    <FormSelect
                        id="venue-currency"
                        label="Venue Currency"
                        description="Default currency used across your menus, checkout, and Stripe payments."
                        error={errors.currency?.message}
                        {...register('currency')}>
                        {SUPPORTED_CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code} className="dark:bg-[#141417]">
                                {c.flag} {c.code} — {c.name} ({c.symbol})
                            </option>
                        ))}
                    </FormSelect>

                    <AnimatePresence>
                        {isCurrencyChanged && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -6 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -6 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden">
                                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 dark:border-amber-400/20 dark:bg-amber-400/10">
                                    <div className="flex items-start gap-3.5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300">
                                            <AlertTriangle size={18} strokeWidth={2.2} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                                Currency Change Notice
                                            </h4>
                                            <p className="text-xs leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                                                You are switching your venue currency from{' '}
                                                <strong className="text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                    {oldConfig.code} ({oldConfig.symbol})
                                                </strong>{' '}
                                                to{' '}
                                                <strong className="text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                    {newConfig.code} ({newConfig.symbol})
                                                </strong>
                                                . Existing menu items will keep their current numerical values (e.g.{' '}
                                                {formatCurrencyPrice(10, oldConfig.code)} will become{' '}
                                                {formatCurrencyPrice(10, newConfig.code)}) unless converted.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 border-t border-amber-500/20 pt-4 dark:border-amber-400/20">
                                        <label className="flex cursor-pointer select-none items-start gap-3">
                                            <input
                                                type="checkbox"
                                                {...register('convertPrices')}
                                                className="mt-0.5 h-4 w-4 rounded border-amber-300 text-[#3B82F6] focus:ring-[#3B82F6] dark:border-white/20 dark:bg-[#141417]"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                    Recalculate existing menu item prices to {newConfig.code}
                                                </span>
                                                <span className="text-[11px] text-[#6B6A65] dark:text-[#94938D]">
                                                    Automatically scales dish prices, Happy Hour deals, and modifier options with an exchange rate.
                                                </span>
                                            </div>
                                        </label>

                                        <AnimatePresence>
                                            {convertPrices && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="mt-3.5 overflow-hidden">
                                                    <div className="space-y-3 rounded-xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                            <label
                                                                htmlFor="conversionRateInput"
                                                                className="text-xs font-medium text-[#6B6A65] dark:text-[#94938D]">
                                                                Conversion rate (1 {oldConfig.code} = ? {newConfig.code}):
                                                            </label>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                                    1 {oldConfig.code} =
                                                                </span>
                                                                <input
                                                                    id="conversionRateInput"
                                                                    type="number"
                                                                    step="any"
                                                                    min="0.0001"
                                                                    {...register('conversionRate', { valueAsNumber: true })}
                                                                    className="w-28 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-right text-xs font-bold text-[#0A0A0C] shadow-xs outline-none focus:border-[#3B82F6] dark:border-white/15 dark:bg-[#141417] dark:text-[#F5F4F2]"
                                                                />
                                                                <span className="text-xs font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                                                    {newConfig.code}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Live calculation preview */}
                                                        <div className="flex items-center justify-between rounded-lg border border-black/5 bg-black/[0.02] px-3 py-2 text-xs dark:border-white/5 dark:bg-white/[0.02]">
                                                            <span className="text-[#6B6A65] dark:text-[#94938D]">
                                                                Sample price preview:
                                                            </span>
                                                            <div className="flex items-center gap-2 font-semibold">
                                                                <span className="text-[#6B6A65] line-through dark:text-[#94938D]">
                                                                    {formatCurrencyPrice(10, oldConfig.code)}
                                                                </span>
                                                                <ArrowRight size={13} className="text-[#3B82F6]" />
                                                                <span className="text-[#3B82F6] dark:text-[#60A5FA]">
                                                                    {sampleConvertedPrice}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Language Preference */}
                    <div className="flex flex-col gap-2 rounded-2xl border border-black/5 bg-black/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/5 dark:bg-white/[0.02]">
                        <div>
                            <span className="text-[13.5px] font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">
                                Workspace & Menu Language
                            </span>
                            <p className="text-[12px] text-[#6B6A65] dark:text-[#94938D]">
                                Select the display language for this venue and guest views.
                            </p>
                        </div>
                        <LanguageSwitcher />
                    </div>
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
