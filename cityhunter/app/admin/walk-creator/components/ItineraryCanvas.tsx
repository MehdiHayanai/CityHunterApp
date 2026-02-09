'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { POIBase } from '@/app/services/poi';
import { useDroppable } from '@dnd-kit/core';

interface ItineraryItemProps {
  id: string;
  poi: POIBase;
  index: number;
  onRemove: (id: string) => void;
}

function SortableItineraryItem({ id, poi, index, onRemove }: ItineraryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-6 mb-6 relative group"
    >
      <div className="flex flex-col items-center">
         {/* Connector Line */}
         {index > 0 && <div className="w-0.5 h-6 bg-gradient-to-b from-accent/50 to-primary/50 mb-2"></div>}
         
         {/* Number Badge */}
         <div 
            {...listeners} 
            className="w-10 h-10 rounded-full bg-surface border border-accent/30 text-accent flex items-center justify-center font-bold cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(204,255,0,0.2)] z-10 text-lg font-mono hover:bg-accent hover:text-black transition-all"
         >
           {index + 1}
         </div>

         {/* Connector Line below */}
         <div className="w-0.5 h-full bg-gradient-to-b from-primary/50 to-accent/20 absolute top-10 left-5 -z-0"></div>
      </div>

      <div className="glass bg-surface/40 flex-1 p-5 rounded-2xl border border-white/5 hover:border-accent/30 transition-all group-hover:bg-white/5 backdrop-blur-md">
         <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-lg text-white mb-1">{poi.name}</h4>
               <p className="text-sm text-secondary line-clamp-2">{poi.description}</p>
            </div>
            <button 
              onClick={() => onRemove(id)}
              className="btn btn-ghost btn-xs text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              Remove
            </button>
         </div>
      </div>
    </div>
  );
}

interface ItineraryCanvasProps {
  items: { id: string; poi: POIBase }[]; 
  onRemove: (id: string) => void;
}

export default function ItineraryCanvas({ items, onRemove }: ItineraryCanvasProps) {
  const { setNodeRef } = useDroppable({
    id: 'itinerary-canvas',
  });

  return (
    <div ref={setNodeRef} className="bg-black/10 rounded-2xl border border-white/5 min-h-[150px] p-4 relative transition-colors hover:bg-black/20">
       {/* Background glow effects */}
       {items.length > 0 && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-accent/5 to-transparent pointer-events-none rounded-2xl"></div>}

       <div className="relative z-10">
         <SortableContext 
            items={items.map(i => i.id)} 
            strategy={verticalListSortingStrategy}
         >
            {items.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 text-center opacity-50 border-2 border-dashed border-white/10 rounded-xl">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-2xl">
                        🗺️
                  </div>
                  <p className="text-sm font-bold text-white mb-1">Itinerary Empty</p>
                  <p className="text-xs text-secondary">HINT: Drag assets from the list below.</p>
               </div>
            ) : (
                <div className="space-y-4"> 
                    {items.map((item, index) => (
                    <SortableItineraryItem 
                        key={item.id} 
                        id={item.id} 
                        poi={item.poi} 
                        index={index}
                        onRemove={onRemove}
                    />
                    ))}
                    
                    {/* End Flag */}
                    <div className="flex items-center gap-4 justify-center py-4 border-t border-white/5 border-dashed mt-6">
                         <div className="w-8 h-8 rounded-full bg-accent text-black flex items-center justify-center shadow-[0_0_10px_rgba(204,255,0,0.5)] z-10 text-sm font-bold">
                            END
                         </div>
                         <div className="text-xs text-secondary tracking-widest uppercase">Mission Complete</div>
                    </div>
                </div>
            )}
         </SortableContext>
       </div>
    </div>
  );
}
