'use client';

import { useState, useEffect } from 'react';
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
import { POIService, POIBase } from '@/app/services/poi';
import { WalkService } from '@/app/services/walks';
import PoiSidebar from './PoiSidebar';
import ItineraryCanvas from './ItineraryCanvas';

export default function WalkBuilder() {
  const [pois, setPois] = useState<POIBase[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activePoi, setActivePoi] = useState<POIBase | null>(null);
  
  const [itinerary, setItinerary] = useState<{ id: string; poi: POIBase }[]>([]);
  const [walkTitle, setWalkTitle] = useState('');
  const [walkDescription, setWalkDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    POIService.getPois().then(setPois).catch(console.error);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    if (active.data.current?.type === 'POI') {
      setActivePoi(active.data.current.poi);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.data.current?.origin === 'sidebar' && over) {
       const newId = `${activePoi?.id}-${Date.now()}`;
       if (activePoi) {
           setItinerary(prev => [...prev, { id: newId, poi: activePoi }]);
       }
    } 
    else if (active.id !== over?.id && over) {
        const oldIndex = itinerary.findIndex(i => i.id === active.id);
        const newIndex = itinerary.findIndex(i => i.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
            setItinerary((items) => arrayMove(items, oldIndex, newIndex));
        }
    }

    setActiveId(null);
    setActivePoi(null);
  };

  const handleRemove = (id: string) => {
      setItinerary(prev => prev.filter(i => i.id !== id));
  };

  const handleSave = async () => {
      if (!walkTitle) {
          alert('Please enter a walk title');
          return;
      }
      if (itinerary.length < 2) {
          alert('A walk must have at least 2 stops');
          return;
      }

      setSaving(true);
      try {
          await WalkService.createWalk({
              title: walkTitle,
              description: walkDescription,
              stops: itinerary.map(i => i.poi.id!) 
          });
          alert('Walk saved successfully!');
      } catch (e) {
          console.error(e);
          alert('Failed to save walk');
      } finally {
          setSaving(false);
      }
  };

  return (
    <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
    >
        <div className="flex h-[calc(100vh-140px)] gap-6 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 bg-surface/30 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">
                <PoiSidebar pois={pois} />
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
                {/* Header / Meta */}
                <div className="glass p-6 rounded-2xl border border-white/10 shadow-lg shrink-0">
                    <div className="flex gap-4 mb-4">
                        <input 
                            type="text" 
                            placeholder="My Epic Walk..." 
                            className="input bg-transparent border-0 border-b border-white/20 rounded-none px-0 text-3xl font-extrabold text-white placeholder-white/20 focus:outline-none focus:border-accent w-full h-auto py-2"
                            value={walkTitle}
                            onChange={(e) => setWalkTitle(e.target.value)}
                        />
                         <button 
                            className={`btn btn-lg bg-accent text-black border-none hover:bg-white hover:scale-105 transition-all font-bold px-8 shadow-[0_0_20px_rgba(204,255,0,0.3)] ${saving ? 'loading' : ''}`}
                            onClick={handleSave}
                        >
                            {saving ? 'Saving...' : 'Save Draft'}
                        </button>
                    </div>
                    <textarea 
                        className="textarea bg-black/20 border-0 rounded-xl w-full text-secondary placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-accent resize-none h-20" 
                        placeholder="Add a short description about what makes this walk special..."
                        value={walkDescription}
                        onChange={(e) => setWalkDescription(e.target.value)}
                    ></textarea>
                </div>

                {/* Canvas */}
                <div className="flex-1 rounded-2xl shadow-inner overflow-hidden border border-white/5 relative group">
                    <div className="absolute inset-0 border-2 border-dashed border-white/5 pointer-events-none rounded-2xl group-hover:border-accent/10 transition-colors z-20"></div>
                     <ItineraryCanvas items={itinerary} onRemove={handleRemove} />
                </div>
            </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
            {activeId && activePoi ? (
                <div className="spotlight-card bg-surface border border-accent text-white shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-4 w-72 rounded-xl rotate-3 cursor-grabbing backdrop-blur-xl">
                    <h4 className="font-bold text-lg">{activePoi.name}</h4>
                    <p className="text-secondary text-xs mt-1">Dragging...</p>
                </div>
            ) : null}
        </DragOverlay>
    </DndContext>
  );
}
