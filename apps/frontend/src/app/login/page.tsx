import { AuthShell } from '@/features/auth/components/AuthShell';
import { AuthSidePanel } from '@/features/auth/components/AuthSidePanel';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
    return (
        <AuthShell side={<AuthSidePanel />}>
            <LoginForm />
        </AuthShell>
    );
}
