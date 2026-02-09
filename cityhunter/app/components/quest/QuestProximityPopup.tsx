"use client";

import { useDashboardContext } from '../../context/DashboardContext';
import { getItemById } from '../../constants/dashboard-constants';

export default function QuestProximityPopup() {
    const { questState, updateQuestState, excludedStopIds, monuments, events } = useDashboardContext();

    // Helper to find match in backend data
    const getItem = (id: string | number) => {
        if (!monuments && !events) return null;
        return (monuments || []).find(m => String(m.id) === String(id)) || 
               (events || []).find(e => String(e.id) === String(id));
    };

    // RENDER CONDITION:
    // 1. Must have a pending encounter (Proximity trigger matched)
    // 2. Quiz Modal must NOT be showing (prevent overlap)
    // 3. Must NOT be in the completed stops list (avoid spamming finished stops)
    if (!questState.pendingEncounterId || questState.showQuiz) return null;

    const target = getItem(questState.pendingEncounterId);
    if (!target) return null;

    // Extra safety: Check if already completed OR excluded
    if (questState.completedStopIds.includes(target.id) || excludedStopIds.includes(target.id)) return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-surface/90 backdrop-blur-md border border-accent/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(204,255,0,0.15)] flex items-center justify-between gap-4">
                
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0 animate-pulse">
                        <i className="fa-solid fa-location-crosshairs text-accent"></i>
                    </div>
                    <div className="min-w-0">
                        <div className="text-[10px] font-bold text-accent uppercase tracking-wider">TARGET IN RANGE</div>
                        <div className="text-sm font-bold text-white truncate">{target.name}</div>
                    </div>
                </div>

                <button 
                    onClick={() => updateQuestState({ showQuiz: true })}
                    className="shrink-0 bg-accent text-black font-black text-xs px-4 py-2 rounded-lg hover:scale-105 transition-transform shadow-lg shadow-accent/20"
                >
                    ENGAGE
                </button>

             </div>
        </div>
    );
}
