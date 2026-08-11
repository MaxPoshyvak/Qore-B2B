'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { fadeUpItem } from './ActionCard';

export function VenueFooter() {
    return (
        <motion.footer
            variants={fadeUpItem}
            className="flex items-center justify-center pt-4 text-xs text-[#6B6A65] dark:text-[#94938D]">
            <span>Powered by&nbsp;</span>
            <Link
                href="/"
                className="font-semibold text-[#3B82F6] transition-colors hover:text-[#8B5CF6] dark:text-[#60A5FA]">
                Qore
            </Link>
        </motion.footer>
    );
}
