'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error';
type ToastItem = { id: number; type: ToastType; message: string };

const listeners: ((t: ToastItem) => void)[] = [];
let counter = 0;

/** Lightweight toast API (no external dep) — used by the settings mutation. */
export const toast = {
    success: (message: string) => emit('success', message),
    error: (message: string) => emit('error', message),
};

function emit(type: ToastType, message: string) {
    const item = { id: ++counter, type, message };
    listeners.forEach((listener) => listener(item));
}

export function Toaster() {
    const [items, setItems] = useState<ToastItem[]>([]);

    useEffect(() => {
        const handler = (t: ToastItem) => {
            setItems((prev) => [...prev, t]);
            setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 4000);
        };
        listeners.push(handler);
        return () => {
            const index = listeners.indexOf(handler);
            if (index > -1) listeners.splice(index, 1);
        };
    }, []);

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
            <AnimatePresence>
                {items.map((t) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur-xl ${
                            t.type === 'success'
                                ? 'border-[#10B981]/30 bg-[#10B981]/10 text-[#04916C] dark:text-[#10B981]'
                                : 'border-red-500/30 bg-red-500/10 text-red-500'
                        }`}>
                        {t.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        <span className="flex-1">{t.message}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
