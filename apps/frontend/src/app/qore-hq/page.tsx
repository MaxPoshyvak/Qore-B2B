'use client';

import { usePlatformAuth } from '@/features/platform-admin/hooks/usePlatformAdmin';
import { PlatformLoginCard } from '@/features/platform-admin/components/PlatformLoginCard';
import { PlatformAdminDashboard } from '@/features/platform-admin/components/PlatformAdminDashboard';
import { Loader2 } from 'lucide-react';

export default function QoreHqPage() {
    const { isAuthenticated, setIsAuthenticated, logout } = usePlatformAuth();

    if (isAuthenticated === null) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C] text-white">
                <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <PlatformLoginCard onSuccess={() => setIsAuthenticated(true)} />;
    }

    return <PlatformAdminDashboard onLogout={logout} />;
}
