"use client";

import { useEffect } from 'react';
import { useDashboardContext } from '../context/DashboardContext';

export default function LocationInitializer() {
    const { updateQuestState, questState } = useDashboardContext();

    useEffect(() => {
        if (!('geolocation' in navigator)) return;

        // Check if we should prompt
        const lastPrompt = localStorage.getItem('cityhunter_location_prompt');
        const now = Date.now();
        
        // Prompt if never prompted or every 24 hours if denied (just to be sure, or follow user's "Always" request)
        // If the browser already has "Always Allow", this just triggers the success callback.
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("[LOCATION] Initial position acquired:", position.coords);
                updateQuestState({
                    userLocation: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                });
                localStorage.setItem('cityhunter_location_prompt', now.toString());
            },
            (error) => {
                console.warn("[LOCATION] Initial position failed:", error.message);
                // We don't set a fallback here, the Chat and Map will handle it via mapCenter
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );

    }, [updateQuestState]);

    return null;
}
