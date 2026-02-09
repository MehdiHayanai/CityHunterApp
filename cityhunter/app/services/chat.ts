import { fetchWithAuth } from "@/app/lib/api";

export interface ChatSession {
    session_id: string;
    status: string;
}

export interface ChatMessageRequest {
    message: string;
    user_id: string;
    location?: {
        lat: number;
        lon: number;
        radius?: number;
    };
}

export interface ChatMessageResponse {
    response: string;
}

export const ChatService = {
    /**
     * Create or initialize a chat session.
     */
    createSession: async (userId: string, sessionId?: string): Promise<ChatSession> => {
        try {
            return await fetchWithAuth('/chat/sessions', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, session_id: sessionId }),
                timeout: 60000, // 60s for session creation
            });
        } catch (error) {
            console.error('[ChatService] Error creating session:', error);
            throw error;
        }
    },

    /**
     * Send a message to the chat agent.
     */
    sendMessage: async (sessionId: string, message: string, userId: string, location?: { lat: number, lon: number }): Promise<ChatMessageResponse> => {
        try {
            return await fetchWithAuth(`/chat/sessions/${sessionId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ 
                    message, 
                    user_id: userId,
                    location 
                }),
                timeout: 120000, // 120s timeout for LLM response
            });
        } catch (error) {
            console.error('[ChatService] Error sending message:', error);
            throw error;
        }
    }
};
