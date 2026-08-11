'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Copies text to the clipboard and exposes a transient `copied` flag. */
export function useCopyToClipboard(resetMs = 2000) {
    const [copied, setCopied] = useState(false);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const copy = useCallback(
        async (text: string) => {
            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(text);
                } else {
                    const el = document.createElement('textarea');
                    el.value = text;
                    el.style.position = 'fixed';
                    el.style.opacity = '0';
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand('copy');
                    document.body.removeChild(el);
                }
                setCopied(true);
                if (timeout.current) clearTimeout(timeout.current);
                timeout.current = setTimeout(() => setCopied(false), resetMs);
            } catch {
                setCopied(false);
            }
        },
        [resetMs],
    );

    useEffect(() => () => {
        if (timeout.current) clearTimeout(timeout.current);
    }, []);

    return { copied, copy };
}
