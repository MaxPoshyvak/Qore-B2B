'use client';

import { useFormContext } from 'react-hook-form';
import { ImageIcon } from 'lucide-react';
import type { UpdateTenantSettingsDto } from '@my-app/types';
import { Input, Textarea } from '@/shared/ui/shadcn';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/ui/shadcn/Form';

export function GeneralTab() {
    const { control, watch } = useFormContext<UpdateTenantSettingsDto>();

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

                <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Venue name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your venue name" {...field} />
                            </FormControl>
                            <FormDescription>
                                Displayed across the guest experience and emails.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={3}
                                    placeholder="Tell guests what makes your venue special"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Keep it short and inviting — up to 500 characters.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="logoUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Logo</FormLabel>
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-black/5 bg-black/[0.04] flex items-center justify-center dark:border-white/10 dark:bg-white/[0.06]">
                                    {logoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={logoUrl}
                                            alt="Logo preview"
                                            className="h-20 w-20 object-cover"
                                        />
                                    ) : (
                                        <ImageIcon className="h-7 w-7 text-[#94938D]" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <FormControl>
                                        <Input type="url" placeholder="https://…/logo.png" {...field} />
                                    </FormControl>
                                </div>
                            </div>
                            <FormDescription>Must be a valid image URL (https://…).</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="coverUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cover image</FormLabel>
                            <div className="h-32 w-full overflow-hidden rounded-md border border-black/5 bg-black/[0.04] flex items-center justify-center dark:border-white/10 dark:bg-white/[0.06]">
                                {coverUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={coverUrl}
                                        alt="Cover preview"
                                        className="h-32 w-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="h-7 w-7 text-[#94938D]" />
                                )}
                            </div>
                            <FormControl>
                                <Input type="url" placeholder="https://…/cover.jpg" {...field} />
                            </FormControl>
                            <FormDescription>Must be a valid image URL (https://…).</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
    );
}
