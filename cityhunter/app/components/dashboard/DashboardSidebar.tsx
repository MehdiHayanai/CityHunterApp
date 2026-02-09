"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';

import { SearchBar, CategoryPill } from "./SidebarComponents";
import { MonumentCard, WalkCard, DraggableWalkStop } from "./Cards";
import { CATEGORIES, getItemById } from "../../constants/dashboard-constants";
import { Walk, DashboardItem } from "../../interfaces/dashboard";
import { useDashboardContext } from "../../context/DashboardContext";
import { QuestPersistence } from "../../utils/quest-persistence";

interface DashboardSidebarProps {
  filteredItems: DashboardItem[];
}

export default function DashboardSidebar({ filteredItems }: DashboardSidebarProps) {
  const router = useRouter();
  const {
      activeTab, setActiveTab,
      activeCategories, setActiveCategories,
      searchQuery, setSearchQuery,
      activeWalk, setActiveWalk,
      excludedStopIds, setExcludedStopIds,
      walkStopsOrder, setWalkStopsOrder,
      expandedStopId, setExpandedStopId,
      questState, updateQuestState,
      walks, addWalk,
      isCreatingWalk, setIsCreatingWalk,
      newWalkStops, setNewWalkStops,
      setSelectedMonumentId, selectedMonumentId,
      setMobileView,
      monuments,
      events
  } = useDashboardContext();

  // Local State
  const [newWalkName, setNewWalkName] = useState('');
  // const [newWalkDifficulty, setNewWalkDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium'); // Not used in UI yet

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handlers
  const handleCreateWalkStart = () => {
    router.push('/admin/walk-creator');
  };

  const handleWalkEdit = (id: string | number) => {
    router.push(`/admin/walk-creator?id=${id}`);
  };

  const handleSaveWalk = () => {
      // This is now handled by the external creator, but keeping for reference if needed locally
      // In a real refactor, we'd remove local creation logic from here entirely.
  };

  const handleCancelCreate = () => {
      setIsCreatingWalk(false);
      setNewWalkStops([]);
      setNewWalkName('');
  };

  const toggleCategory = (id: string) => {
    setActiveCategories(prev => {
        if (id === 'all') return ['all'];
        let newCats = prev.filter(c => c !== 'all');
        if (newCats.includes(id)) newCats = newCats.filter(c => c !== id);
        else newCats.push(id);
        return newCats.length === 0 ? ['all'] : newCats;
    });
  };

  const handleWalkSelect = (walk: Walk) => {
    console.log(`[DEBUG] Selecting Walk: ${walk.name}, Stop IDs:`, walk.stopIds);
    setActiveWalk(walk);
    setWalkStopsOrder(walk.stopIds);
    setExcludedStopIds([]);
    setExpandedStopId(null);
    setMobileView('list');
  };

  const toggleWalkStop = (id: number | string) => {
    setExcludedStopIds(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleStopClick = (id: number | string) => {
      if (expandedStopId === id) {
          handleItemSelect(id);
      } else {
          setExpandedStopId(id);
      }
  };

  const handleItemSelect = (id: number | string) => {
      setSelectedMonumentId(id);
  };

  // Improved Item Lookup that checks Context (dynamic) and Constants (static)
  const getAnyItemById = (id: number | string) => {
      // 1. Check Context (Dynamic Backend Data)
      const contextItem = [...monuments, ...events].find(m => m.id === id);
      if (contextItem) return contextItem;
      // 2. Check Static Constants (Fallback)
      return getItemById(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
          if (isCreatingWalk) {
               setNewWalkStops((items) => {
                  const oldIndex = items.indexOf(Number(active.id));
                  const newIndex = items.indexOf(Number(over!.id));
                  return arrayMove(items, oldIndex, newIndex);
               });
          } else {
               setWalkStopsOrder((items) => {
                  const oldIndex = items.indexOf(Number(active.id));
                  const newIndex = items.indexOf(Number(over!.id));
                  return arrayMove(items, oldIndex, newIndex);
               });
          }
      }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="p-4 md:p-8 space-y-6 pb-32 w-full max-w-md mx-auto md:max-w-none md:mx-0 min-w-[320px] md:min-w-[350px]">
            
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tight block">
                        {activeTab === 'Walk' && activeWalk ? 'Route Planner' : 
                         activeTab === 'Walk' && isCreatingWalk ? 'Create Route' :
                         activeTab === 'Walk' ? 'Available Routes' :
                         activeTab === 'Monument' ? 'City Monuments' : 'Live Events'}
                    </h2>
                    <p className="text-secondary text-sm font-mono block">
                        {activeTab === 'Walk' && activeWalk ? `Editing: ${activeWalk.name}` :
                         activeTab === 'Walk' && isCreatingWalk ? 'Select monuments on map to add.' :
                         `Explore the ${activeTab.toLowerCase()} network.`}
                    </p>
                </div>
                {activeWalk && (
                     <button 
                        onClick={() => setActiveWalk(null)}
                        className="text-xs font-bold text-accent hover:underline"
                     >
                        <i className="fa-solid fa-arrow-left mr-1"></i> BACK
                     </button>
                )}
            </div>

            {/* Search & Filters */}
            {!activeWalk && !isCreatingWalk && (
                <>
                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                    
                    {/* MOBILE TABS (Segmented Control) */}
                    <div className="flex w-fit mx-auto p-1 bg-surface border border-divider/10 rounded-xl md:hidden mb-2">
                        {['Monument', 'Event', 'Walk'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${
                                    activeTab === tab 
                                    ? 'bg-accent text-black shadow-lg' 
                                    : 'text-secondary hover:text-primary'
                                }`}
                            >
                                {tab.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    
                    {activeTab !== 'Walk' && (
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient-right">
                            {CATEGORIES.map(cat => (
                                <CategoryPill 
                                    key={cat.id}
                                    {...cat}
                                    isActive={activeCategories.includes(cat.id)}
                                    onClick={() => toggleCategory(cat.id)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

                {/* Content Grid */}
            <div className="space-y-4">

                {/* WALKS LIST */}
                {activeTab === 'Walk' && !activeWalk && !isCreatingWalk && (
                    <div className="space-y-4">
                        <button 
                            onClick={handleCreateWalkStart}
                            className="w-full py-3 bg-accent text-black hover:opacity-90 rounded-xl font-bold text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-accent/20 flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-plus-circle"></i> Create New Route
                        </button>
                        {walks.map(walk => {
                        const isActive = questState.activeWalkId === walk.id && questState.isActive;
                        const savedState = QuestPersistence.loadQuestState(walk.id);
                        const isPaused = !isActive && !!savedState && savedState.activeWalkId === walk.id; 

                        return (
                            <WalkCard 
                                key={walk.id} 
                                walk={walk} 
                                onSelect={handleWalkSelect} 
                                onEdit={handleWalkEdit}
                                isActiveQuest={isActive}
                                isPaused={isPaused}
                            />
                        );

                    })}
                    </div>
                )}

                {/* CREATE WALK UI */}
                {activeTab === 'Walk' && isCreatingWalk && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-secondary uppercase">Route Name</label>
                            <input 
                                type="text" 
                                value={newWalkName}
                                onChange={(e) => setNewWalkName(e.target.value)}
                                placeholder="Enter route name..." 
                                className="w-full bg-surface border border-divider/10 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
                            />
                        </div>
                        
                        <div className="mt-4">
                            <h3 className="text-xs font-mono text-secondary uppercase mb-2">Selected Stops ({newWalkStops.length})</h3>
                            <div className="space-y-2">
                                <DndContext 
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext 
                                        items={newWalkStops} 
                                        strategy={verticalListSortingStrategy}
                                    >
                                    {newWalkStops.map((id, idx) => {
                                            const item = getAnyItemById(id);
                                            if (!item) return null;
                                            return (
                                                <DraggableWalkStop 
                                                    key={id} 
                                                    item={item}
                                                    count={idx + 1}
                                                    isExcluded={false} 
                                                    isExpanded={expandedStopId === id}
                                                    onToggle={() => setNewWalkStops(prev => prev.filter(pid => pid !== id))}
                                                    onClick={() => handleStopClick(id)}
                                                />
                                            );
                                        })}
                                    </SortableContext>
                                </DndContext>

                                {newWalkStops.length === 0 && (
                                    <div className="text-center py-8 border-2 border-dashed border-divider/10 rounded-xl text-secondary text-xs">
                                        Select monuments on map
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button 
                                onClick={handleCancelCreate}
                                className="flex-1 py-3 bg-surface text-secondary hover:text-primary rounded-xl font-bold text-xs"
                            >
                                CANCEL
                            </button>
                            <button 
                                onClick={handleSaveWalk}
                                disabled={newWalkStops.length < 2 || !newWalkName}
                                className={`flex-1 py-3 rounded-xl font-bold text-xs text-black transition-all ${newWalkStops.length >= 2 && newWalkName ? 'bg-accent hover:opacity-90' : 'bg-divider/20 cursor-not-allowed opacity-50'}`}
                            >
                                SAVE ROUTE
                            </button>
                        </div>
                    </div>
                )}

                {/* ACTIVE WALK STOPS (DRAGGABLE) */}
                {activeTab === 'Walk' && activeWalk && (
                    <div className="space-y-2">
                        {/* QUEST CONTROLS */}
                        <div className="mb-6">
                            {questState.isActive && questState.activeWalkId === activeWalk.id ? (
                                <div className="p-4 rounded-xl bg-accent/10 border border-accent/50 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 animate-pulse">
                                             <i className="fa-solid fa-satellite-dish text-accent"></i>
                                             <span className="text-xs font-black text-accent tracking-widest uppercase">UPLINK ESTABLISHED</span>
                                        </div>
                                        <button 
                                            onClick={() => updateQuestState({ isActive: false, activeWalkId: null })}
                                            className="text-[10px] font-bold text-red-500 hover:text-red-400 border border-red-500/20 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                                        >
                                            PAUSE (SAVE)
                                        </button>
                                    </div>
                                    <div className="text-xs text-secondary font-mono flex justify-between">
                                        <span>Target: STOP #{questState.currentStopIndex + 1}</span>
                                        <span className="text-accent font-bold">XP: {questState.xpGained}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Check if we have a saved state for this walk */}
                                    {QuestPersistence.loadQuestState(activeWalk.id) ? (
                                        <button 
                                            onClick={() => {
                                                const saved = QuestPersistence.loadQuestState(activeWalk.id);
                                                if (saved) {
                                                    updateQuestState({ ...saved, isActive: true, isSimulationMode: questState.isSimulationMode });
                                                }
                                            }}
                                            className="w-full py-4 bg-primary text-canvas rounded-xl font-black tracking-widest hover:bg-accent hover:text-black transition-all shadow-lg hover:shadow-accent/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <i className="fa-solid fa-play"></i> RESUME MISSION
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => updateQuestState({ 
                                                isActive: true, 
                                                activeWalkId: activeWalk.id,
                                                currentStopIndex: 0,
                                                startTime: new Date().toISOString(),
                                                // Reset others
                                                xpGained: 0,
                                                completedStopIds: [],
                                                pendingEncounterId: null,
                                                showQuiz: false
                                            })}
                                            className="w-full py-4 bg-primary text-canvas rounded-xl font-black tracking-widest hover:bg-accent hover:text-black transition-all shadow-lg hover:shadow-accent/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <i className="fa-solid fa-rocket"></i> INITIATE QUEST
                                        </button>
                                    )}
                                    
                                    {/* Reset Option if Saved exists */}
                                    {QuestPersistence.loadQuestState(activeWalk.id) && (
                                        <button
                                            onClick={() => {
                                                if (confirm("Are you sure you want to restart? All progress will be lost.")) {
                                                    QuestPersistence.clearQuestState(activeWalk.id);
                                                    updateQuestState({ activeWalkId: null }); 
                                                }
                                            }}
                                            className="w-full py-2 bg-transparent text-secondary text-[10px] font-bold tracking-widest hover:text-red-400 transition-colors uppercase"
                                        >
                                            [ Restart Mission ]
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-4 rounded-xl bg-surface/50 border border-divider/10 mb-6">
                            <div className="flex justify-between text-xs font-mono text-secondary mb-2">
                                <span>EST. TIME</span>
                                <span className="text-primary">{activeWalk.estTime}</span>
                            </div>
                            <div className="flex justify-between text-xs font-mono text-secondary">
                                <span>DIFFICULTY</span>
                                <span className="text-primary">{activeWalk.difficulty}</span>
                            </div>
                        </div>

                        <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex justify-between">
                            <span>Stop Sequence</span>
                            <span className="text-[10px] opacity-70"><i className="fa-solid fa-arrow-down-up mr-1"></i>Drag to Reorder</span>
                        </h3>
                        
                        {filteredItems.length === 0 && <p className="text-secondary text-sm">No valid stops found.</p>}
                        
                        <DndContext 
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext 
                                items={walkStopsOrder} 
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {(() => {
                                        console.log(`[DEBUG] Rendering ${walkStopsOrder.length} stops for walk:`, activeWalk?.name);
                                        return walkStopsOrder.map((id, index) => {
                                            const item = getAnyItemById(id);
                                            if (!item) {
                                                console.warn(`[DEBUG] Stop item not found for ID: ${id}`);
                                                return null;
                                            }
                                            const isExcluded = excludedStopIds.includes(id);
                                            return (
                                                <DraggableWalkStop 
                                                    key={item.id} 
                                                    item={item} 
                                                    count={index + 1}
                                                    isExcluded={isExcluded}
                                                    isExpanded={expandedStopId === id}
                                                    onClick={() => setExpandedStopId(expandedStopId === id ? null : id)}
                                                    onToggle={(id) => {
                                                        setExcludedStopIds(prev => 
                                                            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                                                        );
                                                    }}
                                                />
                                            );
                                        });
                                    })()}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                )}

                {/* MONUMENTS / EVENTS LIST */}
                {activeTab !== 'Walk' && (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredItems.map(item => (
                            <MonumentCard 
                                key={item.id} 
                                item={item} 
                                layout="list" 
                                onSelect={handleItemSelect}
                                isSelected={selectedMonumentId === item.id}
                            />
                        ))}
                        {filteredItems.length === 0 && (
                            <div className="text-center py-20 text-secondary">
                                <i className="fa-solid fa-satellite-dish text-4xl mb-4 opacity-50"></i>
                                <p>No signal found in this sector.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
