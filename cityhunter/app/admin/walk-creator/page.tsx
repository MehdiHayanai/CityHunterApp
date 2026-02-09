'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import WalkEditorLayout from './components/WalkEditorLayout';
import { POI, POIService, POIBase } from '@/app/services/poi';
import ItineraryCanvas from './components/ItineraryCanvas';
import PoiSidebar from './components/PoiSidebar';
import { WalkService } from '@/app/services/walk';
import { useDashboardContext } from '@/app/context/DashboardContext';

// DND Kit
import { 
  DndContext, 
  DragOverlay, 
  DragStartEvent, 
  DragEndEvent, 
  useSensor, 
  useSensors, 
  PointerSensor,
  closestCorners 
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import WalkMapWrapper from './components/WalkMapWrapper';

export default function WalkCreatorPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { retryLoading } = useDashboardContext();
    const editId = searchParams.get('id');
    
    // Wizard State
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [isMapHidden, setIsMapHidden] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Logic State
    const [availablePois, setAvailablePois] = useState<POIBase[]>([]);
    const [selectionPool, setSelectionPool] = useState<{ id: string; poi: POIBase }[]>([]); // Step 1 chosen pool
    const [itinerary, setItinerary] = useState<{ id: string; poi: POIBase }[]>([]); // Step 2 ordered stops
    
    // DND State
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activePoi, setActivePoi] = useState<POIBase | null>(null);

    // Load Data
    useEffect(() => {
        // Load POIs for the sidebar
        POIService.getPois().then(data => {
            const mapped = data.map(POIService.transformToFrontendPOI);
            setAvailablePois(mapped);
        }).catch(console.error);

        // If in edit mode, load the existing walk
        if (editId) {
            WalkService.getWalk(editId).then(walk => {
                console.log('[WalkCreator] Loaded walk for editing:', walk);
                
                setTitle(walk.title || walk.name || '');
                setDescription(walk.description || walk.desc || '');
                
                // Transform stops to proper POI format
                // Create SEPARATE instances for pool and itinerary to avoid duplicate keys
                const transformedStops = (walk.stops || []).map((stop: any, index: number) => {
                    const transformedPoi = POIService.transformToFrontendPOI(stop);
                    
                    console.log('[WalkCreator] Transformed stop:', {
                        original: stop,
                        transformed: transformedPoi
                    });
                    
                    return {
                        transformedPoi,
                        index
                    };
                });
                
                // Create unique instances for selection pool
                const poolStops = transformedStops.map(({ transformedPoi, index }: { transformedPoi: any, index: number }) => ({
                    id: `pool-${transformedPoi.id}-${index}-${Date.now()}`,
                    poi: transformedPoi
                }));
                
                // Create unique instances for itinerary
                const itineraryStops = transformedStops.map(({ transformedPoi, index }: { transformedPoi: any, index: number }) => ({
                    id: `itinerary-${transformedPoi.id}-${index}-${Date.now()}`,
                    poi: transformedPoi
                }));
                
                console.log('[WalkCreator] Loaded stops:', {
                    pool: poolStops,
                    itinerary: itineraryStops
                });
                
                // In edit mode, both pool and itinerary start with existing stops
                setSelectionPool(poolStops);
                setItinerary(itineraryStops);
            }).catch(err => {
                console.error("Failed to load walk for editing:", err);
                setError("Failed to initialize mission data.");
            });
        }
    }, [editId]);

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    // Handlers
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        if (active.data.current?.type === 'POI') {
            setActivePoi(active.data.current.poi);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        // Reordering within Canvas (Step 2)
        if (active.id !== over?.id && over && currentStep === 2) {
            const oldIndex = itinerary.findIndex(i => i.id === active.id);
            const newIndex = itinerary.findIndex(i => i.id === over.id);
            
            if (oldIndex !== -1 && newIndex !== -1) {
                setItinerary((items) => arrayMove(items, oldIndex, newIndex));
            }
        }
    
        setActiveId(null);
        setActivePoi(null);
    };

    const handleRemoveFromPool = (instanceId: string) => {
        setSelectionPool(prev => prev.filter(i => i.id !== instanceId));
    };

    const handleRemoveFromItinerary = (instanceId: string) => {
        setItinerary(prev => prev.filter(i => i.id !== instanceId));
    };

    const handleSave = async () => {
        if (!title || itinerary.length === 0) {
            setError("Mission requires a name and at least one stop.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            
            const stopIds = itinerary.map(i => i.poi.id || (i.poi as any)._id);
            const walkData = {
                title,
                description,
                stops: stopIds
            };

            if (editId) {
                await POIService.updateWalk(editId, walkData);
            } else {
                await POIService.createWalk(walkData);
            }

            // Success Transition
            setIsSaving(false);
            setShowSuccess(true);
            
            // Refetch walks in context before redirecting
            retryLoading();
            
            // Redirect after brief "Success" UX
            setTimeout(() => {
                router.push('/dashboard');
            }, 2500);

        } catch (err: any) {
            console.error("Failed to save mission:", err);
            setError(err.message || "Uplink failed. Transmission interrupted.");
            setIsSaving(false);
        }
    };

    // Step Logic
    const nextStep = () => {
        if (selectionPool.length === 0) {
            setError("Intelligence report incomplete. Select at least one asset.");
            return;
        }
        setError(null);

        // SMART SYNC: Preserve existing order in itinerary
        setItinerary(prevItinerary => {
            const currentIds = new Set(prevItinerary.map(i => i.id));
            const poolIds = new Set(selectionPool.map(i => i.id));

            // 1. Keep existing items that are still in the pool (preserves order)
            const kept = prevItinerary.filter(i => poolIds.has(i.id));

            // 2. Add new items from pool that aren't in itinerary yet (append to end)
            const added = selectionPool.filter(i => !currentIds.has(i.id));

            return [...kept, ...added];
        });

        setCurrentStep(2);
    };

    const prevStep = () => {
        // Sync pool with current itinerary state so Phase 1 basket matches Phase 2 order/removals
        setSelectionPool([...itinerary]);
        setCurrentStep(1);
    };

    // Selection logic (Allow duplicates)
    const addToPool = (poi: POIBase) => {
        const instanceId = `${poi.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        setSelectionPool(prev => [...prev, { id: instanceId, poi }]);
    };

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="min-h-screen bg-canvas p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>

                 <WalkEditorLayout 
                    isMapHidden={isMapHidden}
                    map={
                        <WalkMapWrapper 
                            selectedStops={currentStep === 1 ? selectionPool.map(i => i.poi) : itinerary.map(i => i.poi)} 
                            availablePois={availablePois} 
                            onPoisFetched={setAvailablePois} 
                            onSelect={addToPool}
                        />
                    }
                    headerTools={
                        <button 
                            onClick={() => setIsMapHidden(!isMapHidden)}
                            className={`btn-glass btn-xs px-5 py-2.5 rounded-full flex items-center gap-2 shadow-2xl border transition-all duration-300 group ${isMapHidden ? 'bg-accent/10 border-accent/40 text-accent' : 'bg-surface/80 border-white/20'}`}
                        >
                            <i className={`fa-solid ${isMapHidden ? 'fa-map' : 'fa-maximize'} text-[10px] group-hover:scale-110 transition-transform`}></i>
                            <span className="font-black tracking-widest text-[9px] uppercase">
                                {isMapHidden ? 'Show Tactical Map' : 'Expand Architect'}
                            </span>
                        </button>
                    }
                >
                    <div className="flex-1 p-6 md:p-10 flex flex-col h-full overflow-hidden relative">
                         {/* Header: Mission Status */}
                         <div className="mb-10 flex items-center justify-between pb-6 border-b border-divider/10 border-dashed flex-shrink-0">
                            <div>
                                <span className="text-[10px] font-bold text-accent tracking-[0.4em] uppercase mb-1.5 block">
                                    {currentStep === 1 ? 'Phase 01: Intelligence' : 'Phase 02: Architect'}
                                </span>
                                <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
                                    {currentStep === 1 ? 'Asset Selection' : 'Route Sequencing'}
                                </h1>
                            </div>
                                <div className="flex items-center gap-4">
                                    {currentStep === 2 && (
                                        <button 
                                            onClick={prevStep}
                                            className="btn-glass btn-xs px-4"
                                            title="Back to Intelligence"
                                        >
                                            <i className="fa-solid fa-arrow-left"></i>
                                        </button>
                                    )}
                                    {currentStep === 1 ? (
                                        <button 
                                            onClick={nextStep}
                                            disabled={selectionPool.length === 0}
                                            className={`btn-accent btn-xs px-6 py-2.5 ${selectionPool.length === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'} animate-in fade-in slide-in-from-right-4 font-black tracking-widest uppercase`}
                                        >
                                            NEXT PHASE <i className="fa-solid fa-arrow-right ml-2 text-[10px]"></i>
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className={`py-3 px-8 bg-accent text-black hover:opacity-90 rounded-xl font-bold text-[10px] tracking-[0.3em] uppercase transition-all shadow-lg hover:shadow-accent/40 flex items-center justify-center gap-3 ${isSaving ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                            >
                                                {isSaving ? (
                                                    <i className="fa-solid fa-satellite fa-spin"></i>
                                                ) : (
                                                    <>
                                                        SUBMIT WALK
                                                        <i className="fa-solid fa-rocket text-[12px]"></i>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="mb-8 p-5 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-500 text-[11px] font-mono animate-in fade-in slide-in-from-top-4 flex items-center gap-3 uppercase tracking-widest">
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    {error}
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-16 pb-16">
                                
                                {/* PHASE 1: SELECTION */}
                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-12 duration-500">
                                        {/* Mission Title Card */}
                                        <div className="group mt-4 bg-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
                                            <div className="p-5 border-b border-white/5 bg-black/20 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-bold text-[10px] text-white flex items-center gap-2 uppercase tracking-[0.2em]">
                                                        <i className="fa-solid fa-id-card text-accent"></i> Mission Operational Title
                                                    </h3>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                                                </div>
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        className="input w-full bg-black/40 border-white/10 text-white focus:border-accent px-6 h-12 rounded-xl text-xs font-mono placeholder:text-white/10" 
                                                        placeholder="Define Operational Codename..."
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Assets Finder */}
                                        <div className="pt-4">
                                            <PoiSidebar 
                                                pois={availablePois} 
                                                onSelect={addToPool}
                                                selectedIds={[]} // Don't gray out, allow duplicates
                                                className="max-h-[420px] shadow-2xl"
                                                title="Available Operational Assets"
                                            />
                                        </div>

                                        {/* Selection Pool (Basket) */}
                                        <div className="pt-6">
                                            <label className="label-tech mb-4 text-white/40 border-l-2 border-accent pl-3"> Selection Basket ({selectionPool.length})</label>
                                            {selectionPool.length === 0 ? (
                                                <div className="p-16 border-2 border-dashed border-white/5 bg-white/[0.02] rounded-3xl text-center flex flex-col items-center gap-4 transition-all hover:bg-white/[0.04]">
                                                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/20 shadow-inner">
                                                        <i className="fa-solid fa-plus text-xl"></i>
                                                    </div>
                                                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black italic">Awaiting asset authorization</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {selectionPool.map((item, idx) => (
                                                        <div key={item.id} className="bg-surface/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-accent/30 transition-all animate-in zoom-in-95 backdrop-blur-sm">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-[10px] font-black flex items-center justify-center shrink-0">
                                                                    {String(idx + 1).padStart(2, '0')}
                                                                </span>
                                                                <span className="text-xs font-bold text-white truncate">{item.poi.name}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleRemoveFromPool(item.id)} 
                                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                            >
                                                                <i className="fa-solid fa-trash-can text-xs"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* PHASE 2: ARCHITECT */}
                                {currentStep === 2 && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                        {/* Mission Brief */}
                                        <div>
                                            <label className="label-tech mb-3"> <i className="fa-solid fa-pen-nib text-accent"></i> Mission Briefing</label>
                                            <textarea 
                                                className="textarea bg-black/30 border-white/5 text-white placeholder-white/20 focus:border-accent focus:bg-black/50 w-full h-32 p-5 text-sm leading-relaxed rounded-2xl backdrop-blur-md shadow-inner transition-all resize-none"
                                                placeholder="Document the purpose of this operation..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            ></textarea>
                                        </div>

                                        {/* Sequence Planning */}
                                        <div className="pt-4">
                                            <label className="label-tech mb-5"> <i className="fa-solid fa-route text-accent"></i> Sequence Sequencing</label>
                                            <ItineraryCanvas 
                                                items={itinerary} 
                                                onRemove={handleRemoveFromItinerary} 
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Operational Footer */}
                        <div className="p-6 border-t border-divider/10 bg-black/20 flex justify-between items-center bg-surface/90 backdrop-blur-xl shrink-0 z-20">
                            {currentStep === 1 ? (
                                <>
                                    <div className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em] italic">
                                        Awaiting Intelligence Confirmation...
                                    </div>
                                    <button 
                                        onClick={nextStep}
                                        disabled={selectionPool.length === 0}
                                        className={`btn-accent px-8 ${selectionPool.length === 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                    >
                                        ARCHITECT MISSION <i className="fa-solid fa-chevron-right ml-2 text-[10px]"></i>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={prevStep}
                                        className="btn-glass group px-6"
                                    >
                                        <i className="fa-solid fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i> PHASE 01
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={`py-4 px-12 bg-accent text-black hover:opacity-90 rounded-2xl font-black text-xs tracking-[0.3em] uppercase transition-all shadow-xl hover:shadow-accent/40 flex items-center justify-center gap-3 ${isSaving ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                    >
                                        {isSaving ? (
                                            <><i className="fa-solid fa-satellite fa-spin mr-2"></i> TRANSMITTING...</>
                                        ) : (
                                            <>
                                                {editId ? 'UPDATE WALK' : 'SUBMIT WALK'}
                                                <i className="fa-solid fa-rocket text-[14px]"></i>
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>

                    </WalkEditorLayout>

                    {/* Operation Overlay (Loading/Success) */}
                    {(isSaving || showSuccess) && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-3xl bg-black/80 animate-in fade-in duration-500">
                            <div className="max-w-md w-full p-12 text-center space-y-8">
                                {isSaving ? (
                                    <>
                                        <div className="relative inline-block">
                                            <div className="w-24 h-24 rounded-full border-4 border-accent/20 border-t-accent animate-spin shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)]"></div>
                                            <i className="fa-solid fa-satellite text-4xl text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></i>
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Transmitting Intelligence</h2>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-accent animate-[loading_2s_ease-in-out_infinite]"></div>
                                                </div>
                                                <p className="text-[10px] text-white/40 font-mono tracking-[0.2em] uppercase mt-2">Uplinking to Tactical Grid...</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-8">
                                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                                    <p className="text-[8px] text-white/30 uppercase mb-1">Packet Size</p>
                                                    <p className="font-mono text-white text-xs">{(title.length + itinerary.length * 128).toLocaleString()} bytes</p>
                                                </div>
                                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                                    <p className="text-[8px] text-white/30 uppercase mb-1">Signal Strength</p>
                                                    <p className="font-mono text-accent text-xs">98.4%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="animate-in zoom-in-95 duration-700">
                                        <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(var(--accent-rgb),0.4)] mb-8">
                                            <i className="fa-solid fa-check text-4xl text-black"></i>
                                        </div>
                                        <div className="space-y-3">
                                            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Mission Authorized</h2>
                                            <p className="text-accent text-[10px] font-mono tracking-[0.4em] uppercase">Codename: {title}</p>
                                            <div className="mt-8 pt-6 border-t border-white/10">
                                                <p className="text-white/40 text-[10px] uppercase leading-relaxed font-bold">
                                                    The intelligence has been synchronized. <br/> Redirecting to operational command...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Global Indicator Overlay */}
                    <DragOverlay>
                        {activeId && activePoi ? (
                            <div className="spotlight-card bg-surface/95 border-2 border-accent text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 w-80 rounded-2xl rotate-2 cursor-grabbing backdrop-blur-2xl pointer-events-none ring-4 ring-accent/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/5 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                        {activePoi.images?.[0] && (
                                            <img 
                                                src={typeof activePoi.images[0] === 'string' ? activePoi.images[0] : (activePoi.images[0] as any).url} 
                                                className="w-full h-full object-cover scale-110"
                                                alt={activePoi.name}
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-accent text-[8px] font-black uppercase tracking-[0.3em] mb-1">Repositioning...</p>
                                        <h4 className="font-black text-sm truncate uppercase tracking-tighter">{activePoi.name}</h4>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </div>
            </DndContext>
        );
}
