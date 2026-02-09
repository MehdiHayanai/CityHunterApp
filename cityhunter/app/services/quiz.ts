import { fetchWithAuth } from "../lib/api";

export interface QuizResponse {
    id: string;
    monument_id: string;
    question: string;
    options: string[];
    xp_reward: number;
    difficulty: string;
}

export interface AnswerResponse {
    success: boolean;
    message: string;
    correct_answer: number;
    xp_earned: number;
    new_total_xp: number;
}

export const QuizService = {
    async getNextQuiz(monumentId: string): Promise<QuizResponse | null> {
        try {
            // fetchWithAuth parses JSON by default.
            // If API returns 204 or empty info, we need to handle it.
            // But fetchWithAuth throws if not ok.
            
            // For this specific API, if it returns "null" text, we need to handle that.
            // fetchWithAuth returns parsed JSON, so if it's "null", result is null.
            const result = await fetchWithAuth(`/quizzes/monument/${monumentId}/next`);
            return result;
        } catch (error: any) {
            // Check if it's just no quiz available?
            console.error('[QuizService] Error in getNextQuiz:', error);
            throw error;
        }
    },

    async submitAnswer(quizId: string, answerIndex: number): Promise<AnswerResponse> {
        try {
            return await fetchWithAuth(`/quizzes/${quizId}/answer`, {
                method: 'POST',
                body: JSON.stringify({ answer_index: answerIndex }),
            });
        } catch (error) {
            console.error('[QuizService] Error in submitAnswer:', error);
            throw error;
        }
    }
};
