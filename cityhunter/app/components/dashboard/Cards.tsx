"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardItem, Walk, Monument, Event } from "../../interfaces/dashboard";

/* --- MONUMENT CARD --- */
interface MonumentCardProps {
  item: DashboardItem;
  layout?: 'grid' | 'list';
  onSelect: (id: number | string) => void;
  isSelected?: boolean;
}

export const MonumentCard = ({ item, layout = 'grid', onSelect, isSelected }: MonumentCardProps) => {
  const router = useRouter();
  // Helper to check if it's an event or monument safely for types
  const xp = (item as Monument).xp;
  const swagg = (item as Event).swagg;
  
  if (layout === 'list') {
    return (
      <>
        {/* DESKTOP VIEW */}
        <div 
          onClick={() => onSelect(item.id)}
          className={`hidden md:flex gap-4 bg-surface p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              isSelected ? 'border-accent shadow-[0_0_15px_-5px_rgba(var(--c-accent),0.3)]' : 'border-divider/10 hover:border-accent'
          }`}
        >
          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
            <img src={item.img} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-primary truncate">{item.name}</h3>
              {item.status === 'NEW' && <span className="text-[9px] bg-accent text-black px-1.5 py-0.5 rounded font-mono font-bold">NEW</span>}
            </div>
            <p className="text-xs text-secondary font-mono mb-2">{item.type} • {item.dist}</p>
            <div className="mt-auto flex justify-between items-end">
              <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[10px] text-yellow-500 bg-canvas px-2 py-1 rounded border border-divider/10">
                      <i className="fa-solid fa-star"></i> {item.rating}
                  </div>
                  {xp ? (
                    <div className="font-mono flex items-baseline gap-1">
                      <span className="text-accent font-bold text-sm">+{xp}</span> <span className="text-[10px] text-secondary">XP</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-purple-400">
                      <i className="fa-solid fa-medal"></i>
                      <span className="font-bold text-xs">{swagg}</span>
                    </div>
                  )}
              </div>
              <Link 
                  href={`/experience/${item.id}`} 
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 px-4 rounded-lg bg-accent text-black font-bold text-xs flex items-center gap-2 hover:bg-white transition-colors shadow-lg shadow-accent/20"
              >
                  EXPLORE <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div 
          onClick={() => router.push(`/experience/${item.id}`)}
          className={`md:hidden flex flex-col mx-auto w-full max-w-[300px] bg-surface p-2 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              isSelected ? 'border-accent shadow-[0_0_15px_-5px_rgba(var(--c-accent),0.3)]' : 'border-divider/10 hover:border-accent'
          }`}
        >
          <div className="w-full aspect-[3/4] rounded-xl overflow-hidden relative mb-2">
            <img src={item.img} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            {item.status === 'NEW' && <span className="absolute top-2 right-2 text-[9px] bg-accent text-black px-1.5 py-0.5 rounded font-mono font-bold shadow-md">NEW</span>}
          </div>
          
          <div className="flex-1 flex flex-col justify-between min-w-0">
             <div>
                <h3 className="font-bold text-primary truncate text-sm mb-1">{item.name}</h3>
                <p className="text-[10px] text-secondary font-mono mb-2 truncate">{item.type} • {item.dist}</p>
             </div>
             
             <div className="flex items-center justify-between mb-2">
                 <div className="text-[10px] text-yellow-500">
                      <i className="fa-solid fa-star"></i> {item.rating}
                 </div>
                 {xp ? (
                    <span className="text-accent font-bold text-xs">+{xp} XP</span>
                  ) : (
                    <span className="text-purple-400 font-bold text-xs">{swagg}</span>
                  )}
             </div>

             <Link 
                 href={`/experience/${item.id}`} 
                 onClick={(e) => e.stopPropagation()}
                 className="w-full h-9 rounded-lg bg-accent text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-lg shadow-accent/20"
             >
                 EXPLORE <i className="fa-solid fa-arrow-right"></i>
             </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div 
      onClick={() => onSelect(item.id)}
      className="group bg-surface rounded-2xl border border-divider/10 overflow-hidden hover:border-accent transition-all cursor-pointer relative"
    >
      <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/10 font-mono text-xs font-bold">
        {xp ? (
          <span className="text-accent">+{xp} XP</span>
        ) : (
             <span className="text-purple-400"><i className="fa-solid fa-medal mr-1"></i>PIN</span>
        )}
      </div>
      <div className="h-40 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-[1]"></div>
        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        
        {/* Action Button - Always Visible */}
        <Link 
            href={`/experience/${item.id}`}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[5] w-14 h-14 bg-accent/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.4)] group-hover:scale-110 group-hover:bg-accent transition-all duration-300"
            aria-label={`Explore ${item.name}`}
        >
            <i className="fa-solid fa-location-arrow text-black text-xl animate-pulse-slow"></i>
        </Link>

        <div className="absolute top-3 right-3 z-[6] pointer-events-none">
             {/* Badge moved here if needed or keep original absolute */}
        </div>

        <div className="absolute bottom-3 left-3 z-[2] pr-4">
          <p className="text-[10px] text-accent font-mono uppercase tracking-wider mb-0.5">{item.type}</p>
          <h3 className="text-white font-bold text-sm truncate">{item.name}</h3>
        </div>
      </div>
      <div className="p-3 flex justify-between items-center text-xs font-mono text-secondary bg-surface">
        <span className="flex items-center gap-1"><i className="fa-solid fa-location-arrow"></i> {item.dist}</span>
        <div className="flex gap-2">
            <span className="flex items-center gap-1 text-primary"><i className="fa-solid fa-user-group"></i> {item.visitors}</span>
        </div>
      </div>
    </div>
  );
};

