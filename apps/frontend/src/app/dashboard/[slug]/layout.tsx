import { ReactNode } from 'react';
import { DashboardSidebar, DashboardMobileNav } from '@/features/dashboard/components/DashboardSidebar';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';

export default async function DashboardLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ slug: string }>;
}) {
    await params;

    return (
        <div className="relative flex min-h-screen flex-col bg-[#0A0A0C] text-[#F5F4F2] md:h-screen md:flex-row md:overflow-hidden">
            <AmbientBackground />
            <DashboardSidebar />
            <DashboardMobileNav />
            <main className="relative z-10 flex-1 px-4 py-8 sm:px-8 md:h-full md:overflow-y-auto md:py-10">
                {children}
            </main>
        </div>
    );
}
