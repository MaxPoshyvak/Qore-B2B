import type { Variants } from 'framer-motion';

/** Shared easing curve used across the app. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Single element fade + rise. */
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/** Parent that staggers its children. */
export const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

/** In-view reveal variants (used by the Reveal helper). */
export const revealVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
