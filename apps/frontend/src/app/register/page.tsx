import { AuthShell } from '@/features/auth/components/AuthShell';
import { AuthSidePanel } from '@/features/auth/components/AuthSidePanel';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
    return (
        <AuthShell side={<AuthSidePanel />}>
            <RegisterForm />
        </AuthShell>
    );
}
