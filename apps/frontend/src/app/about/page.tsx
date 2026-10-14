import { Metadata } from 'next';
import { AboutView } from '@/features/company';

export const metadata: Metadata = {
    title: 'About Qore | The Operating System for Modern Hospitality',
    description: 'Learn about Qore, our mission, real-time collaborative table dining, and AI for restaurants and cafes.',
};

export default function AboutPage() {
    return <AboutView />;
}