/* --- WALK CARD --- */
interface WalkCardProps {
  walk: Walk;
  onSelect: (walk: Walk) => void;
  onEdit?: (id: string | number) => void;
  isActiveQuest?: boolean;
  isPaused?: boolean;
}

export const WalkCard = ({ walk, onSelect, onEdit, isActiveQuest, isPaused }: WalkCardProps) => (
  <div 
    onClick={() => onSelect(walk)}
    className={`group p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
        isActiveQuest 
        ? 'bg-accent/10 border-accent shadow-[0_0_20px_rgba(var(--c-accent),0.2)]' 
        : isPaused
        ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
        : 'bg-surface border-divider/10 hover:border-accent'
    }`}
  >
    {isActiveQuest && (
        <div className="absolute top-0 right-0 p-2">
            <div className="flex items-center gap-1.5 animate-pulse">
                 <div className="w-2 h-2 rounded-full bg-accent"></div>
                 <span className="text-[9px] font-black text-accent tracking-widest uppercase">ACTIVE UPLINK</span>
            </div>
        </div>
    )}

    {isPaused && (
        <div className="absolute top-0 right-0 p-2">
            <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse-slow"></div>
                 <span className="text-[9px] font-black text-orange-500 tracking-widest uppercase">MISSION PAUSED</span>
            </div>
        </div>
    )}

    <div className="flex justify-between items-start mb-2 relative z-10">
      <h3 className={`font-bold text-lg ${isActiveQuest ? 'text-accent' : isPaused ? 'text-orange-500' : 'text-primary'}`}>{walk.name}</h3>
      <div className="flex items-center gap-2">
        {onEdit && (
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit(walk.id); }}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-secondary hover:text-white hover:bg-white/10 transition-all shadow-sm"
                title="Edit Mission"
            >
                <i className="fa-solid fa-pen-to-square"></i>
            </button>
        )}
        {!isActiveQuest && !isPaused && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent/20 text-accent uppercase">{walk.difficulty}</span>}
      </div>
    </div>
    <p className={`text-xs mb-4 line-clamp-2 relative z-10 ${isActiveQuest ? 'text-secondary/80' : isPaused ? 'text-orange-200/70' : 'text-secondary'}`}>{walk.desc}</p>
    <div className={`flex items-center justify-between text-xs font-mono relative z-10 ${isActiveQuest ? 'text-accent/80' : isPaused ? 'text-orange-400' : 'text-secondary'}`}>
      <span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i> {walk.estTime}</span>
      <span className="flex items-center gap-1"><i className="fa-solid fa-location-dot"></i> {walk.stopIds.length} Stops</span>
    </div>
  </div>
);

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* --- DRAGGABLE WALK STOP ITEM --- */
interface DraggableWalkStopProps {
  item: DashboardItem;
  count: number;
  isExcluded: boolean;
  isExpanded: boolean;
  isVisited?: boolean;
  onToggle: (id: number | string) => void;
  onClick: () => void;
}

