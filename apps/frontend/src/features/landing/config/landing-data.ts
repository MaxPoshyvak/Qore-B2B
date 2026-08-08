import {
    Users,
    SplitSquareHorizontal,
    Timer,
    CircleSlash2,
    Star,
    Palette,
    TrendingUp,
    BarChart3,
    QrCode,
} from 'lucide-react';

import type { ElementType } from 'react';

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

export const NAV_LINKS: { href: string; label: string }[] = [
    { href: '#features', label: 'Features' },
    { href: '#how', label: 'How it works' },
    { href: '#ai', label: 'AI' },
    { href: '#pricing', label: 'Pricing' },
];

/* ------------------------------------------------------------------ */
/*  Hero metrics                                                       */
/* ------------------------------------------------------------------ */

export type HeroMetric = {
    value: number;
    prefix?: string;
    suffix?: string;
    label: string;
};

export const HERO_METRICS: HeroMetric[] = [
    { value: 1, prefix: '<', suffix: 's', label: 'load time' },
    { value: 38, suffix: '%', label: 'higher check with AI' },
    { value: 24, suffix: '/7', label: 'AI concierge' },
];

/* ------------------------------------------------------------------ */
/*  Comparison                                                         */
/* ------------------------------------------------------------------ */

export const COMPARISON_TYPICAL: string[] = [
    "Static PDF that's hard to update from a phone",
    'Slow to load on weak in-house Wi-Fi',
    'Every guest has their own separate cart',
    'The server splits the bill by hand',
];

export const COMPARISON_QORE: string[] = [
    'Server-rendered, ready in under a second',
    'One shared table cart, updated in real time',
    'Guests split the bill themselves — evenly or by item',
    'Menu is edited in the dashboard and updates instantly',
];

/* ------------------------------------------------------------------ */
/*  How it works                                                       */
/* ------------------------------------------------------------------ */

export type Step = {
    n: string;
    icon: ElementType;
    title: string;
    desc: string;
};

export const HOW_STEPS: Step[] = [
    {
        n: '01',
        icon: QrCode,
        title: 'Scan the QR',
        desc: 'The menu opens instantly in the browser — no app, no sign-up.',
    },
    {
        n: '02',
        icon: Users,
        title: 'Order together',
        desc: 'Everyone at the table sees one cart and what others add, in real time.',
    },
    {
        n: '03',
        icon: SplitSquareHorizontal,
        title: 'Split the bill',
        desc: 'Evenly or by chosen items — guests pay themselves, no server needed.',
    },
];

/* ------------------------------------------------------------------ */
/*  Features (bento)                                                   */
/* ------------------------------------------------------------------ */

export type Feature = {
    icon: ElementType;
    title: string;
    desc: string;
    span?: boolean;
    iconType?: 'default' | 'lightning' | 'coffee';
};

export const FEATURES: Feature[] = [
    {
        icon: Users,
        title: 'Live Table Cart',
        desc: 'Several guests at one table see the same menu and one shared cart, updated live.',
        span: true,
    },
    {
        icon: SplitSquareHorizontal,
        title: 'Split Bill',
        desc: 'Evenly or by chosen items — guests settle up themselves, no server needed.',
    },
    {
        icon: Timer,
        title: 'Order-ahead',
        desc: 'Guests order on the way and skip the line the moment they arrive.',
        iconType: 'coffee',
    },
    {
        icon: CircleSlash2,
        title: '86 list',
        desc: '86 a dish from the kitchen and it disappears from every active table session instantly.',
    },
    {
        icon: Timer,
        title: 'Happy Hour',
        desc: 'A discount with a live countdown; prices recalculate automatically when it ends.',
        iconType: 'lightning',
    },
    {
        icon: Star,
        title: 'NPS scores',
        desc: 'Guests rate their visit right after paying — a low score pings you on Telegram instantly.',
    },
];

/* ------------------------------------------------------------------ */
/*  AI section                                                         */
/* ------------------------------------------------------------------ */

export type AiPill = { icon: ElementType; title: string };

export const AI_PILLS: AiPill[] = [
    { icon: Palette, title: 'Design from a prompt' },
    { icon: TrendingUp, title: 'Upsell in cart' },
    { icon: BarChart3, title: 'AI NPS summaries' },
];

/* ------------------------------------------------------------------ */
/*  Split bill benefits                                                */
/* ------------------------------------------------------------------ */

export const SPLIT_BENEFITS: string[] = [
    'Every item remembers who ordered it',
    'Pay just your share or split evenly',
    'Lock items before paying — no race conditions',
];

/* ------------------------------------------------------------------ */
/*  Pricing                                                            */
/* ------------------------------------------------------------------ */

export type PricingPlan = {
    tier: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    featured?: boolean;
    cta: string;
};

