"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
// Removed DnD imports as they moved to Sidebar

import DashboardNavbar from "../components/DashboardNavbar";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { SearchBar, CategoryPill } from "../components/dashboard/SidebarComponents";
import { MonumentCard, WalkCard, DraggableWalkStop } from "../components/dashboard/Cards";
import { CATEGORIES, MONUMENTS, EVENTS, WALKS, getItemById } from "../constants/dashboard-constants";
import { Walk, DashboardItem } from "../interfaces/dashboard";
import { useDashboardContext } from "../context/DashboardContext";
import { QuestPersistence } from "../utils/quest-persistence";
import DashboardUrlListener from "../components/dashboard/DashboardUrlListener";

// Dynamic Import for Map to client-side only (no SSR)
const LeafletMap = dynamic(() => import("../components/dashboard/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-surface overflow-hidden">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-divider/10 border-t-accent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
           <i className="fa-solid fa-satellite-dish text-secondary/50"></i>
        </div>
      </div>
      <div className="mt-4 font-mono text-xs text-secondary animate-pulse tracking-widest uppercase">
         Connecting to Grid...
      </div>
    </div>
  ),
});

export default function Dashboard() {
  // Global State (Context)
  const {
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
      monuments, events, isLoading // New
  } = useDashboardContext();

  // Local UI State
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter Logic
  const filteredItems = useMemo(() => {
    // If loading, maybe return empty or show loader?
    // Current design shows spinner in Map if dynamically loaded, but list is separate.
    
    if (activeTab === 'Walk') {
        // ALWAYS return all items for the map in Walk tab.
        return [...monuments, ...events];
    }

    let sourceData: DashboardItem[] = [];
    if (activeTab === 'Monument') sourceData = monuments;
    else if (activeTab === 'Event') sourceData = events;

    return sourceData.filter(m => {
        const isAll = activeCategories.includes('all');
        const validTypes = activeCategories.map(catId => CATEGORIES.find(c => c.id === catId)?.typeValue).filter(Boolean);
        const categoryMatch = isAll || (m.type && validTypes.includes(m.type));
        const query = searchQuery.toLowerCase();
        const searchMatch = !query || 
            m.name.toLowerCase().includes(query) || 
            m.address.toLowerCase().includes(query) || 
            `${m.lat}, ${m.lng}`.includes(query);
        return categoryMatch && searchMatch;
    });
  }, [activeCategories, searchQuery, activeTab, activeWalk, excludedStopIds, walkStopsOrder, isCreatingWalk, monuments, events]);

  // Improved Item Lookup that checks Context (dynamic) and Constants (static)
  const getAnyItemById = useCallback((id: number | string) => {
      // 1. Check Context (Dynamic Backend Data)
      const contextItem = [...monuments, ...events].find(m => String(m.id) === String(id));
      if (contextItem) return contextItem;
      // 2. Check Static Constants (Fallback)
      const staticItem = getItemById(id);
      if (!staticItem) console.warn(`[DEBUG] page.tsx: Item not found for ID: ${id}`);
      return staticItem;
  }, [monuments, events]);

  // Memoized Walk Path for the Map
  const walkPath = useMemo(() => {
      if (activeTab !== 'Walk') return undefined;
      
      if (isCreatingWalk) {
          return newWalkStops.map(id => getAnyItemById(id)).filter((i): i is DashboardItem => !!i);
      }
      
      if (activeWalk) {
          const stopsToMap = walkStopsOrder.length > 0 ? walkStopsOrder : activeWalk.stopIds;
          return stopsToMap
              .map(id => getAnyItemById(id))
              .filter((i): i is DashboardItem => !!i && !excludedStopIds.includes(i.id));
      }
      
      return undefined;
  }, [activeTab, isCreatingWalk, newWalkStops, activeWalk, walkStopsOrder, excludedStopIds, getAnyItemById]);

  // Resizing Logic
  const startResizing = (e: React.MouseEvent) => { e.preventDefault(); setIsResizing(true); };
  const stopResizing = () => { setIsResizing(false); };
  const resize = (e: MouseEvent) => {
      if (isResizing && containerRef.current) {
          const newWidth = e.clientX - containerRef.current.getBoundingClientRect().left;
          if (newWidth > 300 && newWidth < 800) setSidebarWidth(newWidth);
      }
  };

  useEffect(() => {
      if (isResizing) {
          window.addEventListener('mousemove', resize);
          window.addEventListener('mouseup', stopResizing);
      }
      return () => {
          window.removeEventListener('mousemove', resize);
          window.removeEventListener('mouseup', stopResizing);
      };
  }, [isResizing]);

  // Reset logic on tab change
  useEffect(() => {
      if (activeTab !== 'Walk') {
          setActiveWalk(null);
          setExcludedStopIds([]);
          setSelectedMonumentId(null);
          setWalkStopsOrder([]);
      }
  }, [activeTab]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-divider/10 border-t-accent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <i className="fa-solid fa-satellite-dish text-secondary/50 text-2xl"></i>
          </div>
        </div>
        <div className="mt-6 font-mono text-sm text-secondary animate-pulse tracking-widest uppercase">
          Loading Dashboard...
        </div>
        <div className="mt-2 font-mono text-xs text-secondary/50">
          Fetching monuments, events, and walks
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-screen overflow-hidden bg-canvas text-primary selection:bg-accent selection:text-black">
      <DashboardNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR PANEL */}
        <div 
            style={{ 
                width: isCollapsed ? '0px' : `${sidebarWidth}px`, 
                opacity: isCollapsed ? 0 : 1,
            }}
            className={`
                h-full overflow-hidden relative z-10 flex flex-col border-r border-divider/10 bg-canvas shrink-0 transition-[width,opacity] duration-300 ease-in-out
                ${mobileView === 'map' ? 'hidden md:flex' : 'flex w-full md:w-auto'}
            `}
        >
            <DashboardSidebar filteredItems={filteredItems} />
        </div>

        {/* DRAGGABLE RESIZER (Hidden on Mobile) */}
        <div 
            className={`hidden md:flex w-1 bg-divider/10 hover:bg-accent cursor-col-resize z-20 transition-colors relative items-center justify-center ${isResizing ? 'bg-accent' : ''}`}
            onMouseDown={startResizing}
        >
            <div className="flex flex-col gap-0.5">
                <div className="w-0.5 h-0.5 bg-secondary rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-secondary rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-secondary rounded-full"></div>
            </div>
            
            {/* Collapse Button */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute left-0 -ml-3 w-6 h-12 bg-surface border border-l-0 border-divider/10 rounded-r-xl flex items-center justify-center text-xs text-secondary hover:text-accent shadow-md z-30"
            >
                <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
            </button>
        </div>

        {/* RIGHT MAP PANEL */}
        <div className={`flex-1 h-full relative bg-surface ${mobileView === 'list' ? 'hidden md:block' : 'block'}`}>
            <LeafletMap 
                items={filteredItems} 
                selectedId={selectedMonumentId} 
                walkPath={walkPath}
                isCreatingWalk={isCreatingWalk}
                onAddToWalk={(id) => {
                    if (newWalkStops.includes(id)) return;
                    setNewWalkStops(prev => [...prev, id]);
                }}
                addedStopIds={newWalkStops}
            />
            
            {/* Overlay Info (Removed per user request) */}
        </div>

        {/* MOBILE TOGGLE BUTTON */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] md:hidden flex gap-2">
            <button 
                onClick={() => setMobileView('list')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-xl border border-divider/10 backdrop-blur-md transition-all ${mobileView === 'list' ? 'bg-primary text-canvas' : 'bg-surface/80 text-secondary'}`}
            >
                <i className="fa-solid fa-list"></i> LIST
            </button>
            <button 
                onClick={() => setMobileView('map')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-xl border border-divider/10 backdrop-blur-md transition-all ${mobileView === 'map' ? 'bg-primary text-canvas' : 'bg-surface/80 text-secondary'}`}
            >
                <i className="fa-solid fa-map"></i> MAP
            </button>
        </div>

      </div>
      <DashboardUrlListener />
    </div>
  );
}
