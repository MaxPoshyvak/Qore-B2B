'use client';

import { Mail } from 'lucide-react';
import { mono } from '@/shared/lib/fonts';
import Link from 'next/link';

type Mailbox = {
    label: string;
    url: (email: string) => string;
};

const MAILBOXES: Array<{ match: (email: string) => boolean; mailbox: Mailbox }> = [
    {
        match: (email) => email.endsWith('@gmail.com'),
        mailbox: {
            label: 'Open Gmail',
            url: (email) => `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(email)}`,
        },
    },
    {
        match: (email) => email.endsWith('@outlook.com') || email.endsWith('@hotmail.com'),
        mailbox: {
            label: 'Open Outlook',
            url: () => 'https://outlook.live.com/mail/0/inbox',
        },
    },
    {
        match: (email) => email.endsWith('@yahoo.com'),
        mailbox: {
            label: 'Open Yahoo',
            url: () => 'https://mail.yahoo.com',
        },
    },
];

export function resolveMailbox(email: string): Mailbox | null {
    const found = MAILBOXES.find((m) => m.match(email));
    return found ? found.mailbox : null;
}

export function SmartMailboxButton({ email }: { email: string }) {
    const mailbox = resolveMailbox(email);
    const label = mailbox?.label ?? 'Check your inbox';
    const href = mailbox?.url(email) ?? 'https://mail.google.com';

    return (
        <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E7E5E0] bg-white px-5 py-3.5 text-[14px] font-medium text-[#0A0A0C] transition-colors hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5 dark:border-[#232327] dark:bg-[#141417] dark:text-[#F5F4F2] ${mono.className}`}>
            <Mail size={16} className="text-[#6B6A65] dark:text-[#94938D]" />
            {label}
        </Link>
    );
}
