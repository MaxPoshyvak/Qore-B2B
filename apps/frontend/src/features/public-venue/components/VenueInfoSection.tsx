import { Clock, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

import { fadeUpItem } from './ActionCard';

type VenueInfoSectionProps = {
    workingHours: unknown;
    phone: string | null;
    address: string | null;
};

/** Turns the Prisma `Json` working-hours blob into a short, readable string. */
export function formatWorkingHours(value: unknown): string {
    if (!value) return 'Hours not set';

    const data = (typeof value === 'string' ? safeParse(value) : value) as
        | Record<string, unknown>
        | null;

    if (!data || typeof data !== 'object') return 'Hours not set';

    const byDay = (data as Record<string, unknown>).byDay;
    if (byDay && typeof byDay === 'object') {
        const entries = Object.entries(byDay as Record<string, unknown>);
        if (entries.length > 0) {
            const parts = entries
                .map(([day, hours]) => `${day}: ${String(hours)}`)
                .join(' · ');
            return parts.length > 0 ? parts : 'Hours not set';
        }
    }

    const open = data.open ?? data.from;
    const close = data.close ?? data.to;
    if (open && close) return `${String(open)} – ${String(close)}`;
    if (typeof data.hours === 'string') return data.hours;

    return 'Hours not set';
}

function safeParse(input: string): unknown {
    try {
        return JSON.parse(input);
    } catch {
        return null;
    }
}

export function VenueInfoSection({ workingHours, phone, address }: VenueInfoSectionProps) {
    return (
        <motion.section
            variants={fadeUpItem}
            className="rounded-2xl border border-black/5 bg-white/60 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-[#121215]/60">
            <h2 className="text-base font-semibold text-[#0A0A0C] dark:text-[#F5F4F2]">Venue Info</h2>

            <dl className="mt-4 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#8B5CF6]">
                        <Clock size={16} strokeWidth={1.9} />
                    </span>
                    <div>
                        <dt className="text-xs text-[#6B6A65] dark:text-[#94938D]">Working Hours</dt>
                        <dd className="text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                            {formatWorkingHours(workingHours)}
                        </dd>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#8B5CF6]">
                        <Phone size={16} strokeWidth={1.9} />
                    </span>
                    <div>
                        <dt className="text-xs text-[#6B6A65] dark:text-[#94938D]">Contact</dt>
                        <dd className="text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                            {phone ?? 'Not provided'}
                        </dd>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#8B5CF6]">
                        <MapPin size={16} strokeWidth={1.9} />
                    </span>
                    <div>
                        <dt className="text-xs text-[#6B6A65] dark:text-[#94938D]">Address</dt>
                        <dd className="text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">
                            {address ?? 'Not provided'}
                        </dd>
                    </div>
                </div>
            </dl>
        </motion.section>
    );
}
