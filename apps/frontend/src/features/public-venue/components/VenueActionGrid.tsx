'use client';

import { Check, Copy, ExternalLink, MapPin, MessageSquareHeart, Wifi } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { PublicTenantResponse } from '@my-app/types';

import { useCopyToClipboard } from '../lib/useCopyToClipboard';
import { ActionCard, fadeUpItem } from './ActionCard';

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
    tenant: PublicTenantResponse;
    mapsUrl: string;
};

export function VenueActionGrid({ slug, tenant, mapsUrl }: VenueActionGridProps) {
    const { copied, copy } = useCopyToClipboard();
    const { settings } = tenant;

    const instagramHandle = tenant.instagram;
    const instagramUrl = instagramHandle
        ? instagramHandle.startsWith('http')
            ? instagramHandle
            : `https://instagram.com/${instagramHandle.replace(/^@/, '')}`
        : null;

    const cards: React.ReactNode[] = [];

    // Guest Wi-Fi — only when an SSID is configured.
    if (settings?.wifiSsid) {
        cards.push(
            <motion.div key="wifi" variants={fadeUpItem}>
                <ActionCard
                    icon={Wifi}
                    title="Guest Wi-Fi"
                    description={settings.wifiSsid}
                    action={
                        <button
                            type="button"
                            onClick={() => copy(settings.wifiPassword ?? '')}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-3 py-1.5 text-xs font-medium text-[#2563EB] transition-colors hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy Password'}
                        </button>
                    }
                />
            </motion.div>,
        );
    } else {
        cards.push(
            <motion.div key="wifi" variants={fadeUpItem}>
                <ActionCard
                    icon={Wifi}
                    title="Guest Wi-Fi"
                    description="Available upon request"
                    action={<span />}
                />
            </motion.div>,
        );
    }

    // Location & Route
    cards.push(
        <motion.div key="location" variants={fadeUpItem}>
            <ActionCard
                icon={MapPin}
                title="Location & Route"
                description={tenant.address ?? 'Address not set'}
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
        </motion.div>,
    );

    // Leave Feedback
    cards.push(
        <motion.div key="feedback" variants={fadeUpItem}>
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
        </motion.div>,
    );

    // Socials / Instagram — only when a handle is configured.
    if (instagramUrl) {
        cards.push(
            <motion.div key="instagram" variants={fadeUpItem}>
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
            </motion.div>,
        );
    }

    return (
        <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 gap-4">
            {cards}
        </motion.div>
    );
}
