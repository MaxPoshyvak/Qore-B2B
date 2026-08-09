import { OnboardingShell } from '@/features/onboarding/components/OnboardingShell';
import { OnboardingForm } from '@/features/onboarding/components/OnboardingForm';

export default function OnboardingPage() {
    return (
        <OnboardingShell>
            <OnboardingForm />
        </OnboardingShell>
    );
}
