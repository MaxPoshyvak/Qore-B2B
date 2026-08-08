import { OnboardingShell } from '@/features/tenants/components/OnboardingShell';
import { OnboardingForm } from '@/features/tenants/components/OnboardingForm';

export default function OnboardingPage() {
    return (
        <OnboardingShell>
            <OnboardingForm />
        </OnboardingShell>
    );
}
