"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLorem } from '../../constants/dashboard-constants';
import { POIService } from '../../services/poi';
import { ExperienceQuiz } from '../../components/experience/ExperienceQuiz';
import { QuizService, QuizResponse, AnswerResponse } from '../../services/quiz';

export default function ExperiencePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Interaction State
    const [activeTab, setActiveTab] = useState<'overview' | 'quiz'>('overview');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    
    // Quiz State
    const [currentQuiz, setCurrentQuiz] = useState<QuizResponse | null>(null);
    const [quizLoading, setQuizLoading] = useState(false);

    useEffect(() => {
        async function fetchPOI() {
            try {
                setLoading(true);
                const data = await POIService.getPoi(id);
                // Map backend POI to frontend "item" structure
                const mappedItem = {
                    ...data,
                    img: data.images?.[0]?.url || "https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?width=800",
                    type: data.tags?.[0] || 'Landmark',
                    rating: data.rating || 4.5, // Mock if missing
                    dist: data.dist || "1.2 km", // Mock if missing
                    address: data.address || "Grid Coordinates Locked"
                };
                setItem(mappedItem);
            } catch (err: any) {
                console.error("Failed to fetch experience:", err);
                setError(err.message || "Connection to grid failed.");
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchPOI();
        }
    }, [id]);

    const toggleAudio = () => {
        if ('speechSynthesis' in window && item) {
            if (isAudioPlaying) {
                window.speechSynthesis.cancel();
                setIsAudioPlaying(false);
            } else {
                const itemDesc = item.description || getLorem(item.type);
                const utterance = new SpeechSynthesisUtterance(`${item.name}. ${itemDesc}`);
                utterance.rate = 0.9;
                utterance.pitch = 0.8; // Cyber vibe
                utterance.onend = () => setIsAudioPlaying(false);
                window.speechSynthesis.speak(utterance);
                setIsAudioPlaying(true);
            }
        }
    };

    // Quiz Handlers
    const fetchNextQuiz = useCallback(async () => {
        try {
            setQuizLoading(true);
            const quiz = await QuizService.getNextQuiz(id);
            setCurrentQuiz(quiz);
        } catch (error) {
            console.error("Failed to fetch next quiz:", error);
            // Show error in UI temporarily or via simple alert for now
            alert("Failed to access node securely. Authentication required.");
        } finally {
            setQuizLoading(false);
        }
    }, [id]);

    const handleAnswerSubmission = async (answerIndex: number): Promise<AnswerResponse> => {
        if (!currentQuiz) throw new Error("No quiz active");
        return await QuizService.submitAnswer(currentQuiz.id, answerIndex);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-canvas flex items-center justify-center text-accent">
                <div className="text-center animate-pulse">
                    <i className="fa-solid fa-spinner fa-spin text-4xl mb-4"></i>
                    <p className="font-mono tracking-widest uppercase">Initializing Sector Scan...</p>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-canvas flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-grid opacity-10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]"></div>
                
                <div className="relative z-10 max-w-md w-full text-center">
                    <div className="mb-8 relative inline-block">
                        <div className="w-24 h-24 rounded-2xl bg-surface border border-white/5 flex items-center justify-center mx-auto shadow-2xl rotate-3 group">
                            <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500 animate-pulse"></i>
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 text-[10px] font-black font-mono">
                            404
                        </div>
                    </div>

                    <h2 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        Sector Offline
                    </h2>
                    
                    <p className="font-mono text-xs text-secondary mb-8 leading-relaxed uppercase tracking-widest bg-red-500/5 py-3 px-4 rounded-lg border border-red-500/10">
                        Signal lost at coordinates <span className="text-primary font-bold">{id}</span>. 
                        Target may have been de-linked or moved to a restricted grid subset.
                    </p>

                    <div className="space-y-4">
                        <Link 
                            href="/dashboard" 
                            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-black text-sm hover:bg-accent hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_25px_rgba(255,255,255,0.1)]"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                            RETURN TO GRID
                        </Link>
                        
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-3 bg-surface/50 border border-white/10 text-secondary py-4 rounded-2xl font-bold text-xs hover:text-white hover:bg-surface transition-all"
                        >
                            <i className="fa-solid fa-rotate"></i>
                            RE-SCAN SIGNAL
                        </button>
                    </div>

                    <div className="mt-12 flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                        <i className="fa-solid fa-shield-halved text-xl"></i>
                        <i className="fa-solid fa-satellite text-xl"></i>
                        <i className="fa-solid fa-user-secret text-xl"></i>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-canvas text-primary relative overflow-x-hidden">
            {/* BACKGROUND GRID */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-canvas/50 to-canvas"></div>
            </div>

            <div className="relative z-10 pb-20 md:pb-0">
                
                {/* HERO SECTION */}
                <div className="relative h-[45vh] md:h-[55vh] w-full">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/50 to-transparent"></div>
                    
                    {/* Navbar Overlay */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 max-w-5xl mx-auto w-full">
                        <button onClick={() => router.back()} className="w-12 h-12 rounded-full bg-surface/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-accent hover:text-black transition-all group">
                            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                        </button>
                        <div className="flex gap-3">
                            <button className="w-12 h-12 rounded-full bg-surface/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                <i className="fa-solid fa-globe"></i>
                            </button>
                            <button 
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={`w-12 h-12 rounded-full bg-surface/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all ${isFavorite ? 'text-red-500 bg-surface/40' : 'text-white hover:text-red-500 hover:bg-white'}`}
                            >
                                <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                            </button>
                        </div>
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-12 left-0 right-0 px-6 max-w-5xl mx-auto w-full animate-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/90 backdrop-blur text-black text-[10px] font-black font-mono rounded mb-4 uppercase tracking-widest shadow-[0_0_15px_rgba(204,255,0,0.4)]">
                            <i className="fa-solid fa-bolt"></i>
                            {item.type}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter drop-shadow-2xl text-stroke md:text-copy">
                            {item.name}
                        </h1>
                    </div>
                </div>

                {/* CONTENT CONTAINER */}
                <div className="px-6 max-w-5xl mx-auto w-full -mt-8 relative z-20">
                    
                    {/* FLOATING INFO CARD */}
                    <div className="bg-surface/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-wrap md:flex-nowrap items-center justify-between gap-6 mb-8 group hover:border-accent/30 transition-colors">
                        <div className="flex-1 text-center md:text-left border-r border-divider/10 last:border-0 pr-6">
                            <div className="text-[10px] text-secondary font-mono uppercase tracking-wider mb-1">CROWD RATING</div>
                            <div className="text-2xl font-black flex items-center justify-center md:justify-start gap-2">
                                {item.rating} 
                                <span className="flex text-xs text-yellow-500 gap-0.5">
                                    {[...Array(5)].map((_,i) => <i key={i} className={`fa-solid fa-star ${i < Math.floor(item.rating) ? '' : 'opacity-30'}`}></i>)}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 text-center border-r border-divider/10 md:border-r last:border-0 px-6">
                            <div className="text-[10px] text-secondary font-mono uppercase tracking-wider mb-1">DISTANCE</div>
                            <div className="text-2xl font-black">{item.dist}</div>
                        </div>
                        <div className="flex-1 text-center md:text-right pl-6">
                            <div className="text-[10px] text-secondary font-mono uppercase tracking-wider mb-1">ENTRY FEE</div>
                            <div className="text-2xl font-black text-accent drop-shadow-[0_0_10px_rgba(204,255,0,0.3)]">FREE</div>
                        </div>
                    </div>

                    {/* ACTION BAR */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <button className="col-span-2 bg-primary text-canvas rounded-2xl py-4 font-bold flex items-center justify-center gap-3 hover:bg-accent hover:text-black hover:scale-[1.02] transition-all shadow-xl shadow-primary/10">
                            <i className="fa-solid fa-location-arrow text-lg"></i> 
                            <span className="tracking-wide">NAVIGATE</span>
                        </button>
                        <button 
                            onClick={toggleAudio}
                            className={`col-span-1 rounded-2xl py-4 font-bold flex flex-col items-center justify-center gap-1 border border-divider/10 transition-all ${
                                isAudioPlaying ? 'bg-accent text-black animate-pulse shadow-[0_0_15px_rgba(204,255,0,0.5)]' : 'bg-surface hover:bg-surface/80 hover:-translate-y-1'
                            }`}
                        >
                            <i className={`fa-solid ${isAudioPlaying ? 'fa-stop' : 'fa-headphones'} text-xl`}></i>
                            <span className="text-[10px] font-mono uppercase">{isAudioPlaying ? 'STOP' : 'LISTEN'}</span>
                        </button>
                        <button className="col-span-1 bg-surface rounded-2xl py-4 font-bold flex flex-col items-center justify-center gap-1 border border-divider/10 hover:bg-surface/80 hover:-translate-y-1 transition-all">
                            <i className="fa-regular fa-calendar-plus text-xl"></i>
                            <span className="text-[10px] font-mono uppercase">PLAN</span>
                        </button>
                    </div>

                    {/* TABS CONTAINER */}
                    <div className="bg-surface/40 backdrop-blur-md rounded-3xl border border-divider/5 overflow-hidden min-h-[500px]">
                        {/* TABS HEADER */}
                        <div className="flex border-b border-divider/10">
                            {[
                                { id: 'overview', icon: 'fa-layer-group', label: 'OVERVIEW' },
                                { id: 'quiz', icon: 'fa-brain', label: 'QUIZ (+XP)' }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 py-4 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all relative ${
                                        activeTab === tab.id 
                                        ? 'text-primary bg-surface/80' 
                                        : 'text-secondary hover:text-primary hover:bg-white/5'
                                    }`}
                                >
                                    <i className={`fa-solid ${tab.icon}`}></i>
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent shadow-[0_-2px_10px_rgba(204,255,0,0.5)]"></div>
                                    )}
                                </button>
                            ))}
                        </div>

            {/* TAB CONTENT */}
            <div className="p-4 min-h-[300px]">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <i className="fa-solid fa-circle-info text-accent"></i> Intel
                            </h2>
                            <div className="text-sm leading-relaxed text-secondary/90">
                                {item.description && <p className="mb-4">{item.description}</p>}
                                <p>{getLorem(item.type)}</p>
                            </div>
                            <p className="text-sm leading-relaxed text-secondary/90">
                                Additional scanning required for full historical deconstruction. Local grid integrity is stable. Recommended gear: AR Visor v4.0.
                            </p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-divider/10">
                            <div className="flex items-start gap-3">
                                <i className="fa-solid fa-map-pin text-secondary mt-1"></i>
                                <div>
                                    <div className="text-xs font-bold text-primary">ADDRESS</div>
                                    <div className="text-sm text-secondary">{item.address}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <i className="fa-solid fa-clock text-secondary mt-1"></i>
                                <div>
                                    <div className="text-xs font-bold text-primary">OPEN HOURS</div>
                                    <div className="text-sm text-secondary">24/7 (Public Access)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* QUIZ TAB */}
                {activeTab === 'quiz' && (
                    <div className="animate-in fade-in duration-300">
                        <ExperienceQuiz 
                            quiz={currentQuiz}
                            loading={quizLoading}
                            onStart={fetchNextQuiz}
                            onAnswer={handleAnswerSubmission}
                            onNext={fetchNextQuiz}
                        />
                    </div>
                )}

            {/* END TAB CONTENT */}
            </div>
            {/* END TABS CONTAINER */}
            </div>
        {/* END CONTENT WRAPPER */}
        </div>
    {/* END RELATIVE WRAPPER */}
    </div>
{/* END PAGE ROOT */}
</div>
  );
}
