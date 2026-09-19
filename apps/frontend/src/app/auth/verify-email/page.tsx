import { Suspense } from 'react';
import { VerifyEmailClient } from '@/features/auth/components/VerifyEmailClient';

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={null}>
            <VerifyEmailClient />
        </Suspense>
    );
}