export const DraggableWalkStop = ({ item, count, isExcluded, isExpanded, isVisited, onToggle, onClick }: DraggableWalkStopProps) => {
  const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging // useful for styling
  } = useSortable({ id: item.id });

  const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 1, // Highlight dragged item
      position: 'relative' as const,
  };
  
  // Stats for the "Slider" view (Mock or real if available)
  const xp = (item as any).xp || 500;
  const rating = item.rating;

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        className={`rounded-xl border transition-all bg-surface ${
            isDragging ? 'shadow-2xl scale-105 border-accent rotate-1' : 'border-divider/10 hover:border-divider/30'
        } ${isExcluded ? 'opacity-50' : ''}`}
    >
        {/* HEADER / COMPACT VIEW */}
        <div 
            onClick={onClick}
            className="flex items-center gap-3 p-3 cursor-pointer"
        >
            {/* Drag Handle */}
            <div {...listeners} className="text-secondary hover:text-primary cursor-grab active:cursor-grabbing p-1">
                <i className="fa-solid fa-grip-vertical"></i>
            </div>

            {/* Index Badge */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono border ${isExcluded ? 'bg-canvas text-secondary border-transparent' : 'bg-accent text-black border-white'}`}>
                {count}
            </div>

            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                <img src={item.img} alt={item.name} className={`w-full h-full object-cover ${isExcluded ? 'grayscale' : ''}`} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold truncate ${isExcluded ? 'line-through text-secondary' : 'text-primary'}`}>{item.name}</h4>
                    {isVisited && (
                        <span className="flex items-center gap-1 text-[8px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 tracking-tighter uppercase whitespace-nowrap">
                            <i className="fa-solid fa-circle-check"></i> VISITED
                        </span>
                    )}
                </div>
                <p className="text-[10px] text-secondary truncate">{item.type}</p>
            </div>

            <button 
                onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer z-10 ${isExcluded ? 'text-secondary hover:text-accent' : 'text-accent hover:bg-canvas'}`}
            >
                <i className={`fa-solid ${isExcluded ? 'fa-plus' : 'fa-check'}`}></i>
            </button>
        </div>

        {/* EXPANDED CONTENT ("SLIDER" INFO) */}
        {isExpanded && !isExcluded && (
            <div className="px-3 pb-3 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-canvas/50 rounded-lg p-3 border border-divider/10 space-y-3">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-surface rounded p-1.5 border border-divider/5">
                            <div className="text-[9px] text-secondary font-mono uppercase">RATING</div>
                            <div className="text-xs font-bold text-primary"><i className="fa-solid fa-star text-yellow-500 mr-1"></i>{rating}</div>
                        </div>
                        <div className="bg-surface rounded p-1.5 border border-divider/5">
                            <div className="text-[9px] text-secondary font-mono uppercase">VISITORS</div>
                            <div className="text-xs font-bold text-primary">{item.visitors}</div>
                        </div>
                        <div className="bg-surface rounded p-1.5 border border-divider/5">
                            <div className="text-[9px] text-secondary font-mono uppercase">REWARD</div>
                            <div className="text-xs font-bold text-accent">+{xp} XP</div>
                        </div>
                    </div>

                    {/* Description Mock */}
                    <p className="text-[10px] text-secondary leading-relaxed line-clamp-2">
                        Experience the vibrant energy of {item.name}. A key location in the {item.type} sector known for its high data yield and neon aesthetics.
                    </p>

                    {/* Action Button */}
                    <Link href={`/experience/${item.id}`} className="w-full">
                        <button className="w-full py-2 bg-primary text-canvas text-xs font-bold rounded hover:bg-accent hover:text-black transition-colors flex items-center justify-center gap-2">
                            <span>SEE FULL EXPERIENCE</span>
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </Link>
                </div>
            </div>
        )}
    </div>
  );
};
