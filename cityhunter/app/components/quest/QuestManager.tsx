"use client";

import { useEffect, useRef } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { getItemById } from '../../constants/dashboard-constants';
import { getDistanceFromLatLonInKm } from '../../utils/geo';

const LOCATION_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};



export default function QuestManager() {
    const { questState, updateQuestState, activeWalk, excludedStopIds, monuments, events } = useDashboardContext();
    const watchId = useRef<number | null>(null);

    // Derived State: Valid Stops only
    const validStopIds = activeWalk?.stopIds.filter(id => !excludedStopIds.includes(id)) || [];

    // Helper to find match in backend data
    const getItem = (id: string | number) => {
        if (!monuments && !events) return null;
        return (monuments || []).find(m => String(m.id) === String(id)) || 
               (events || []).find(e => String(e.id) === String(id));
    };

    // 1. Watch Real Geolocation
    useEffect(() => {
        if (!questState.isActive) {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
            return;
        }

        if (!('geolocation' in navigator)) return;

        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                // If Simulation Mode is active, ignore real GPS updates
                if (questState.isSimulationMode) return;
                
                // Only update location, let the other effect handle Game Logic
                updateQuestState({ 
                    userLocation: { 
                        lat: position.coords.latitude, 
                        lng: position.coords.longitude 
                    } 
                });
            },
            (error) => console.error("Location Error:", error),
            LOCATION_OPTIONS
        );

        return () => {
            if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
        };
    }, [questState.isActive, updateQuestState, questState.isSimulationMode]);

    // 2. GAME LOGIC: Check Proximity (Runs on ANY location update: Real or Sim)
    useEffect(() => {
        if (!questState.isActive || !questState.userLocation || !activeWalk || String(questState.activeWalkId) !== String(activeWalk.id)) return;
        
        const { lat, lng } = questState.userLocation;
        
        // Use Valid Stops List
        const currentStopId = validStopIds[questState.currentStopIndex];

        // DYNAMIC CLEANUP: If the active target changes (e.g. user excluded the current stop),
        // clear any pending encounter for the old target.
        if (questState.pendingEncounterId && questState.pendingEncounterId !== currentStopId) {
            updateQuestState({ pendingEncounterId: null, showQuiz: false });
        }
        
        if (currentStopId) {
            const target = getItem(currentStopId);
        if (currentStopId) {
            const target = getItem(currentStopId);
            if (target) {
                const dist = getDistanceFromLatLonInKm(lat, lng, target.lat, target.lng);
                
                // If closer than 50m (0.05km)
                if (dist < 0.05) {
                    // Check if already completed to avoid spam
                    if (!questState.completedStopIds.includes(target.id)) {
                         // Trigger Proximity Popup (Opt-in)
                         if (questState.pendingEncounterId !== target.id) {
                             updateQuestState({ 
                                 pendingEncounterId: target.id,
                                 showQuiz: false // Do NOT open automatically
                             });
                         }
                    }
                } else {
                    // Left the area? Clear the pending prompt if it was for this target
                    if (questState.pendingEncounterId === target.id) {
                        updateQuestState({ pendingEncounterId: null });
                    }
                }
            }
        }
        }
    }, [questState.userLocation, questState.isActive, activeWalk, questState.activeWalkId, questState.currentStopIndex, updateQuestState]);

    return null; // Logic only component
}
