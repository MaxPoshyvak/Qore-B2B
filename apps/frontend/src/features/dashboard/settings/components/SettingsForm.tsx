'use client';

import * as React from 'react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ContactsTab } from './ContactsTab';
import { GuestServicesTab } from './GuestServicesTab';
import { WorkingHoursTab } from './WorkingHoursTab';

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
    { value: 'contacts', label: 'Contacts' },
    { value: 'guest', label: 'Guest Services' },
    { value: 'hours', label: 'Working Hours' },
] as const;

type SettingsFormProps = {
    slug: string;
    initialData: PublicTenantResponse;
};

export function SettingsForm({ slug, initialData }: SettingsFormProps) {
    const [tab, setTab] = useState<string>('general');
    const { mutate, isPending } = useUpdateTenantSettings(slug);
    const settings = initialData.settings as
        | (PublicTenantResponse['settings'] & { wifiName?: string | null })
        | null;

    const defaults: UpdateTenantSettingsDto = {
        name: initialData.name ?? '',
        description: initialData.description ?? '',
        logoUrl: initialData.logoUrl ?? '',
        coverUrl: initialData.coverUrl ?? '',
        phone: initialData.phone ?? '',
        address: initialData.address ?? '',
        instagramUrl: initialData.instagram ?? '',
        googleMapsUrl: settings?.googleMapsUrl ?? '',
        wifiName: settings?.wifiName ?? settings?.wifiSsid ?? '',
        wifiPassword: settings?.wifiPassword ?? '',
        workingHours: (settings?.workingHours as WorkingHours) ?? emptyWorkingHours(),
    };

    const methods = useForm<UpdateTenantSettingsDto>({
        resolver: zodResolver(updateTenantSettingsSchema),
        defaultValues: defaults,
        mode: 'onSubmit',
    });

    const onSubmit = (values: UpdateTenantSettingsDto) => mutate(values);

    return (
        <FormProvider {...methods}>
            <Toaster />

            <div className="mx-auto max-w-6xl px-1">
                <header className="mb-6 md:mb-8">
                    <h1
                        className={cn(
                            display.className,
                            'text-2xl font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2] md:text-3xl',
                        )}>
                        Venue Settings
                    </h1>
                    <p className="mt-1.5 text-sm text-[#6B6A65] dark:text-[#94938D]">
                        Manage how your venue appears to guests.
                    </p>
                </header>

                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="flex flex-row justify-start gap-2 overflow-x-auto bg-transparent p-0 h-auto w-full md:w-64 md:flex-col md:overflow-visible hide-scrollbar">
                        {TABS.map((t) => (
                            <TabsTrigger
                                key={t.value}
                                value={t.value}
                                className="w-auto justify-start px-4 py-2 text-left text-sm font-medium md:w-full">
                                {t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="flex-1 w-full">
                        <form onSubmit={methods.handleSubmit(onSubmit)}>
                            <TabsContent value="general">
                                <GeneralTab />
                            </TabsContent>
                            <TabsContent value="contacts">
                                <ContactsTab />
                            </TabsContent>
                            <TabsContent value="guest">
                                <GuestServicesTab />
                            </TabsContent>
                            <TabsContent value="hours">
                                <WorkingHoursTab />
                            </TabsContent>

                            <div className="mt-6 flex justify-end">
                                <PrimaryButton type="submit" loading={isPending} className="w-full px-8 sm:w-auto">
                                    {isPending ? 'Saving…' : 'Save changes'}
                                </PrimaryButton>
                            </div>
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

function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
    return <div role="tablist" className={cn(className)}>{children}</div>;
}

function TabsTrigger({
    value,
    className,
    children,
}: {
    value: string;
    className?: string;
    children: React.ReactNode;
}) {
    const { value: active, onValueChange } = useTabs();
    const selected = active === value;
    return (
        <button
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onValueChange(value)}
            className={cn(
                'whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors',
                'text-[#6B6A65] hover:bg-black/[0.04] dark:text-[#94938D] dark:hover:bg-white/[0.06]',
                'data-[state=active]:bg-black/[0.05] data-[state=active]:text-[#0A0A0C] data-[state=active]:shadow-none',
                'dark:data-[state=active]:bg-white/10 dark:data-[state=active]:text-[#F5F4F2]',
                className,
            )}
            data-state={selected ? 'active' : 'inactive'}>
            {children}
        </button>
    );
}

function TabsContent({
    value,
    children,
}: {
    value: string;
    children: React.ReactNode;
}) {
    const { value: active } = useTabs();
    if (active !== value) return null;
    return <div className="animate-fade-up">{children}</div>;
}
