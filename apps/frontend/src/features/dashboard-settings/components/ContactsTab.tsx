'use client';

import { useFormContext } from 'react-hook-form';
import { AuthInput } from '@/shared/ui/AuthInput';
import type { UpdateTenantSettingsDto } from '@my-app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/Card';

export function ContactsTab() {
    const {
        register,
        formState: { errors },
    } = useFormContext<UpdateTenantSettingsDto>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contacts</CardTitle>
                <CardDescription>How guests and suppliers can reach your venue.</CardDescription>
            </CardHeader>
            <CardContent className="flex max-w-xl flex-col gap-4">
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
            </CardContent>
        </Card>
    );
}
