import {
    Space_Grotesk,
    Inter,
    JetBrains_Mono,
    Playfair_Display,
    Lora,
    Plus_Jakarta_Sans,
    Syne,
} from 'next/font/google';

export const display = Space_Grotesk({
    subsets: ['latin'],
    weight: ['500', '700'],
    variable: '--font-space-grotesk',
    display: 'swap',
});

export const body = Inter({
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
    display: 'swap',
});

export const mono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-mono',
    display: 'swap',
});

export const playfair = Playfair_Display({
    subsets: ['latin', 'cyrillic'],
    weight: ['500', '600', '700', '800'],
    variable: '--font-playfair',
    display: 'swap',
});

export const lora = Lora({
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500', '600'],
    variable: '--font-lora',
    display: 'swap',
});

export const plusJakarta = Plus_Jakarta_Sans({
    subsets: ['latin', 'cyrillic-ext'],
    weight: ['500', '600', '700', '800'],
    variable: '--font-plus-jakarta',
    display: 'swap',
});

export const syne = Syne({
    subsets: ['latin'],
    weight: ['600', '700', '800'],
    variable: '--font-syne',
    display: 'swap',
});

/** Combined className to inject core font CSS custom properties onto <html> or <body> */
export const fontVariables = `${display.variable} ${body.variable} ${mono.variable}`;
