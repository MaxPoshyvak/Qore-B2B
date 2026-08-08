'use client';

import { display, mono } from '../../lib/fonts';

export function AmbientBackground() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#FAFAF9] dark:bg-[#08080A]">
            <div
                className="absolute inset-0 opacity-60"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 50% at 20% 20%, rgba(59,130,246,0.08), transparent 70%), radial-gradient(ellipse 50% 60% at 80% 80%, rgba(59,130,246,0.06), transparent 70%)',
                }}
            />
            <div
                aria-hidden
                className="absolute inset-0 bg-[image:linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:44px_44px] dark:bg-[image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_40%,#FAFAF9_100%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_40%,#08080A_100%)]" />
        </div>
    );
}
