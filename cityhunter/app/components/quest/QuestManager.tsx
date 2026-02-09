"use client";

import { useEffect, useRef } from 'react';
import { useDashboardContext } from '../../context/DashboardContext';
import { getItemById } from '../../constants/dashboard-constants';

const LOCATION_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

const PROXIMITY_THRESHOLD = 0.05; // ~50 meters (in degrees roughly, need proper calc) 
// Actually, let's use a proper Haversine or simple distance function in meters.

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

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
