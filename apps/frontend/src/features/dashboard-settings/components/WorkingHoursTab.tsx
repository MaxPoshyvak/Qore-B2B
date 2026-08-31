'use client';

import { Controller, useFormContext, type Path } from 'react-hook-form';
import { z } from 'zod';
import type { UpdateTenantSettingsDto } from '@my-app/types';
import { workingHoursSchema } from '@my-app/types';
import { ToggleSwitch } from '@/shared/ui/ToggleSwitch';

type WorkingHours = z.infer<typeof workingHoursSchema>;

const DAYS: { key: keyof WorkingHours; label: string }[] = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

const TIME_OPTIONS = Array.from({ length: 32 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${String(hour).padStart(2, '0')}:${minute}`;
});

// RHF's `Path` is a union of literal strings; template-literal names need a cast.
const field = (name: string) => name as Path<UpdateTenantSettingsDto>;

export function WorkingHoursTab() {
    const { control } = useFormContext<UpdateTenantSettingsDto>();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]">
                    Working Hours
                </h2>
                <p className="mt-1 text-sm text-[#6B6A65] dark:text-[#94938D]">
                    Toggle each day on to set your opening and closing times. Closed days are hidden
                    from your guests&apos; schedule.
                </p>
            </div>

            <div>
                {DAYS.map(({ key, label }) => (
                    <DayRow key={key} dayKey={key} label={label} control={control} />
                ))}
            </div>
        </div>
    );
}

function DayRow({
    dayKey,
    label,
    control,
}: {
    dayKey: keyof WorkingHours;
    label: string;
    control: ReturnType<typeof useFormContext<UpdateTenantSettingsDto>>['control'];
}) {
    return (
        <Controller
            control={control}
            name={field(`workingHours.${dayKey}.isOpen`)}
            render={({ field: openField }) => {
                const isOpen = openField.value;

                return (
                    <div className={`mb-3 flex flex-col gap-4 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${isOpen ? 'border-[#3B82F6]/20 bg-[#3B82F6]/[0.04] dark:border-[#3B82F6]/30 dark:bg-[#3B82F6]/[0.08]' : 'border-black/5 bg-card/50 opacity-80 dark:border-white/10'}`}>
                        <div className="flex items-center gap-4 sm:w-40">
                            <ToggleSwitch
                                checked={!!isOpen}
                                onChange={(next) => openField.onChange(next)}
                                aria-label={`${label} open`}
                            />
                            <span className="text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                                {label}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {isOpen ? (
                                <>
                                    <TimeSelect
                                        control={control}
                                        name={field(`workingHours.${dayKey}.openTime`)}
                                        placeholder="Open"
                                        ariaLabel={`${label} opening time`}
                                    />
                                    <span className="text-sm text-[#6B6A65] dark:text-[#94938D]">—</span>
                                    <TimeSelect
                                        control={control}
                                        name={field(`workingHours.${dayKey}.closeTime`)}
                                        placeholder="Close"
                                        ariaLabel={`${label} closing time`}
                                    />
                                </>
                            ) : (
                                <span className="rounded-full border border-[#E7E5E0] bg-black/[0.03] px-3 py-1 text-xs font-medium text-[#6B6A65] dark:border-white/10 dark:bg-white/5 dark:text-[#94938D]">
                                    Closed
                                </span>
                            )}
                        </div>
                    </div>
                );
            }}
        />
    );
}

function TimeSelect({
    control,
    name,
    placeholder,
    ariaLabel,
}: {
    control: ReturnType<typeof useFormContext<UpdateTenantSettingsDto>>['control'];
    name: Path<UpdateTenantSettingsDto>;
    placeholder: string;
    ariaLabel: string;
}) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <select
                    ref={field.ref}
                    value={(field.value as string) ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    aria-label={ariaLabel}
                    className="h-10 w-32 appearance-none rounded-xl border border-[#E7E5E0] bg-white px-3 text-sm text-[#0A0A0C] outline-none transition-colors focus:border-[#3B82F6]/60 focus:ring-2 focus:ring-[#3B82F6]/15 dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2]">
                    <option value="">{placeholder}</option>
                    {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                            {time}
                        </option>
                    ))}
                </select>
            )}
        />
    );
}
