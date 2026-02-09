import { QuestState, INITIAL_QUEST_STATE } from "../interfaces/quest";

const STORAGE_KEY = "cityhunter_quest_state";

interface SavedWalks {
    [walkId: string]: QuestState;
}

export const QuestPersistence = {
    // Save specific walk state (MERGE with existing)
    saveQuestState: (walkId: number | string, state: QuestState) => {
        if (typeof window === 'undefined') return;
        
        const existing = QuestPersistence.getAllSavedQuests();
        existing[String(walkId)] = state;
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    },

    // Load specific walk state
    loadQuestState: (walkId: number | string): QuestState | null => {
        if (typeof window === 'undefined') return null;
        
        const existing = QuestPersistence.getAllSavedQuests();
        return existing[String(walkId)] || null;
    },

    // Get all saved states
    getAllSavedQuests: (): SavedWalks => {
        if (typeof window === 'undefined') return {};
        
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error("Failed to parse saved quests", e);
            return {};
        }
    },

    // Clear specific walk state (on finish)
    clearQuestState: (walkId: number | string) => {
        if (typeof window === 'undefined') return;
        
        const existing = QuestPersistence.getAllSavedQuests();
        delete existing[String(walkId)];
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
};
