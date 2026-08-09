import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/auth/api/next-auth.config';
import { apiClient } from '@/lib/api-client';
import { Tenant } from '@my-app/database';
import { DashboardHubView } from '@/features/dashboard/components/DashboardHubView';

export const dynamic = 'force-dynamic';

export default async function DashboardHub() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    let tenants: Tenant[] = [];
    try {
        const res = await apiClient<Tenant[]>('/tenants/my', { method: 'GET' }, true);
        tenants = res.data ?? [];
    } catch {
        tenants = [];
    }

    if (tenants.length === 0) redirect('/onboarding');
    if (tenants.length === 1) redirect(`/dashboard/${tenants[0].slug}`);

    return <DashboardHubView tenants={tenants} userName={session.user?.name ?? undefined} />;
}
