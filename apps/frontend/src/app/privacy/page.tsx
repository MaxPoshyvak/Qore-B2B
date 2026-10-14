import { Metadata } from 'next';
import { PrivacyView } from '@/features/legal';

export const metadata: Metadata = {
    title: 'Privacy Policy | Qore',
    description: 'Privacy Policy and GDPR compliance information for Qore B2B SaaS platform.',
};

export default function PrivacyPage() {
    return <PrivacyView />;
}
