"use client";

import { useDashboardContext } from '../../context/DashboardContext';
import { useEffect } from 'react';
import { QuestPersistence } from '../../utils/quest-persistence';

export default function QuestCompletionModal() {
    const { questState, updateQuestState, activeWalk, excludedStopIds } = useDashboardContext();

    // Calculate actual total stops (excluding skipped/deselected ones)
    const validStopCount = activeWalk?.stopIds.filter(id => !excludedStopIds.includes(id)).length || 0;

    if (!questState.showCompletionModal) return null;

    const handleFinish = () => {
        if (activeWalk) {
            QuestPersistence.clearQuestState(activeWalk.id);
        }
        updateQuestState({
            isActive: false,
            activeWalkId: null,
            currentStopIndex: 0,
            pendingEncounterId: null,
            showQuiz: false,
            showCompletionModal: false,
            xpGained: 0,
            completedStopIds: []
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-500">
            <div className="bg-surface border border-accent/20 rounded-3xl w-full max-w-lg overflow-hidden relative shadow-xl text-center p-8">
                
                {/* TROPHY ICON - SIMPLIFIED */}
                <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-surface border-2 border-accent rounded-full">
                    <i className="fa-solid fa-trophy text-4xl text-accent"></i>
                </div>

                <div className="space-y-2 mb-8">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-primary">
                        Quest Complete
                    </h2>
                    <p className="text-secondary font-mono text-sm">Mission Status: <span className="text-accent">SUCCESS</span></p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-surface/50 border border-divider/10 rounded-2xl p-4">
                        <div className="text-xs font-mono text-secondary mb-1">TOTAL XP</div>
                        <div className="text-2xl font-black text-primary">+{questState.xpGained}</div>
                    </div>
                    <div className="bg-surface/50 border border-divider/10 rounded-2xl p-4">
                        <div className="text-xs font-mono text-secondary mb-1">STOPS VISITED</div>
                        <div className="text-2xl font-black text-primary">{validStopCount}</div>
                    </div>
                </div>

                <button 
                    onClick={handleFinish}
                    className="w-full py-4 bg-accent text-black font-black text-lg rounded-2xl hover:scale-[1.02] shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all"
                >
                    CONTINUE
                </button>

            </div>
        </div>
    );
}
