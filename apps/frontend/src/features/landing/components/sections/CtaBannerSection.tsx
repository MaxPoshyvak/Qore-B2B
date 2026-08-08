'use client';

import { ArrowRight } from 'lucide-react';

import { display, body } from '@/shared/lib/fonts';
import { Reveal } from '../ui/Reveal';
import { MagneticButton } from '../ui/MagneticButton';

export function CtaBannerSection() {
    return (
        <section className="relative mx-auto max-w-6xl overflow-hidden px-6 py-24 text-center">
            <Reveal className="relative">
                <h2
                    className={`${display.className} mx-auto max-w-lg text-[26px] font-bold leading-tight sm:text-[40px]`}>
                    Get your venue live in one evening
                </h2>
                <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-relaxed text-[#6B6A65] dark:text-[#94938D]">
                    Menu migration, table QR setup, and team onboarding — free to get started.
                </p>
                <MagneticButton
                    primary
                    showSparks
                    href="#pricing"
                    className={`${body.className} mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0A0A0C] px-7 py-4 text-[14.5px] font-medium text-white transition-colors hover:bg-[#232327] dark:bg-[#F5F4F2] dark:text-[#0A0A0C] dark:hover:bg-white`}>
                    Try Qore
                    <ArrowRight size={16} />
                </MagneticButton>
            </Reveal>
        </section>
    );
}
