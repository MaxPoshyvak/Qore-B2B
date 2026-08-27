'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarDays,
    Clock,
    Users,
    User,
    Phone,
    MessageSquare,
    Loader2,
    AlertCircle,
    ChevronDown,
} from 'lucide-react';

import { bookingFormSchema, type BookingFormValues, type ReservationResponse } from '@my-app/types';
import { display } from '@/shared/lib/fonts';
import { EASE } from '@/shared/config/animations';
import { useGetPublicTenant } from '@/entities/tenant/hooks/useGetPublicTenant';
import { useAvailability, useCreateReservation } from '../hooks/useReservations';
import { generateTimeSlots } from '../lib/timeSlots';

type DayHours = { isOpen?: boolean; openTime?: string; closeTime?: string };

const todayString = () => new Date().toISOString().slice(0, 10);

const inputClass =
    'w-full rounded-2xl border border-[#E7E5E0] bg-white/80 px-4 py-3 text-[14px] text-[#0A0A0C] outline-none backdrop-blur-2xl transition-colors placeholder:text-[#9C9B95] focus:border-[#3B82F6]/60 dark:border-white/15 dark:bg-white/[0.04] dark:text-[#F5F4F2]';

const labelClass = 'mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-[#6B6A65] dark:text-[#94938D]';

