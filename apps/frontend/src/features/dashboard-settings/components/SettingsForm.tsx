'use client';

import * as React from 'react';
import { useState } from 'react';
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { z } from 'zod';
import {
    updateTenantSettingsSchema,
    workingHoursSchema,
    type PublicTenantResponse,
    type UpdateTenantSettingsDto,
} from '@my-app/types';

import { display } from '@/shared/lib/fonts';
import { cn } from '@/shared/lib/utils';
import { PrimaryButton } from '@/shared/ui/PrimaryButton';
import { useUpdateTenantSettings } from '../hooks/use-update-settings';
import { Toaster } from './Toaster';
import { GeneralTab } from './GeneralTab';
import { WorkingHoursTab } from './WorkingHoursTab';
import { StaffKdsTab } from './StaffKdsTab';
import { BillingTab } from './BillingTab';

type WorkingHours = z.infer<typeof workingHoursSchema>;

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

function emptyWorkingHours(): WorkingHours {
    return DAYS.reduce(
        (acc, day) => ({ ...acc, [day]: { isOpen: false, openTime: '09:00', closeTime: '17:00' } }),
        {} as WorkingHours,
    );
}

const TABS = [
    { value: 'general', label: 'General' },
    { value: 'hours', label: 'Working Hours' },
    { value: 'kds', label: 'Staff & KDS' },
    { value: 'billing', label: 'Billing & Plan' },
] as const;

type TabValue = (typeof TABS)[number]['value'];

function isTabValue(value: string | null): value is TabValue {
    return TABS.some((tab) => tab.value === value);
}

type SettingsFormProps = {
    slug: string;
    initialData: PublicTenantResponse;
};

export function SettingsForm({ slug, initialData }: SettingsFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const requestedTab = searchParams.get('section');
    const [tab, setTab] = useState<TabValue>(isTabValue(requestedTab) ? requestedTab : 'general');
    const { mutateAsync, isPending } = useUpdateTenantSettings(slug);

    const settings = initialData.settings;

    const defaults: UpdateTenantSettingsDto = {
        name: initialData.name ?? '',
        description: settings?.description ?? '',
        logoUrl: settings?.logoUrl ?? '',
        coverUrl: settings?.coverUrl ?? '',
        phone: settings?.phone ?? '',
        address: settings?.address ?? '',
        instagramUrl: settings?.instagramUrl ?? '',
        googleMapsUrl: settings?.googleMapsUrl ?? '',
        wifiSsid: settings?.wifiSsid ?? '',
        wifiPassword: settings?.wifiPassword ?? '',
        workingHours: (settings?.workingHours as WorkingHours) ?? emptyWorkingHours(),
    };

    const methods = useForm<UpdateTenantSettingsDto>({
        resolver: zodResolver(updateTenantSettingsSchema),
        defaultValues: defaults,
        mode: 'onSubmit',
    });

    const onSubmit = async (values: UpdateTenantSettingsDto) => {
        await mutateAsync(values);
        methods.reset(values);
    };

    const onError = (errors: FieldErrors<UpdateTenantSettingsDto>) => {
        console.log('Form Validation Errors:', errors);
    };

    const { isDirty, isSubmitting } = methods.formState;

    React.useEffect(() => {
        if (isTabValue(requestedTab) && requestedTab !== tab) setTab(requestedTab);
    }, [requestedTab, tab]);

    const changeTab = (value: string) => {
        if (!isTabValue(value)) return;
        setTab(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set('section', value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <FormProvider {...methods}>
            <Toaster />

            <div className="relative mx-auto max-w-6xl px-1">
                <div className="pointer-events-none  absolute right-0 -top-20 h-72 w-72 rounded-full bg-[#3B82F6]/5 blur-3xl" />
                <header className="mb-6 md:mb-8">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/10 px-3 py-1 text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
                        Venue Settings
                    </span>
                    <h1
                        className={cn(
                            display.className,
                            'text-2xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] md:text-3xl',
                        )}>
                        Manage your venue profile &amp; preferences
                    </h1>
                    <p className="mt-1.5 text-sm text-[#6B6A65] dark:text-[#94938D]">
                        Update public info, Wi-Fi access, contacts, and working schedules in real time.
                    </p>
                    <div className="hide-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 md:hidden">
                        {TABS.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => changeTab(t.value)}
                                className={cn(
                                    'shrink-0 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors',
                                    tab === t.value
                                        ? 'border-[#3B82F6]/20 bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#60A5FA]'
                                        : 'border-[#E7E5E0] bg-white/60 text-[#6B6A65] hover:border-[#3B82F6]/30 dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]',
                                )}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </header>

                <Tabs value={tab} onValueChange={changeTab}>
                    <div className="w-full">
                        <form onSubmit={methods.handleSubmit(onSubmit, onError)}>
                            <div className="rounded-2xl border border-black/5 bg-card/50 p-6 shadow-sm backdrop-blur-sm dark:border-white/10">
                                <TabsContent value="general">
                                    <GeneralTab />
                                </TabsContent>
                                <TabsContent value="hours">
                                    <WorkingHoursTab />
                                </TabsContent>
                                <TabsContent value="kds">
                                    <StaffKdsTab slug={slug} settings={settings} />
                                </TabsContent>
                                <TabsContent value="billing">
                                    <BillingTab />
                                </TabsContent>
                            </div>
                            <AnimatePresence>
                                {isDirty && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 24, x: '-50%' }}
                                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                                        exit={{ opacity: 0, y: 24, x: '-50%' }}
                                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg items-center justify-between gap-4 rounded-full bg-zinc-900 px-4 py-3 text-white shadow-2xl sm:px-6">
                                        <span className="text-sm font-medium">You have unsaved changes.</span>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => methods.reset()}
                                                disabled={isSubmitting || isPending}
                                                className="rounded-full px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50">
                                                Reset
                                            </button>
                                            <PrimaryButton
                                                type="submit"
                                                loading={isSubmitting || isPending}
                                                size="sm"
                                                className="rounded-full bg-white px-4 text-zinc-900 shadow-none hover:bg-zinc-100">
                                                Save Changes
                                            </PrimaryButton>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </Tabs>
            </div>
        </FormProvider>
    );
}

/* ----------------------------- Tabs primitives ----------------------------- */

function Tabs({
    value,
    onValueChange,
    children,
}: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-6 md:flex-row md:gap-10">
            <TabsContext.Provider value={{ value, onValueChange }}>{children}</TabsContext.Provider>
        </div>
    );
}

const TabsContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
} | null>(null);

function useTabs() {
    const ctx = React.useContext(TabsContext);
    if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
    return ctx;
}

function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
    const { value: active } = useTabs();
    if (active !== value) return null;
    return <div className="animate-fade-up">{children}</div>;
}
