'use client';

import { useState, useCallback } from 'react';
import type {
    AiWaiterChatMessage,
    AiWaiterRecommendedDish,
} from '@my-app/types';
import { AiWaiterApi } from '../api/ai-waiter.api';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    recommendedDishes?: AiWaiterRecommendedDish[];
    timestamp: number;
}

export interface UseAiWaiterChatOptions {
    venueSlug: string;
    language: string;
    cartItemIds: string[];
}

export function useAiWaiterChat({
    venueSlug,
    language,
    cartItemIds,
}: UseAiWaiterChatOptions) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || isPending) return;

            setError(null);
            const userMsgId = `user-${Date.now()}`;
            const userMsg: ChatMessage = {
                id: userMsgId,
                role: 'user',
                content: trimmed,
                timestamp: Date.now(),
            };

            // Build history payload for the backend (last 6 messages max)
            const historyPayload: AiWaiterChatMessage[] = messages.slice(-6).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            setMessages((prev) => [...prev, userMsg]);
            setIsPending(true);

            try {
                const response = await AiWaiterApi.sendMessage({
                    venueSlug,
                    message: trimmed,
                    history: historyPayload,
                    cartItemIds,
                    language,
                });

                const assistantMsgId = `assistant-${Date.now()}`;
                const assistantMsg: ChatMessage = {
                    id: assistantMsgId,
                    role: 'assistant',
                    content: response.reply,
                    recommendedDishes: response.recommendedDishes,
                    timestamp: Date.now(),
                };

                setMessages((prev) => [...prev, assistantMsg]);
            } catch (err: unknown) {
                console.error('AI Waiter chat error:', err);
                const errorText =
                    err instanceof Error ? err.message : 'Failed to reach AI Waiter';
                setError(errorText);

                // Add a gentle error message in the chat
                const errorMsgId = `assistant-error-${Date.now()}`;
                setMessages((prev) => [
                    ...prev,
                    {
                        id: errorMsgId,
                        role: 'assistant',
                        content:
                            language.startsWith('uk')
                                ? 'Вибачте, виникла тимчасова затримка зв’язку. Будь ласка, спробуйте ще раз через мить.'
                                : 'Sorry, a temporary connection issue occurred. Please try asking again in a moment.',
                        timestamp: Date.now(),
                    },
                ]);
            } finally {
                setIsPending(false);
            }
        },
        [messages, isPending, venueSlug, cartItemIds, language],
    );

    const resetChat = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return {
        messages,
        isPending,
        error,
        sendMessage,
        resetChat,
    };
}
