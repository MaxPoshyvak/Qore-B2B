'use client';

import { Clock, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

import { fadeUpItem } from './ActionCard';

type VenueInfoSectionProps = {
    hours: string;
    phone: string;
    address: string;
};

export function VenueInfoSection({ hours, phone, address }: VenueInfoSectionProps) {
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
                        <dd className="text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">{hours}</dd>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#8B5CF6]">
                        <Phone size={16} strokeWidth={1.9} />
                    </span>
                    <div>
                        <dt className="text-xs text-[#6B6A65] dark:text-[#94938D]">Contact</dt>
                        <dd className="text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">{phone}</dd>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#8B5CF6]">
                        <MapPin size={16} strokeWidth={1.9} />
                    </span>
                    <div>
                        <dt className="text-xs text-[#6B6A65] dark:text-[#94938D]">Address</dt>
                        <dd className="text-sm font-medium text-[#0A0A0C] dark:text-[#F5F4F2]">{address}</dd>
                    </div>
                </div>
            </dl>
        </motion.section>
    );
}
