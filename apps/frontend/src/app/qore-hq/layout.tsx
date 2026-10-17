import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Platform HQ | Qore',
    robots: {
        index: false,
        follow: false,
    },
};

export default function QoreHqLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
