"use client";

import React, { useState, useEffect } from 'react';
import { QuizResponse, AnswerResponse } from '../../services/quiz';
import { useAuthStore } from '@/store/useAuthStore';

interface ExperienceQuizProps {
    quiz: QuizResponse | null;
    loading: boolean; // Fetching quiz loading
    onStart: () => void;
    onAnswer: (answerIndex: number) => Promise<AnswerResponse>;
    onNext: () => void;
    isCloseEnough: boolean;
}

export const ExperienceQuiz = ({ quiz, loading, onStart, onAnswer, onNext, isCloseEnough }: ExperienceQuizProps) => {
    const [step, setStep] = useState(0); // 0 = start, 1 = question, 2 = result
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<AnswerResponse | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [hasAttempted, setHasAttempted] = useState(false);
    const refreshUser = useAuthStore(state => state.refreshUser);

    // State management for quiz flow
    useEffect(() => {
        if (quiz) {
            setStep(1); // Move to question view
            setResult(null); // Clear previous result
            setSelectedAnswer(null);
            setIsConfirmed(false);
        }
    }, [quiz]);

    const handleOption = (idx: number) => {
        if (isConfirmed || submitting) return;
        setSelectedAnswer(idx);
    };

    const handleConfirm = async () => {
        if (selectedAnswer === null || submitting || isConfirmed || !isCloseEnough) return;
        
        setSubmitting(true);
        try {
            const res = await onAnswer(selectedAnswer);
            setResult(res);
            setIsConfirmed(true);
            if (res.success) {
                refreshUser();
            }
            setStep(2); // Move to result view
        } catch (e) {
            console.error("Failed to submit answer", e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = () => {
        // Reset local state before parent fetches next
        setSelectedAnswer(null);
        setIsConfirmed(false);
        setResult(null);
        onNext();
    };

    // START SCREEN
    if (step === 0) {
        return (
            <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
                {!isCloseEnough ? (
                    <>
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse opacity-10"></div>
                            <div className="absolute inset-0 flex items-center justify-center bg-surface border-2 border-red-500/30 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                                <i className="fa-solid fa-location-dot text-4xl text-red-500/50"></i>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black mb-2 tracking-tight uppercase italic text-red-500/80">SECTOR LOCKED</h3>
                        <p className="text-secondary mb-8 max-w-xs mx-auto leading-relaxed text-xs font-mono uppercase tracking-widest">
                            Neural link unstable. You must be within <span className="text-primary font-bold">100m</span> of the coordinate set to initiate decryption.
                        </p>
                        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-4 max-w-xs mx-auto flex items-center gap-3">
                            <i className="fa-solid fa-triangle-exclamation text-red-500/50"></i>
                            <span className="text-[10px] text-red-500/60 font-mono text-left tracking-tighter">PROXIMITY AUTHENTICATION REQUIRED</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="relative w-24 h-24 mx-auto mb-6 group cursor-pointer" onClick={() => { setHasAttempted(true); onStart(); }}>
                            <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-20"></div>
                            <div className="absolute inset-2 bg-accent/20 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 flex items-center justify-center bg-surface border-2 border-accent rounded-full shadow-[0_0_30px_rgba(204,255,0,0.3)] transition-transform group-hover:scale-110">
                                {loading ? (
                                    <i className="fa-solid fa-spinner fa-spin text-4xl text-accent"></i>
                                ) : (
                                    <i className="fa-solid fa-brain text-4xl text-accent"></i>
                                )}
                            </div>
                        </div>
                        <h3 className="text-2xl font-black mb-2 tracking-tight">SYSTEM ACCESS</h3>
                        <p className="text-secondary mb-8 max-w-xs mx-auto leading-relaxed">
                            Test your knowledge to decrypt the node.
                        </p>
                    </>
                )}
                
                <button 
                    onClick={() => { setHasAttempted(true); onStart(); }}
                    disabled={loading || !isCloseEnough}
                    className="bg-primary text-canvas font-bold py-4 px-8 rounded-2xl hover:bg-accent hover:text-black hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-sm"
                >
                    {loading ? "CONNECTING..." : !isCloseEnough ? "SIGNAL BLOCKED" : "INITIATE SCAN"}
                </button>
            </div>
        );
    }
    
    // NO MORE QUIZZES / EMPTY STATE (Handled if quiz is null after loading)
    if (!quiz && !loading && step !== 0 && hasAttempted) {
         return (
            <div className="text-center py-12 animate-in fade-in zoom-in duration-700">
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-accent rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative w-full h-full bg-surface/50 rounded-full flex items-center justify-center border-2 border-accent/30 shadow-[0_0_50px_rgba(204,255,0,0.2)] overflow-hidden">
                        <i className="fa-solid fa-trophy text-5xl text-accent drop-shadow-[0_0_15px_rgba(204,255,0,0.6)]"></i>
                    </div>
                </div>

                <h2 className="text-3xl font-black mb-3 uppercase italic tracking-tighter text-primary">
                    ALL SECRETS UNLOCKED
                </h2>
                
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-8 max-w-sm mx-auto">
                    <p className="text-accent font-mono text-xs font-bold leading-relaxed uppercase tracking-widest">
                        Protocol Complete: You have extracted all available intel from this sector. Your mastery is at 100%.
                    </p>
                </div>
                
                <button 
                    onClick={() => setStep(0)}
                    className="group flex items-center gap-2 mx-auto text-sm font-bold text-secondary hover:text-accent tracking-widest uppercase transition-all"
                >
                    <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                    Return to Overview
                </button>
            </div>
         );
    }

    // QUESTIONS
    if (step === 1 && quiz) {
        return (
            <div className="max-w-md mx-auto py-4 animate-in slide-in-from-right duration-300" key={quiz.id}>
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-mono font-bold text-secondary uppercase tracking-widest">DIFFICULTY: {quiz.difficulty}</span>
                    <span className="px-2 py-1 bg-accent/10 text-accent text-[10px] font-mono font-bold rounded border border-accent/20">
                        +{quiz.xp_reward} XP
                    </span>
                </div>
                
                <h3 className="text-xl font-bold mb-8 leading-tight">{quiz.question}</h3>
                
                {!isCloseEnough && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4">
                        <i className="fa-solid fa-location-dot text-red-500"></i>
                        <p className="text-[10px] font-mono text-red-400 uppercase leading-tight font-bold">
                            Signal degrading. Return to within <span className="text-white">100m</span> to maintain decryption link.
                        </p>
                    </div>
                )}
                
                <div className="space-y-3">
                    {quiz.options.map((ans, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleOption(idx)}
                            disabled={submitting || !isCloseEnough}
                            className={`w-full text-left p-5 rounded-2xl border transition-all font-medium group relative overflow-hidden ${
                                selectedAnswer === idx 
                                    ? 'border-accent bg-accent/5 text-primary' 
                                    : 'border-divider/10 bg-surface/40 text-secondary hover:text-primary hover:border-white/20'
                            } ${!isCloseEnough ? 'opacity-50 grayscale' : ''}`}
                        >
                            <span className="relative z-10 flex justify-between items-center">
                                {ans}
                                {selectedAnswer === idx && (
                                    <i className={`fa-solid ${submitting ? 'fa-spinner fa-spin' : 'fa-circle-dot'} text-accent`}></i>
                                )}
                            </span>
                        </button>
                    ))}
                </div>

                <button 
                    onClick={handleConfirm}
                    disabled={selectedAnswer === null || submitting || !isCloseEnough}
                    className="w-full mt-8 py-4 bg-accent text-black font-black rounded-2xl hover:bg-white transition-all shadow-xl shadow-accent/20 disabled:opacity-50 disabled:grayscale uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"
                >
                    {!isCloseEnough ? (
                        <><i className="fa-solid fa-lock mr-2"></i> LINK SEVERED</>
                    ) : submitting ? (
                        <><i className="fa-solid fa-satellite-dish fa-spin"></i> TRANSMITTING...</>
                    ) : (
                        <>CONFIRM SELECTION <i className="fa-solid fa-bolt"></i></>
                    )}
                </button>
            </div>
        );
    }

    // RESULT
    if (step === 2 && result) {
         return (
            <div className="text-center py-12 animate-in zoom-in duration-300">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)] ${result.success ? 'bg-accent shadow-[0_0_40px_rgba(204,255,0,0.5)]' : 'bg-red-500/20 border-2 border-red-500 text-red-500'}`}>
                    <i className={`fa-solid ${result.success ? 'fa-check' : 'fa-xmark'} text-4xl ${result.success ? 'text-black' : ''}`}></i>
                </div>
                
                <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">{result.success ? 'Data Decrypted' : 'Decryption Failed'}</h2>
                <p className="text-secondary mb-8 font-mono text-sm uppercase tracking-wider">
                    {result.success 
                        ? `Integrity Verified. Access Granted.` 
                        : `Incorrect Sequence. The correct answer was: ${quiz?.options[result.correct_answer]}`
                    }
                </p>
                
                {result.success && (
                    <div className="inline-block bg-accent/10 px-8 py-3 rounded-full border border-accent/20 font-mono text-accent font-bold text-lg mb-8 animate-pulse">
                        + {result.xp_earned} XP EARNED
                    </div>
                )}
                
                <button 
                    onClick={handleNext}
                    disabled={loading}
                    className="w-full max-w-xs mx-auto bg-primary text-canvas font-bold py-4 px-8 rounded-2xl hover:bg-accent hover:text-black hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                    {loading ? (
                         <><i className="fa-solid fa-spinner fa-spin"></i> SCANNING...</>
                    ) : (
                         <>{result.success ? 'NEXT NODE' : 'RETRY PROTOCOL'} <i className="fa-solid fa-arrow-right"></i></>
                    )}
                </button>
            </div>
        );
    }

    // Fallback
    return null; 
};
