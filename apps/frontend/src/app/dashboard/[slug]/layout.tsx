import { ReactNode } from 'react';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
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
        <div className="relative flex min-h-screen flex-col bg-[#08080A] text-[#F5F4F2] md:flex-row">
            <AmbientBackground />
            <div className="relative z-10">
                <DashboardSidebar />
            </div>
            <main className="relative z-10 flex-1 px-4 py-8 sm:px-8 md:py-10">{children}</main>
        </div>
    );
}
