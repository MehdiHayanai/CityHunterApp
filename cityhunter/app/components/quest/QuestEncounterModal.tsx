"use client";

import { useDashboardContext } from '../../context/DashboardContext';
import { getItemById } from '../../constants/dashboard-constants';
import { useState, useEffect } from 'react';
import { QuizService } from '../../services/quiz';
import { useAuthStore } from '@/store/useAuthStore';

export default function QuestEncounterModal() {
    const { questState, updateQuestState, activeWalk, excludedStopIds, monuments, events } = useDashboardContext();
    const refreshUser = useAuthStore(state => state.refreshUser);
    
    // Helper to find match in backend data
    const getItem = (id: string | number) => {
        if (!monuments && !events) return null;
        return (monuments || []).find(m => String(m.id) === String(id)) || 
               (events || []).find(e => String(e.id) === String(id));
    };
    
    // Local flow state: 'arrival' | 'quiz' | 'reward'
    const [phase, setPhase] = useState<'arrival' | 'quiz' | 'reward'>('quiz');
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [hasAttempted, setHasAttempted] = useState(false);

    const target = questState.pendingEncounterId ? getItem(questState.pendingEncounterId) : null;

    // Fetch Quiz on Open
    useEffect(() => {
        if (questState.showQuiz && questState.pendingEncounterId && target) {
            setPhase('quiz');
            setSelectedAnswer(null);
            setIsConfirmed(false);
            setIsCorrect(false);
            
            async function loadQuiz() {
                try {
                    updateQuestState({ quizLoading: true, quizError: null });
                    setHasAttempted(true);
                    const quiz = await QuizService.getNextQuiz(String(target.id));
                    updateQuestState({ currentQuiz: quiz, quizLoading: false });
                    
                    // If no quiz is available, we stay in the modal to show the "All Secrets Unlocked" state
                    // The UI will handle rendering the achievement screen.
                    if (!quiz) {
                        console.log("No challenge available for this sector.");
                    }
                } catch (err: any) {
                    console.error("Failed to load quest quiz:", err);
                    updateQuestState({ quizLoading: false, quizError: "Neural link failed. Retrying..." });
                }
            }
            loadQuiz();
        }
    }, [questState.showQuiz, questState.pendingEncounterId, target]);

    if (!questState.showQuiz || !questState.pendingEncounterId || !target) return null;
    
    const currentQuiz = questState.currentQuiz;



    // Derived Valid Stops
    const validStopCount = activeWalk?.stopIds.filter(id => !excludedStopIds.includes(id)).length || 0;

    const handleAnswer = (index: number) => {
        if (isConfirmed || submitting) return; // Prevent changing after confirmation
        setSelectedAnswer(index);
    };

    const handleAction = async () => {
        if (phase === 'quiz') {
            if (selectedAnswer !== null && currentQuiz) {
                if (!isConfirmed) {
                    // STEP 1: CONFIRM (Server Side)
                    setSubmitting(true);
                    try {
                        const res = await QuizService.submitAnswer(currentQuiz.id, selectedAnswer);
                        setIsConfirmed(true);
                        setIsCorrect(res.success);
                        if (res.success) {
                            refreshUser();
                        }
                    } catch (e) {
                        console.error("Failed to verify answer:", e);
                        alert("Grid verification failed. Check connection.");
                    } finally {
                        setSubmitting(false);
                    }
                } else {
                    // STEP 2: PROCEED TO REWARD (after seeing result)
                    setPhase('reward');
                }
            }
        } else if (phase === 'reward') {
             proceedToNext();
        }
    };

    // Extracted for clarity
    const proceedToNext = () => {
            // CALCULATE PROGRESS
            // Only add XP if not already completed (safety)
            const isAlreadyCompleted = questState.completedStopIds.includes(target.id);
            const xpToAdd = (!isAlreadyCompleted && isCorrect && currentQuiz) ? currentQuiz.xp_reward : 0;
            const currentTotalXP = questState.xpGained + xpToAdd;
            
            // Advance Logic
            const nextIndex = questState.currentStopIndex + 1;
            const isComplete = nextIndex >= validStopCount;
            
            // Add to completed list (if not already there)
            let newCompletedIds = [...questState.completedStopIds];
            if (!isAlreadyCompleted) {
                newCompletedIds.push(target.id);
            }

            if (isComplete) {
                // TRIGGER COMPLETION MODAL
                updateQuestState({
                    pendingEncounterId: null,
                    showQuiz: false,
                    currentQuiz: null,
                    xpGained: currentTotalXP,
                    completedStopIds: newCompletedIds,
                    showCompletionModal: true 
                });
            } else {
                // NEXT STOP
                updateQuestState({
                    currentStopIndex: nextIndex,
                    showQuiz: false,
                    pendingEncounterId: null,
                    currentQuiz: null,
                    completedStopIds: newCompletedIds,
                    xpGained: currentTotalXP
                });
            }
    };

    const handleClose = () => {
        // User closes modal without completing
        updateQuestState({ showQuiz: false }); 
        // Note: pendingEncounterId remains set, so Proximity Popup reappears
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-surface border border-divider/10 rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl">
                
                {/* CLOSE BUTTON */}
                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors backdrop-blur-md"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>

                {/* PHASE: QUIZ - MATCHING STYLE TO ExperienceQuiz.tsx */}
                {phase === 'quiz' && (
                    <>
                        {/* HEADER IMAGE OVERLAY */}
                        <div className="absolute top-0 left-0 right-0 h-32 z-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${target.img})` }}></div>
                        <div className="absolute top-0 left-0 right-0 h-32 z-0 bg-gradient-to-b from-transparent to-surface"></div>

                        <div className="p-8 animate-in slide-in-from-right duration-300 relative z-10 mt-16">
                             <div className="flex justify-between items-end mb-8">
                                <div>
                                    <div className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">TARGET: {target.name}</div>
                                    <span className="text-xs font-mono font-bold text-secondary">DECRYPTION CHALLENGE</span>
                                </div>
                                <span className="px-2 py-1 bg-accent/10 text-accent text-[10px] font-mono font-bold rounded border border-accent/20">
                                    +{currentQuiz?.xp_reward || 0} XP
                                </span>
                            </div>

                            {questState.quizLoading ? (
                                <div className="py-20 text-center">
                                    <i className="fa-solid fa-spinner fa-spin text-4xl text-accent mb-4"></i>
                                    <p className="font-mono text-xs text-secondary animate-pulse uppercase tracking-[0.2em]">Establishing Neural Link...</p>
                                </div>
                            ) : questState.quizError ? (
                                <div className="py-20 text-center">
                                    <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-4"></i>
                                    <p className="text-secondary text-sm mb-6">{questState.quizError}</p>
                                    <button 
                                        onClick={() => updateQuestState({ showQuiz: true })} // Trigger re-effect
                                        className="text-accent font-bold text-xs uppercase tracking-widest hover:underline"
                                    >
                                        RETRY UPLINK
                                    </button>
                                </div>
                            ) : currentQuiz ? (
                                <>
                                    <h3 className="text-xl font-bold mb-8 leading-tight text-primary">{currentQuiz.question}</h3>

                                    <div className="space-y-3">
                                        {currentQuiz.options.map((opt, i) => {
                                            let styleClass = 'bg-surface border-divider/10 hover:border-accent hover:bg-surface/80 text-secondary hover:text-primary';
                                            let iconClass = '';

                                            if (selectedAnswer === i) {
                                                if (!isConfirmed) {
                                                    styleClass = 'bg-blue-500/10 border-blue-500 text-blue-400';
                                                    iconClass = submitting ? 'fa-spinner fa-spin' : 'fa-circle-dot'; 
                                                } else {
                                                    if (isCorrect) {
                                                        styleClass = 'bg-green-500/20 border-green-500 text-green-400';
                                                        iconClass = 'fa-check';
                                                    } else {
                                                        styleClass = 'bg-red-500/20 border-red-500 text-red-400';
                                                        iconClass = 'fa-xmark';
                                                    }
                                                }
                                            }

                                            return (
                                            <button
                                                key={i}
                                                onClick={() => handleAnswer(i)}
                                                disabled={isConfirmed || submitting}
                                                className={`w-full text-left p-5 rounded-2xl border transition-all font-medium group relative overflow-hidden ${styleClass}`}
                                            >
                                                 <span className="relative z-10 flex justify-between items-center">
                                                    {opt}
                                                    {selectedAnswer === i && (
                                                        <i className={`fa-solid ${iconClass}`}></i>
                                                    )}
                                                 </span>
                                                {selectedAnswer === null && <div className="absolute inset-0 bg-accent/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>}
                                            </button>
                                            );
                                        })}
                                    </div>

                                    <button 
                                        disabled={selectedAnswer === null || submitting}
                                        onClick={handleAction}
                                        className={`w-full mt-8 py-4 font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${
                                            isConfirmed 
                                                ? 'bg-primary text-canvas hover:bg-accent hover:text-black' 
                                                : 'bg-accent text-black hover:bg-white'
                                        }`}
                                    >
                                        {submitting ? 'COMMUNICATING...' : selectedAnswer === null 
                                            ? 'SELECT AN ANSWER' 
                                            : (isConfirmed ? 'CONTINUE' : 'CONFIRM ANSWER')
                                        }
                                    </button>
                                </>
                            ) : (hasAttempted && !questState.quizLoading) ? (
                                <div className="py-8 text-center animate-in fade-in zoom-in duration-700">
                                    <div className="relative w-24 h-24 mx-auto mb-6">
                                        <div className="absolute inset-0 bg-accent rounded-full blur-2xl opacity-20 animate-pulse"></div>
                                        <div className="relative w-full h-full bg-surface/50 rounded-full flex items-center justify-center border border-accent/30 shadow-[0_0_30px_rgba(204,255,0,0.15)]">
                                            <i className="fa-solid fa-trophy text-4xl text-accent"></i>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black mb-2 tracking-tighter text-primary uppercase italic">
                                        All Secrets Unlocked
                                    </h3>
                                    
                                    <p className="text-secondary font-mono text-[10px] mb-8 leading-relaxed uppercase tracking-widest px-4">
                                        You have extracted all available intel from this sector. Mastery achieved.
                                    </p>

                                    <button 
                                        onClick={() => {
                                            setIsCorrect(true);
                                            proceedToNext();
                                        }}
                                        className="w-full py-4 bg-accent text-black font-black rounded-2xl hover:bg-white transition-all shadow-lg shadow-accent/20 uppercase tracking-widest text-xs"
                                    >
                                        CONTINUE MISSION <i className="fa-solid fa-arrow-right ml-1"></i>
                                    </button>
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <i className="fa-solid fa-spinner fa-spin text-4xl text-accent mb-4"></i>
                                    <p className="font-mono text-xs text-secondary animate-pulse uppercase tracking-[0.2em]">Establishing Neural Link...</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* PHASE: REWARD - MATCHING SUCCESS STYLE */}
                {phase === 'reward' && (
                    <div className="text-center py-12 px-8 animate-in zoom-in duration-500 relative z-10">
                        {isCorrect ? (
                            <>
                                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                                    <i className="fa-solid fa-check text-3xl text-black"></i>
                                </div>
                                <h2 className="text-2xl font-black mb-2 uppercase italic text-primary">Data Decrypted</h2>
                                <p className="text-secondary mb-8 font-mono text-sm">Congratulations, you have successfully decrypted the data.</p>
                                
                                <div className="inline-block bg-surface px-6 py-2 rounded-full border border-divider/10 font-mono text-accent font-bold mb-8">
                                    +{currentQuiz?.xp_reward || 0} XP EARNED
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-red-400/20 border border-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                    <i className="fa-solid fa-xmark text-3xl"></i>
                                </div>
                                <h2 className="text-2xl font-black mb-2 uppercase italic text-primary">Decryption Failed</h2>
                                <p className="text-secondary mb-8 font-mono text-sm">Security protocols blocked the access token. No XP awarded.</p>
                            </>
                        )}

                        <button 
                            onClick={handleAction}
                            className="w-full py-4 bg-primary text-canvas font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg"
                        >
                            CONTINUE MISSION <i className="fa-solid fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
