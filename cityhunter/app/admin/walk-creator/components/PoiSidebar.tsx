'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { POIBase } from '@/app/services/poi';

interface PoiSidebarProps {
  pois: POIBase[];
  onSelect?: (poi: POIBase) => void;
  selectedIds?: string[];
  className?: string;
  title?: string;
}

function DraggablePoi({ poi, onSelect, isSelected }: { poi: POIBase, onSelect?: (poi: POIBase) => void, isSelected?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-${poi.id || poi.name}`, 
    data: { 
      type: 'POI', 
      poi,
      origin: 'sidebar' 
    },
    disabled: !!onSelect // Disable drag if selection mode
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };
  
  const handleSelect = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onSelect) onSelect(poi);
  };

  return (
    <div
      ref={onSelect ? undefined : setNodeRef} // Only attach drag ref if not in select mode
      style={style}
      {...(!onSelect ? listeners : {})} // Only attach drag listeners if not in select mode
      {...(!onSelect ? attributes : {})}
      className={`spotlight-card group bg-surface border border-white/5 p-3 mb-3 rounded-xl transition-all shadow-sm hover:shadow-md ${onSelect ? '' : 'cursor-grab active:cursor-grabbing hover:border-accent/50'} hover:border-accent/50`}
    >
      <div className="flex items-center gap-3 relative z-10">
        {/* Thumbnail placeholder */}
        <div className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center text-xs text-white/40 overflow-hidden border border-white/5">
           {poi.images?.[0] ? (
             <img src={poi.images[0]} alt={poi.name} className="w-full h-full object-cover" />
           ) : 'IMG'}
        </div>
        <div className="flex-1 min-w-0">
           <h4 className="font-bold text-sm text-white truncate group-hover:text-accent transition-colors">{poi.name}</h4>
           <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-xs bg-white/10 border-none text-white/60 font-mono text-[10px] px-2 py-0.5 rounded-full">
                    {poi.location.lat.toFixed(3)}, {poi.location.lng.toFixed(3)}
                </span>
           </div>
        </div>
        <div className="text-white/20 group-hover:text-white/60">
            {onSelect ? (
                 <button 
                    onClick={handleSelect}
                    className="btn btn-xs btn-accent w-8 h-8 rounded-full p-0 flex items-center justify-center"
                 >
                    <i className="fa-solid fa-plus"></i>
                 </button>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            )}
        </div>
      </div>
    </div>
  );
}

export default function PoiSidebar({ pois, onSelect, selectedIds = [], className = "", title }: PoiSidebarProps) {
  const [search, setSearch] = useState('');

  const filteredPois = pois.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`flex flex-col bg-surface/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden ${className}`}>
      <div className="p-5 border-b border-white/5 bg-black/20 space-y-4">
        {title && (
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-[10px] text-white flex items-center gap-2 uppercase tracking-[0.2em]">
                  <i className="fa-solid fa-database text-accent"></i> {title}
              </h3>
              <span className="badge badge-xs bg-white/10 text-accent font-mono border-none">{filteredPois.length}</span>
          </div>
        )}
        <div className="relative">
            <input 
            type="text" 
            placeholder="Search operational database..." 
            className="input input-sm bg-black/40 border-white/10 w-full text-white focus:border-accent pl-10 h-10 rounded-xl text-xs font-mono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
            <i className="fa-solid fa-search text-accent absolute left-4 top-3.5 text-xs"></i>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-[220px] max-h-[350px]">
        {filteredPois.map(poi => (
          <DraggablePoi 
            key={poi.id || poi.name} 
            poi={poi} 
            onSelect={onSelect}
            isSelected={selectedIds.includes(poi.id || poi.name)}
          /> 
        ))}
        {filteredPois.length === 0 && (
          <div className="text-center py-8">
              <p className="text-xs text-secondary italic">No assets found matching query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
