import { Metadata } from 'next';
import { ContactView } from '@/features/company';

export const metadata: Metadata = {
    title: 'Contact Us & Support | Qore',
    description: 'Get in touch with the Qore team for customer support, onboarding, sales, or partnership inquiries.',
};

export default function ContactPage() {
    return <ContactView />;
}
