"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Walk, DashboardItem } from '../interfaces/dashboard';
import { WALKS, MONUMENTS, EVENTS } from '../constants/dashboard-constants';
import { QuestState, INITIAL_QUEST_STATE } from '../interfaces/quest';
import { QuestPersistence } from '../utils/quest-persistence';
import { useAuthStore } from '../../store/useAuthStore';

interface DashboardContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeCategories: string[];
  setActiveCategories: (cats: string[] | ((prev: string[]) => string[])) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedMonumentId: number | string | null;
  setSelectedMonumentId: (id: number | string | null) => void;
  
  // Walk State
  activeWalk: Walk | null;
  setActiveWalk: (walk: Walk | null) => void;
  excludedStopIds: (number | string)[];
  setExcludedStopIds: (ids: (number | string)[] | ((prev: (number | string)[]) => (number | string)[])) => void;
  walkStopsOrder: (number | string)[];
  setWalkStopsOrder: (ids: (number | string)[] | ((prev: (number | string)[]) => (number | string)[])) => void;
  expandedStopId: number | string | null;
  setExpandedStopId: (id: number | string | null) => void;

  // Walk Creation State
  walks: Walk[];
  addWalk: (walk: Walk) => void;
  isCreatingWalk: boolean;
  setIsCreatingWalk: (isCreating: boolean) => void;
  newWalkStops: (number | string)[];
  setNewWalkStops: (stops: (number | string)[] | ((prev: (number | string)[]) => (number | string)[])) => void;

  // UI State
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileView: 'list' | 'map';
  setMobileView: (view: 'list' | 'map') => void;

  // Quest State
  questState: QuestState;
  updateQuestState: (updates: Partial<QuestState>) => void;

  // Map State
  mapCenter: { lat: number; lng: number } | null;
  setMapCenter: (center: { lat: number; lng: number } | null) => void;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;

  // Data
  monuments: any[]; // Using any to avoid circle deps with DashboardItem if it causes issues, but ideally DashboardItem
  events: any[]; 
  isLoading: boolean;
  hasError: boolean;
  retryLoading: () => void;
  fetchPoisForLocation: (lat: number, lng: number, radius?: number) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // Get authentication state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authIsLoading = useAuthStore((state) => state.isLoading);

  // Main Tab State
  const [activeTab, setActiveTab] = useState('Monument');
  const [activeCategories, setActiveCategories] = useState(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonumentId, setSelectedMonumentId] = useState<number | string | null>(null);

  // Walk State
  // Walk State
  const [walks, setWalks] = useState<Walk[]>([]);
  const [activeWalk, setActiveWalk] = useState<Walk | null>(null);
  const [excludedStopIds, setExcludedStopIds] = useState<(number | string)[]>([]);
  const [walkStopsOrder, setWalkStopsOrder] = useState<(number | string)[]>([]);
  const [expandedStopId, setExpandedStopId] = useState<number | string | null>(null);
  
  // Walk Creation State
  const [isCreatingWalk, setIsCreatingWalk] = useState(false);
  const [newWalkStops, setNewWalkStops] = useState<(number | string)[]>([]);

  const addWalk = (walk: Walk) => {
      setWalks(prev => [...prev, walk]);
  };

  // UI State
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  // Quest State
  const [questState, setQuestState] = useState<QuestState>(INITIAL_QUEST_STATE);

  // Map State Persistence
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(13);

  // 1. AUTO-SAVE: Persist state whenever it changes (if active)
  React.useEffect(() => {
      // Don't save default/empty state over good data
      if (questState.isActive && questState.activeWalkId) {
          QuestPersistence.saveQuestState(questState.activeWalkId, questState);
      }
  }, [questState]);

  // Map Persistence Effect
  React.useEffect(() => {
      if (mapCenter) {
          localStorage.setItem('cityhunter_map_center', JSON.stringify(mapCenter));
      }
      if (mapZoom) {
          localStorage.setItem('cityhunter_map_zoom', mapZoom.toString());
      }
  }, [mapCenter, mapZoom]);

  // 1.5 AUTO-RESTORE ON MOUNT
  React.useEffect(() => {
     // RESTORE MAP POSITION
     const savedCenter = localStorage.getItem('cityhunter_map_center');
     const savedZoom = localStorage.getItem('cityhunter_map_zoom');
     if (savedCenter) {
         try { setMapCenter(JSON.parse(savedCenter)); } catch(e) {}
     }
     if (savedZoom) {
         setMapZoom(parseInt(savedZoom, 10));
     }

     // A. RESTORE CUSTOM WALKS
     const savedWalks = localStorage.getItem('custom_walks');
     if (savedWalks) {
         try {
             const parsed = JSON.parse(savedWalks);
             if (Array.isArray(parsed) && parsed.length > 0) {
                 // Merge with default WALKS to avoid duplicates if defaults are static
                 // Assuming parsed contains ONLY custom walks or complete list?
                 // Let's assume parsed is the complete updated list. 
                 // But if we update code WALKS, we might miss them.
                 // Better: Store only CUSTOM walks separate or IDs? 
                 // Simple approach: Store the whole 'walks' array.
                 setWalks(parsed);
             }
         } catch (e) {
             console.error("Failed to load custom walks", e);
         }
     }

     // B. RESTORE ACTIVE QUEST
     // Check for any saved active quests
     const allSaved = QuestPersistence.getAllSavedQuests();
     // Find the most recently active one or just the first active one
     // For now, find first where isActive is true
     const activeWalkIdStr = Object.keys(allSaved).find(id => allSaved[Number(id)].isActive);
     
     if (activeWalkIdStr) {
         const walkId = Number(activeWalkIdStr);
         const savedState = allSaved[walkId];
         // Restore it
         
         // We need to look in the *current* walks, effectively the ones we just might have loaded?
         // Since state update is async, 'walks' here is still initial.
         // But we can look in (savedWalks ? JSON.parse(savedWalks) : WALKS)
         const currentWalks = savedWalks ? JSON.parse(savedWalks) : WALKS;
         
         const walk = currentWalks.find((w: Walk) => w.id === walkId);
         if (walk) {
             console.log("Restoring active quest:", walk.name);
             setActiveWalk(walk);
             setActiveTab('Walk');
             setQuestState(savedState);
             // Also restore stop order if custom?
             setWalkStopsOrder(walk.stopIds); 
         }
     }
  }, []);

  // 1.8 AUTO-SAVE CUSTOM WALKS
  React.useEffect(() => {
    // Only save if different from default and not empty
    if (walks !== WALKS && walks.length > 0) {
        localStorage.setItem('custom_walks', JSON.stringify(walks));
    }
  }, [walks]);

  // --- BACKEND INTEGRATION --- // Data State - Start with empty arrays, will be populated from backend
  const [monuments, setMonuments] = useState<DashboardItem[]>([]); // Initialized with empty array
  const [events, setEvents] = useState<DashboardItem[]>([]); // Initialized with empty array
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    // Only load data if user is authenticated
    if (!isAuthenticated) {
      console.log("[AUTH CHECK] User not authenticated, skipping data load");
      setIsLoading(false);
      return;
    }

    // Wait for auth check to complete
    if (authIsLoading) {
      console.log("[AUTH CHECK] Waiting for auth check to complete");
      return;
    }

    console.log("[AUTH CHECK] User authenticated, loading data");
    
    async function loadBackendData() {
        try {
            // Dynamically import to avoid server-side issues if any (though context is client)
            const { POIService } = await import('../services/poi');
            
            // 1. Fetch Monuments (type=monument)
            let monumentPois = [];
            try {
                monumentPois = await POIService.getPois('monument');
                console.log(`[SUCCESS] Loaded ${monumentPois.length} monuments from backend`);
            } catch (err: any) {
                console.error("[ERROR] Backend monuments unavailable:", err.message || err);
                console.warn("No monuments loaded - showing empty list");
            }

            // 2. Fetch Events (type=event)
            let eventPois = [];
            try {
                eventPois = await POIService.getPois('event');
                console.log(`[SUCCESS] Loaded ${eventPois.length} events from backend`);
            } catch (err: any) {
                console.error("[ERROR] Backend events unavailable:", err.message || err);
                console.warn("No events loaded - showing empty list");
            }

            // Map Backend POI to Frontend DashboardItem
            const mapPOIToItem = (p: any): DashboardItem => ({
                id: p._id || p.id,
                name: p.name,
                type: p.tags?.[0] || 'Landmark',
                address: p.address || "Paris, France", 
                likes: p.likes || "1.2k", 
                visitors: p.visitors || "800",
                xp: p.xp || (p.type === 'monument' ? 1000 : undefined),
                swagg: p.swagg || (p.type === 'event' ? 'Event Token' : undefined),
                dist: p.dist || "1.0 km", 
                rating: p.rating || 4.5,
                img: p.images?.[0]?.url || p.image_url || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34.jpg",
                lat: p.location?.coordinates?.[1] || 48.8566, // GeoJSON [lng, lat]
                lng: p.location?.coordinates?.[0] || 2.3522,
                status: p.status || 'LIVE'
            });

            if (monumentPois.length > 0) {
                const mappedMonuments = monumentPois.map(mapPOIToItem);
                setMonuments(prev => {
                    // Combine new results with existing monuments that are part of a walk
                    const walkItemIds = new Set([...(activeWalk?.stopIds || []), ...newWalkStops]);
                    const preserved = prev.filter(item => walkItemIds.has(item.id));
                    const newIds = new Set(mappedMonuments.map((m: DashboardItem) => m.id));
                    return [...preserved.filter(p => !newIds.has(p.id)), ...mappedMonuments];
                });
            }

            if (eventPois.length > 0) {
                const mappedEvents = eventPois.map(mapPOIToItem);
                setEvents(prev => {
                    const walkItemIds = new Set([...(activeWalk?.stopIds || []), ...newWalkStops]);
                    const preserved = prev.filter(item => walkItemIds.has(item.id));
                    const newIds = new Set(mappedEvents.map((e: DashboardItem) => e.id));
                    return [...preserved.filter(p => !newIds.has(p.id)), ...mappedEvents];
                });
            }
            
            // 3. Fetch Walks
            try {
                const backendWalks = await POIService.getWalks();
                console.log("[DEBUG] Raw Backend Walks Data:", backendWalks);
                const mappedWalks: Walk[] = backendWalks.map((w: any) => ({
                    id: w._id || w.id, 
                    name: w.title || w.name,
                    desc: w.description,
                    difficulty: w.difficulty || "Medium",
                    estTime: w.estimated_time || `${w.estimated_duration_minutes || 90} min`,
                    stopIds: w.stops?.map((s: any) => s._id || s.id || s) || []
                }));
                
                if (mappedWalks.length > 0) {
                     console.log("[DEBUG] Backend Walks Mapped:", mappedWalks.map(w => ({ id: w.id, stops: w.stopIds })));
                     // Replace with backend walks
                     setWalks(mappedWalks);
                }
            } catch (wErr: any) {
                console.error("Backend Walks unavailable:", wErr.message || wErr);
                console.warn("No walks loaded - showing empty list. Error details:", {
                    error: wErr,
                    endpoint: '/api/v1/walks/'
                });
            }

        } catch (e: any) {
            console.error("Failed to load backend data, showing empty lists.", e.message || e);
            setHasError(true);
        } finally {
            console.log("[DEBUG] Setting isLoading to false");
            setIsLoading(false);
        }
    }
    
    // Reset error state and retry loading
    setHasError(false);
    loadBackendData();
  }, [isAuthenticated, authIsLoading]);


  // Retry function to manually reload data
  const retryLoading = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    
    async function loadBackendData() {
        try {
            const { POIService } = await import('../services/poi');
            
            // 1. Fetch Monuments
            let monumentPois = [];
            try {
                monumentPois = await POIService.getPois('monument');
                console.log(`[SUCCESS] Loaded ${monumentPois.length} monuments from backend`);
            } catch (err: any) {
                console.error("[ERROR] Backend monuments unavailable:", err.message || err);
                console.warn("No monuments loaded - showing empty list");
            }

            // 2. Fetch Events
            let eventPois = [];
            try {
                eventPois = await POIService.getPois('event');
                console.log(`[SUCCESS] Loaded ${eventPois.length} events from backend`);
            } catch (err: any) {
                console.error("[ERROR] Backend events unavailable:", err.message || err);
                console.warn("No events loaded - showing empty list");
            }

            // Map Backend POI to Frontend DashboardItem
            const mapPOIToItem = (p: any): DashboardItem => ({
                id: p._id || p.id,
                name: p.name,
                type: p.tags?.[0] || 'Landmark',
                address: "Paris, France",
                likes: "5k",
                visitors: "2k",
                xp: p.type === 'monument' ? 1000 : undefined,
                swagg: p.type === 'event' ? 'Event Token' : undefined,
                dist: "1.0 km",
                rating: 4.5,
                img: p.images?.[0]?.url || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34.jpg",
                lat: p.location?.coordinates?.[1] || 48.8566,
                lng: p.location?.coordinates?.[0] || 2.3522,
                status: 'LIVE'
            });

            if (monumentPois.length > 0) {
                const mappedMonuments = monumentPois.map(mapPOIToItem);
                setMonuments(mappedMonuments);
            }

            if (eventPois.length > 0) {
                const mappedEvents = eventPois.map(mapPOIToItem);
                setEvents(mappedEvents);
            }
            
            // 3. Fetch Walks
            try {
                const backendWalks = await POIService.getWalks();
                const mappedWalks: Walk[] = backendWalks.map((w: any) => ({
                    id: w._id || w.id, 
                    name: w.title || w.name,
                    desc: w.description,
                    difficulty: w.difficulty || "Medium",
                    estTime: w.estimated_time || `${w.estimated_duration_minutes || 90} min`,
                    stopIds: w.stops?.map((s: any) => s._id || s.id || s) || []
                }));
                
                if (mappedWalks.length > 0) {
                     setWalks(mappedWalks);
                }
            } catch (wErr: any) {
                console.error("Backend Walks unavailable:", wErr.message || wErr);
                console.warn("No walks loaded - showing empty list. Error details:", {
                    error: wErr,
                    endpoint: '/api/v1/walks/'
                });
            }

        } catch (e: any) {
            console.error("Failed to load backend data, showing empty lists.", e.message || e);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }
    
    loadBackendData();
  }, []);

  // 1.9 Location-based Fetch
  const fetchPoisForLocation = useCallback(async (lat: number, lng: number, radius: number = 2000) => {
      setIsLoading(true);
      try {
           const { POIService } = await import('../services/poi');
           
           // Fetch both monuments and events for this area
           // We can run them in parallel
           const [monumentPois, eventPois] = await Promise.all([
               POIService.getPois('monument', lat, lng, radius).catch(e => {
                   console.warn("Failed to fetch monuments for loc:", e);
                   return [];
               }),
               POIService.getPois('event', lat, lng, radius).catch(e => {
                   console.warn("Failed to fetch events for loc:", e);
                   return [];
               })
           ]);

           console.log(`[SEARCH] Fetched ${monumentPois.length} monuments and ${eventPois.length} events for [${lat}, ${lng}]`);

           // Map Backend POI to Frontend DashboardItem
           // Use a localized mapper if possible, or duplicate the logic for now to ensure consistency
           // Ideally this mapper should be a utility.
           const mapPOIToItem = (p: any): DashboardItem => ({
                id: p._id || p.id,
                name: p.name,
                type: p.tags?.[0] || (p.start_time ? 'event' : 'monument'),
                address: p.address || "Start Coordinates", 
                likes: p.likes || "1.2k", 
                visitors: p.visitors || "800",
                xp: p.xp || (p.tags?.[0] === 'monument' || !p.start_time ? 1000 : undefined),
                swagg: p.swagg || (p.tags?.[0] === 'event' || p.start_time ? 'Event Token' : undefined),
                dist: p.dist || "Nearby", 
                rating: p.rating || 4.5,
                img: p.images?.[0]?.url || p.image_url || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34.jpg",
                lat: p.location?.coordinates?.[1],
                lng: p.location?.coordinates?.[0],
                status: p.status || 'LIVE'
            });

           if (monumentPois) {
               const mapped = monumentPois.map(mapPOIToItem);
               setMonuments(prev => {
                    const walkItemIds = new Set([...(activeWalk?.stopIds || []), ...newWalkStops]);
                    const preserved = prev.filter(item => walkItemIds.has(item.id));
                    const newIds = new Set(mapped.map((m: DashboardItem) => m.id));
                    return [...preserved.filter(p => !newIds.has(p.id)), ...mapped];
               });
           }
           if (eventPois) {
                const mapped = eventPois.map(mapPOIToItem);
                setEvents(prev => {
                     const walkItemIds = new Set([...(activeWalk?.stopIds || []), ...newWalkStops]);
                     const preserved = prev.filter(item => walkItemIds.has(item.id));
                     const newIds = new Set(mapped.map((e: DashboardItem) => e.id));
                     return [...preserved.filter(p => !newIds.has(p.id)), ...mapped];
                });
           }

      } catch (e) {
          console.error("Failed to fetch location POIs", e);
          // Don't set global error for a search, just maybe warn?
      } finally {
          setIsLoading(false);
      }
  }, []);

  // 2. State Updater
  const updateQuestState = useCallback((updates: Partial<QuestState>) => {
      setQuestState(prev => {
          const newState = { ...prev, ...updates };
          return newState;
      });
  }, []);

  return (
    <DashboardContext.Provider value={{
      activeTab, setActiveTab,
      activeCategories, setActiveCategories,
      searchQuery, setSearchQuery,
      selectedMonumentId, setSelectedMonumentId,
      activeWalk, setActiveWalk,
      excludedStopIds, setExcludedStopIds,
      walkStopsOrder, setWalkStopsOrder,
      expandedStopId, setExpandedStopId,
      sidebarWidth, setSidebarWidth,
      isCollapsed, setIsCollapsed,
      mobileView, setMobileView,

      questState, updateQuestState,
      walks, addWalk,
      isCreatingWalk, setIsCreatingWalk,
      newWalkStops, setNewWalkStops,

      mapCenter, setMapCenter,
      mapZoom, setMapZoom,

      // EXPOSE NEW DATA (casted to any or explicit interface update needed)
      monuments,
      events,
      isLoading,
      hasError,
      retryLoading,
      fetchPoisForLocation
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}
