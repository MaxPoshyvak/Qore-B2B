import { apiClient } from '@/lib/api-client';
import { type AiWaiterChatInput, type AiWaiterChatResponseData } from '@my-app/types';

export class AiWaiterApi {
    static async sendMessage(input: AiWaiterChatInput): Promise<AiWaiterChatResponseData> {
        const res = await apiClient<AiWaiterChatResponseData>('/ai/waiter-chat', {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return res.data;
    }
}
