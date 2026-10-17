'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type DemoScene = 'waiter' | 'themes' | 'upsell' | 'reviews';

export const DEMO_SCENES: DemoScene[] = ['waiter', 'themes', 'upsell', 'reviews'];

export const SCENE_DURATION_MS = 8500;
const TICK_INTERVAL_MS = 40;

export function usePhoneDemo() {
    const [sceneIndex, setSceneIndex] = useState(0);
    const [elapsedMs, setElapsedMs] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const elapsedRef = useRef(0);

    const activeScene = DEMO_SCENES[sceneIndex];

    const setScene = useCallback((scene: DemoScene) => {
        const idx = DEMO_SCENES.indexOf(scene);
        if (idx !== -1) {
            setSceneIndex(idx);
            elapsedRef.current = 0;
            setElapsedMs(0);
        }
    }, []);

    useEffect(() => {
        if (isPaused) return;

        const startTime = Date.now() - elapsedRef.current;

        const interval = setInterval(() => {
            const current = Date.now() - startTime;
            if (current >= SCENE_DURATION_MS) {
                elapsedRef.current = 0;
                setElapsedMs(0);
                setSceneIndex((prev) => (prev + 1) % DEMO_SCENES.length);
            } else {
                elapsedRef.current = current;
                setElapsedMs(current);
            }
        }, TICK_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isPaused, sceneIndex]);

    const progress = Math.min(100, (elapsedMs / SCENE_DURATION_MS) * 100);

    return {
        activeScene,
        sceneIndex,
        elapsedMs,
        progress,
        isPaused,
        setIsPaused,
        setScene,
    };
}
