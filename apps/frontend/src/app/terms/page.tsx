import { Metadata } from 'next';
import { TermsView } from '@/features/legal';

export const metadata: Metadata = {
    title: 'Terms of Service | Qore',
    description: 'Terms of Service and commercial SaaS agreement for Qore B2B platform.',
};

export default function TermsPage() {
    return <TermsView />;
}