export const PRICING_PLANS: PricingPlan[] = [
    {
        tier: 'Free',
        price: '$0',
        period: '/mo',
        description: 'Everything you need to launch one venue.',
        cta: 'Start for free',
        features: [
            'Menu, categories, table QR codes',
            'Reservations and calendar',
            'Live table cart and split billing',
            'Order-ahead and the 86 list',
            'Dynamic happy hour',
            'Basic analytics and NPS',
        ],
    },
    {
        tier: 'Pro',
        price: '$39',
        period: '/mo',
        description: 'Everything in Free, plus the AI growth engine.',
        featured: true,
        cta: 'Upgrade to Pro',
        features: [
            'Everything in Free',
            'AI waiter concierge',
            'AI menu design generator',
            'AI upselling in cart',
            'AI sentiment analysis on NPS',
            'Advanced analytics and forecasts',
        ],
    },
    {
        tier: 'Business',
        price: 'Custom',
        description: 'For restaurant groups and custom infrastructure.',
        cta: 'Contact us',
        features: [
            'Everything in Pro',
            'POS integrations (Square, Toast, Lightspeed)',
            'Custom domain and white-label',
            'Multi-location support',
            'Priority support',
        ],
    },
];

/* ------------------------------------------------------------------ */
/*  Footer                                                            */
/* ------------------------------------------------------------------ */

export const FOOTER_COLUMNS: { title: string; links: string[] }[] = [
    { title: 'Product', links: ['Features', 'How it works', 'Pricing'] },
    { title: 'Company', links: ['About', 'Contact'] },
    { title: 'Legal', links: ['Terms', 'Privacy'] },
];

export const FOOTER_LINK_HREF: Record<string, string> = {
    Features: '#features',
    'How it works': '#how',
    Pricing: '#pricing',
    About: '#',
    Contact: '#',
    Terms: '#',
    Privacy: '#',
};

/* ------------------------------------------------------------------ */
/*  Integrations marquee                                              */
/* ------------------------------------------------------------------ */

export const INTEGRATIONS: string[] = [
    'Stripe',
    'Square',
    'Toast POS',
    'Lightspeed',
    'Twilio',
    'PayPal',
    'Cloudinary',
    'Adyen',
];

/* ------------------------------------------------------------------ */
/*  Phone demo data                                                    */
/* ------------------------------------------------------------------ */

export const PHONE_PLAIN_ITEMS: { name: string; price: number }[] = [
    { name: 'Cappuccino', price: 4.5 },
    { name: 'Almond Croissant', price: 5.5 },
    { name: 'Matcha Latte', price: 5.75 },
    { name: 'Cheesecake', price: 6.5 },
];

export const PHONE_RICH_ITEMS: {
    name: string;
    desc: string;
    price: number;
    emoji: string;
    gradient: string;
}[] = [
    {
        name: 'Cappuccino',
        desc: 'double shot, oat milk',
        price: 4.5,
        emoji: '☕',
        gradient: 'from-amber-200 to-orange-300',
    },
    {
        name: 'Croissant',
        desc: 'fresh baked, buttery',
        price: 5.5,
        emoji: '🥐',
        gradient: 'from-yellow-200 to-amber-300',
    },
    {
        name: 'Matcha',
        desc: 'ceremonial, iced',
        price: 5.75,
        emoji: '🍵',
        gradient: 'from-green-200 to-emerald-300',
    },
    {
        name: 'Cheesecake',
        desc: 'NY style, berries',
        price: 6.5,
        emoji: '🍰',
        gradient: 'from-pink-200 to-rose-300',
    },
];

export const PHONE_BUTTON = { x: 50, y: 82 };

/* ------------------------------------------------------------------ */
/*  Live table ticket events                                          */
/* ------------------------------------------------------------------ */

export type TicketEvent = { guest: string; initials: string; color: string; item: string; price: number };

export const TICKET_EVENTS: TicketEvent[] = [
    { guest: 'Olivia', initials: 'O', color: '#3B82F6', item: 'Cappuccino', price: 4.5 },
    { guest: 'Max', initials: 'M', color: '#8B5CF6', item: 'Almond Croissant', price: 5.5 },
    { guest: 'Dana', initials: 'D', color: '#10B981', item: 'Latte', price: 4.75 },
    { guest: 'Olivia', initials: 'O', color: '#3B82F6', item: 'Cheesecake', price: 6.5 },
    { guest: 'Max', initials: 'M', color: '#8B5CF6', item: 'Americano', price: 3.75 },
];

/* ------------------------------------------------------------------ */
/*  AI demo pairs                                                     */
/* ------------------------------------------------------------------ */

export const AI_DEMO: { q: string; a: string }[] = [
    { q: 'Recommend something spicy, gluten-free', a: 'Shrimp tom yum — spicy, gluten-free, ready in 15 min.' },
    { q: 'What pairs well with a cappuccino?', a: 'Almond croissant — ordered together 68% of the time.' },
    { q: 'Anything meat-free and quick?', a: 'Tofu quinoa bowl — ready in 10 min, 320 cal.' },
];
