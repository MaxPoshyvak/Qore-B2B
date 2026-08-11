'use client';

import { Check, Copy, ExternalLink, MapPin, MessageSquareHeart, Wifi } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useCopyToClipboard } from '../lib/useCopyToClipboard';
import { ActionCard } from './ActionCard';

function InstagramGlyph() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
        </svg>
    );
}

type VenueActionGridProps = {
    slug: string;
    wifiSsid: string;
    wifiPassword: string;
    address: string;
    mapsUrl: string;
    instagramUrl: string;
};

export function VenueActionGrid({
    slug,
    wifiSsid,
    wifiPassword,
    address,
    mapsUrl,
    instagramUrl,
}: VenueActionGridProps) {
    const { copied, copy } = useCopyToClipboard();

    return (
        <motion.div
            variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 gap-4">
            {/* Guest Wi-Fi */}
            <ActionCard
                icon={Wifi}
                title="Guest Wi-Fi"
                description={wifiSsid}
                action={
                    <button
                        type="button"
                        onClick={() => copy(wifiPassword)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-3 py-1.5 text-xs font-medium text-[#2563EB] transition-colors hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy Password'}
                    </button>
                }
            />

            {/* Location & Route */}
            <ActionCard
                icon={MapPin}
                title="Location & Route"
                description={address}
                action={
                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-3 py-1.5 text-xs font-medium text-[#2563EB] transition-colors hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
                        <ExternalLink size={14} />
                        Open in Maps
                    </a>
                }
            />

            {/* Leave Feedback */}
            <ActionCard
                icon={MessageSquareHeart}
                title="Leave Feedback"
                description="Rate your experience"
                action={
                    <Link
                        href={`/${slug}/feedback`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-3 py-1.5 text-xs font-medium text-[#2563EB] transition-colors hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
                        <ExternalLink size={14} />
                        Share a review
                    </Link>
                }
            />

            {/* Socials / Instagram */}
            <ActionCard
                iconNode={<InstagramGlyph />}
                title="Socials"
                description="Follow us on Instagram"
                action={
                    <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-3 py-1.5 text-xs font-medium text-[#2563EB] transition-colors hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
                        <ExternalLink size={14} />
                        Follow
                    </a>
                }
            />
        </motion.div>
    );
}
