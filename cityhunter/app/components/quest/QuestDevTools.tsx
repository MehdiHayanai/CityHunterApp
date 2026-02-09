"use client";

import { useEffect, useState, useRef } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { getItemById } from '../../constants/dashboard-constants';

export default function QuestDevTools() {
    const { questState, updateQuestState, activeWalk, excludedStopIds, monuments, events } = useDashboardContext();
    const [isAutoWalking, setIsAutoWalking] = useState(false);
    const [stepSize, setStepSize] = useState(0.00005); // Default ~5m per tick
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const validStopIds = activeWalk?.stopIds.filter(id => !excludedStopIds.includes(id)) || [];

    // Helper to find item in dynamic data
    const getItem = (id: string | number) => {
        if (!monuments && !events) return null;
        return (monuments || []).find(m => String(m.id) === String(id)) || 
               (events || []).find(e => String(e.id) === String(id));
    };

    // Loose comparison for IDs to handle string/number mismatch
    const shouldRender = questState.isActive && activeWalk && String(questState.activeWalkId) === String(activeWalk.id);
    const currentTargetId = validStopIds[questState.currentStopIndex];
    const target = currentTargetId ? getItem(currentTargetId) : null;
    
    // Debug logging
    useEffect(() => {
        if (shouldRender) {
             console.log("[QuestDevTools] Active", { 
                 isSim: questState.isSimulationMode, 
                 isAuto: isAutoWalking, 
                 loc: questState.userLocation,
                 target: target?.name
             });
        } else if (questState.isSimulationMode) {
             console.log("[QuestDevTools] Inactive but Sim Mode True (will auto-disable)");
        }
    }, [shouldRender, questState.isSimulationMode, isAutoWalking, questState.userLocation, target]);

    // Auto-enable sim mode when using tools
    const enableSimMode = () => {
        if (!questState.isSimulationMode) {
            updateQuestState({ isSimulationMode: true });
        }
    };

    // Auto-disable sim mode when tools become inactive
    useEffect(() => {
        if (!shouldRender && questState.isSimulationMode) {
             updateQuestState({ isSimulationMode: false });
        }
    }, [shouldRender, questState.isSimulationMode, updateQuestState]);

    useEffect(() => {
        if (!shouldRender || !isAutoWalking || !target || !questState.userLocation) return;

        const timer = setTimeout(() => {
            const { lat, lng } = questState.userLocation!;
            const dLat = target.lat - lat;
            const dLng = target.lng - lng;
            
            // Use dynamic step size
            const dist = Math.sqrt(dLat*dLat + dLng*dLng);
            
            if (dist < stepSize) {
                // Arrived
                updateQuestState({ userLocation: { lat: target.lat, lng: target.lng } });
                setIsAutoWalking(false);
            } else {
                const ratio = stepSize / dist;
                updateQuestState({ 
                    userLocation: { 
                        lat: lat + dLat * ratio, 
                        lng: lng + dLng * ratio 
                    } 
                });
            }
        }, 500); 

        return () => clearTimeout(timer);
    }, [isAutoWalking, questState.userLocation, target, updateQuestState, shouldRender, stepSize]);

    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    // Auto-clear status message
    useEffect(() => {
        if (statusMsg) {
            const timer = setTimeout(() => setStatusMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [statusMsg]);

    const handleTeleport = () => {
        if (target) {
            enableSimMode();
            updateQuestState({ userLocation: { lat: target.lat - 0.0002, lng: target.lng - 0.0002 } });
            setStatusMsg("TELEPORTED NEAR TARGET");
        }
    };

    if (!shouldRender) {
        return null;
    }

    return (
        <div className="fixed bottom-24 right-4 z-50 bg-black/80 border border-green-500/50 p-4 rounded-lg backdrop-blur text-green-400 font-mono text-xs w-64 shadow-2xl">
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold flex items-center gap-2">
                    <i className="fa-solid fa-terminal"></i> DEV_SIM
                </span>
                <div className="flex items-center gap-2">
                     <label className="text-[9px] flex items-center gap-1 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={questState.isSimulationMode} 
                            onChange={(e) => updateQuestState({ isSimulationMode: e.target.checked })}
                            className="accent-green-500"
                        />
                        GPS_OVR
                    </label>
                    <span className={`w-2 h-2 rounded-full ${isAutoWalking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                </div>
            </div>
            
            {statusMsg && (
                <div className="mb-2 p-1 bg-green-500/20 text-green-300 text-[10px] text-center rounded animate-in fade-in slide-in-from-top-1">
                    {statusMsg}
                </div>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <button 
                         onClick={handleTeleport}
                         className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded hover:bg-green-500/20"
                    >
                        TELEPORT NEAR
                    </button>
                    <button 
                         onClick={() => {
                             if (!isAutoWalking) enableSimMode();
                             setIsAutoWalking(!isAutoWalking);
                             setStatusMsg(isAutoWalking ? "WALK STOPPED" : "AUTO-WALK STARTED");
                         }}
                         className={`px-2 py-1 border rounded ${isAutoWalking ? 'bg-green-500 text-black border-green-500' : 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'}`}
                    >
                        {isAutoWalking ? 'STOP WALK' : 'AUTO WALK'}
                    </button>
                    <button 
                         onClick={() => {
                             if (activeWalk && questState.currentStopIndex < validStopIds.length - 1) {
                                 enableSimMode();
                                 updateQuestState({ currentStopIndex: questState.currentStopIndex + 1 });
                                 setStatusMsg("SKIPPED TO NEXT STOP");
                             } else {
                                 setStatusMsg("LAST STOP REACHED");
                             }
                         }}
                         className="col-span-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded hover:bg-yellow-500/20"
                    >
                        FORCE SKIP STOP
                    </button>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] opacity-70">
                        <span>SPEED</span>
                        <span>{(stepSize * 100000).toFixed(1)}x</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.00001" 
                        max="0.001" 
                        step="0.00001" 
                        value={stepSize}
                        onChange={(e) => setStepSize(parseFloat(e.target.value))}
                        className="w-full h-1 bg-green-500/30 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                     <button 
                         onClick={() => {
                             if (!target || !questState.userLocation) return;
                             const { lat, lng } = questState.userLocation;
                             const dLat = target.lat - lat;
                             const dLng = target.lng - lng;
                             const dist = Math.sqrt(dLat*dLat + dLng*dLng); 
                             
                             if (dist < 0.0005) { // Approx 50m
                                 updateQuestState({ 
                                     pendingEncounterId: target.id,
                                     showQuiz: true // DIRECT OPEN
                                 });
                                 setStatusMsg("OPENING QUIZ...");
                             } else {
                                 setStatusMsg(`TOO FAR (${(dist * 100000).toFixed(0)}m > 50m)`);
                             }
                         }}
                         className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded hover:bg-blue-500/20 text-[10px]"
                    >
                        VALIDATE & OPEN
                    </button>
                    <button 
                         onClick={() => {
                             if (target) {
                                  enableSimMode();
                                  updateQuestState({ 
                                     pendingEncounterId: target.id,
                                     showQuiz: true
                                 });
                                 setStatusMsg("FORCED ARRIVAL");
                             }
                         }}
                         className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded hover:bg-yellow-500/20 text-[10px]"
                    >
                        FORCE ARRIVAL
                    </button>
                </div>

                <div className="border-t border-green-500/30 pt-2 text-[10px] opacity-70">
                   LOC: {questState.userLocation?.lat.toFixed(5)}, {questState.userLocation?.lng.toFixed(5)} <br/>
                   TARGET: {target?.name.substring(0, 15)}... <br/>
                   DIST: {target && questState.userLocation 
                        ? (Math.sqrt(Math.pow(target.lat - questState.userLocation.lat, 2) + Math.pow(target.lng - questState.userLocation.lng, 2)) * 100000).toFixed(0) + 'm' 
                        : '--'}
                </div>
            </div>
        </div>
    );
}
