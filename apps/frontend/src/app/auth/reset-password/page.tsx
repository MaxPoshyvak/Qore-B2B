import { Suspense } from 'react';
import { ResetPasswordClient } from '@/features/auth/components/ResetPasswordClient';

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordClient />
        </Suspense>
    );
}