export function BookingForm({
    slug,
    onSuccess,
}: {
    slug: string;
    onSuccess: (reservation: ReservationResponse) => void;
}) {
    const [apiError, setApiError] = useState<string | null>(null);
    const { register, handleSubmit, watch, setValue, formState } = useForm<BookingFormValues>({
        resolver: zodResolver(bookingFormSchema),
        mode: 'onTouched',
        defaultValues: { date: todayString(), time: '', guestsCount: 2, guestName: '', guestPhone: '', notes: '' },
    });

    const { errors, isSubmitting } = formState;
    const date = watch('date');
    const time = watch('time');
    const guestsCount = watch('guestsCount');

    const availability = useAvailability(slug, date || null);
    const create = useCreateReservation(slug);
    const { data: tenant } = useGetPublicTenant(slug);

    // Derive the bookable window from the venue's working hours (falls back to
    // a sensible 10:00–22:00 range when hours aren't configured).
    const workingHours = tenant?.settings?.workingHours as Record<string, DayHours> | undefined;
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const selectedDate = date || todayString();
    const dayConfig = workingHours?.[dayNames[new Date(`${selectedDate}T00:00:00`).getDay()]];
    const venueHasHours = Boolean(workingHours);
    const openToday = !venueHasHours || dayConfig?.isOpen !== false;
    const startTime = dayConfig?.openTime ?? '10:00';
    const endTime = dayConfig?.closeTime ?? '22:00';

    const generatedTimes = useMemo(
        () => (openToday ? generateTimeSlots(startTime, endTime, 15) : []),
        [openToday, startTime, endTime],
    );

    async function onSubmit(values: BookingFormValues) {
        setApiError(null);
        const reservedAt = new Date(`${values.date}T${values.time}:00`).toISOString();
        try {
            const reservation = await create.mutateAsync({
                guestName: values.guestName,
                guestPhone: values.guestPhone,
                guestsCount: values.guestsCount,
                reservedAt,
                notes: values.notes || undefined,
            });
            onSuccess(reservation);
        } catch (err) {
            setApiError(err instanceof Error ? err.message : 'Could not complete your reservation. Please try again.');
        }
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto w-full max-w-xl rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] sm:p-8"
            noValidate>
            <h1
                className={`${display.className} text-[26px] font-bold tracking-tight text-[#0A0A0C] dark:text-[#F5F4F2]`}>
                Reserve a table
            </h1>
            <p className="mt-1.5 text-[13.5px] text-[#6B6A65] dark:text-[#94938D]">
                Pick a date and time that works for you — we&apos;ll save your spot.
            </p>

            <div className="mt-6 space-y-5">
                <div>
                    <label className={labelClass} htmlFor="date">
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={13} /> Date
                        </span>
                    </label>
                    <input id="date" type="date" min={todayString()} className={inputClass} {...register('date')} />
                    {errors.date && <p className="mt-1.5 text-[12px] text-red-500">{errors.date.message}</p>}
                </div>

                <div>
                    <label className={labelClass}>
                        <span className="inline-flex items-center gap-1.5">
                            <Clock size={13} /> Time
                        </span>
                    </label>

                    {!date ? (
                        <p className="text-[13px] text-[#9C9B95] dark:text-[#6E6D68]">
                            Select a date to see available times.
                        </p>
                    ) : !openToday ? (
                        <p className="text-[13px] text-[#9C9B95] dark:text-[#6E6D68]">Venue is closed on this day.</p>
                    ) : generatedTimes.length === 0 ? (
                        <p className="text-[13px] text-[#9C9B95] dark:text-[#6E6D68]">No time slots available.</p>
                    ) : availability.isLoading ? (
                        <p className="text-[13px] text-[#9C9B95] dark:text-[#6E6D68]">Loading available times…</p>
                    ) : (
                        <div className="relative">
                            <select
                                value={time || ''}
                                onChange={(e) => setValue('time', e.target.value, { shouldValidate: true })}
                                className="w-full appearance-none rounded-xl border border-[#E7E5E0] bg-white/70 px-4 py-3 text-[14px] font-medium tabular-nums text-[#0A0A0C] transition-all hover:border-[#3B82F6]/40 focus:border-[#3B82F6] focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/10 dark:border-white/15 dark:bg-white/[0.04] dark:text-[#F5F4F2]">
                                <option value="" disabled>
                                    Select time...
                                </option>
                                {generatedTimes.map((slotTime) => {
                                    const slot = availability.data?.find((s) => s.time === slotTime);
                                    const available = slot ? slot.available : true;

                                    return (
                                        <option key={slotTime} value={slotTime} disabled={!available}>
                                            {slotTime} {!available ? '(full)' : ''}
                                        </option>
                                    );
                                })}
                            </select>

                            {/* Кастомна іконка стрілочки для преміального вигляду */}
                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9C9B95] dark:text-[#6E6D68]">
                                <ChevronDown size={18} />
                            </div>
                        </div>
                    )}
                    {errors.time && <p className="mt-1.5 text-[12px] text-red-500">{errors.time.message}</p>}
                </div>

                <div>
                    <label className={labelClass} htmlFor="guestsCount">
                        <span className="inline-flex items-center gap-1.5">
                            <Users size={13} /> Guests
                        </span>
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setValue('guestsCount', Math.max(1, (Number(guestsCount) || 1) - 1), {
                                    shouldValidate: true,
                                })
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E7E5E0] bg-white/70 text-[18px] font-semibold text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-white/15 dark:bg-white/[0.04] dark:text-[#F5F4F2]">
                            −
                        </button>
                        <input
                            id="guestsCount"
                            type="number"
                            min={1}
                            className={`${inputClass} text-center`}
                            {...register('guestsCount', { valueAsNumber: true })}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setValue('guestsCount', Math.min(50, (Number(guestsCount) || 1) + 1), {
                                    shouldValidate: true,
                                })
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E7E5E0] bg-white/70 text-[18px] font-semibold text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/40 dark:border-white/15 dark:bg-white/[0.04] dark:text-[#F5F4F2]">
                            +
                        </button>
                    </div>
                    {errors.guestsCount && (
                        <p className="mt-1.5 text-[12px] text-red-500">{errors.guestsCount.message}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass} htmlFor="guestName">
                        <span className="inline-flex items-center gap-1.5">
                            <User size={13} /> Your name
                        </span>
                    </label>
                    <input
                        id="guestName"
                        type="text"
                        placeholder="Jane Doe"
                        className={inputClass}
                        {...register('guestName')}
                    />
                    {errors.guestName && <p className="mt-1.5 text-[12px] text-red-500">{errors.guestName.message}</p>}
                </div>

                <div>
                    <label className={labelClass} htmlFor="guestPhone">
                        <span className="inline-flex items-center gap-1.5">
                            <Phone size={13} /> Phone
                        </span>
                    </label>
                    <input
                        id="guestPhone"
                        type="tel"
                        placeholder="+1 555 0100"
                        className={inputClass}
                        {...register('guestPhone')}
                    />
                    {errors.guestPhone && (
                        <p className="mt-1.5 text-[12px] text-red-500">{errors.guestPhone.message}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass} htmlFor="notes">
                        <span className="inline-flex items-center gap-1.5">
                            <MessageSquare size={13} /> Notes
                            <span className="font-normal lowercase tracking-normal text-[#9C9B95]">(optional)</span>
                        </span>
                    </label>
                    <textarea
                        id="notes"
                        rows={3}
                        placeholder="Allergies, occasion, seating preference…"
                        className={`${inputClass} resize-none`}
                        {...register('notes')}
                    />
                </div>
            </div>

            {apiError && (
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/5 px-3.5 py-2.5 text-[13px] text-red-500">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{apiError}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || create.isPending}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3.5 text-[14px] font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting || create.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <CalendarDays size={16} />
                )}
                Confirm reservation
            </button>
        </motion.form>
    );
}
