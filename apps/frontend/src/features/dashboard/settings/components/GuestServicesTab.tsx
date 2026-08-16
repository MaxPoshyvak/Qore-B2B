'use client';

import { useFormContext } from 'react-hook-form';
import { AuthInput } from '@/shared/ui/AuthInput';
import type { UpdateTenantSettingsDto } from '@my-app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/Card';
import { FormDescription } from '@/shared/ui/shadcn/Form';

export function GuestServicesTab() {
    const {
        register,
        formState: { errors },
    } = useFormContext<UpdateTenantSettingsDto>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Guest Services</CardTitle>
                <CardDescription>Details your guests can use during their visit.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <AuthInput
                    id="wifiName"
                    label="Wi-Fi name (SSID)"
                    placeholder="CafeBoard-Guest"
                    error={errors.wifiName?.message}
                    {...register('wifiName')}
                />
                <AuthInput
                    id="wifiPassword"
                    label="Wi-Fi password"
                    type="password"
                    placeholder="••••••••"
                    error={errors.wifiPassword?.message}
                    {...register('wifiPassword')}
                />
                <FormDescription>
                    This is shown to guests on your public venue page so they can connect instantly.
                </FormDescription>
            </CardContent>
        </Card>
    );
}
