"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { DashboardItem, Walk } from "../../interfaces/dashboard";
import { useThemeContext } from "../../context/ThemeContext";
import { useDashboardContext } from "../../context/DashboardContext";

interface LeafletMapProps {
  items: DashboardItem[];
  selectedId: number | string | null;
  walkPath?: DashboardItem[]; // If present, draw line
  isCreatingWalk?: boolean;
  onAddToWalk?: (id: number | string) => void;
  addedStopIds?: (number | string)[];
}

export default function LeafletMap({ items, selectedId, walkPath, isCreatingWalk, onAddToWalk, addedStopIds = [] }: LeafletMapProps) {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  useEffect(() => {
    // 1. Init Map
    if (!mapInstance.current && mapContainer.current) {
      mapInstance.current = L.map(mapContainer.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([48.8566, 2.3522], 13);

      L.control.zoom({ position: 'topright' }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;
    if (!map) return;

    // 2. Tile Layer Logic
    const tileUrl = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    
    // Remove old tiles
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });

    L.tileLayer(tileUrl, { subdomains: 'abcd', maxZoom: 20 }).addTo(map);

    // 3. Markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const createCustomIcon = (mode: 'numbered' | 'dot' | 'explore', numericLabel: number = 0, type: string = 'monument') => {
      // Color Logic
      const isEvent = type === 'event';
      const baseColor = isEvent ? '#A855F7' : (isDark ? '#CCFF00' : '#B4E600'); // Purple for events, Lime for monuments
      const color = baseColor;
      const greyColor = isDark ? '#666' : '#ccc';
      
      let size = 16;
      let bgColor = color;
      let showLabel = false;
      let zIndex = 1;

      if (mode === 'numbered') {
          size = 24;
          showLabel = true;
          zIndex = 100;
          bgColor = color;
      } else if (mode === 'dot') {
          size = 12;
          showLabel = false;
          zIndex = 1;
          bgColor = greyColor;
      } else if (mode === 'explore') {
          size = 18; // Slightly smaller than selected, bigger than dot
          showLabel = false;
          zIndex = 50;
          bgColor = color;
      }

      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          background-color: ${bgColor};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 ${mode === 'numbered' ? '15px' : '0'} ${mode === 'numbered' ? color : 'transparent'};
          animation: ${mode === 'numbered' ? 'pulse 2s infinite' : 'none'};
          display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: black;
          z-index: ${zIndex};
        ">${showLabel ? numericLabel : ''}</div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
      });
    };

    items.forEach((item, idx) => {
      // Logic Update:
      // 1. Path Mode (Creation or Active Walk):
      //    - Selected Items: 'numbered' (1, 2, 3...)
      //    - Unselected Items: 'dot' (small, grey)
      // 2. Explore Mode (Monument/Event Tab):
      //    - All Items: 'explore' (accent color, no number)
      
      const usePathIndexing = isCreatingWalk || (walkPath && walkPath.length > 0);
      
      let mode: 'numbered' | 'dot' | 'explore' = 'explore';
      let label = 0;

      if (usePathIndexing) {
          let pathIndex = -1;
          if (walkPath) {
              pathIndex = walkPath.findIndex(p => p.id === item.id);
          }
          
          if (pathIndex !== -1) {
              mode = 'numbered';
              label = pathIndex + 1;
          } else {
              mode = 'dot';
          }
      } else {
          mode = 'explore';
      }

      const marker = L.marker([item.lat, item.lng], { icon: createCustomIcon(mode, label, item.type) })
        .addTo(map);
      
      (marker as any).monumentId = item.id;

      // Popup Content
      const rewardHTML = item.xp 
         ? `<div style="color: var(--color-accent); font-weight: bold; font-family: 'Roboto Mono'; font-size: 12px;">+${item.xp} XP</div>`
         : `<div style="color: #c084fc; font-weight: bold; font-family: 'Roboto Mono'; font-size: 11px; display: flex; align-items: center; gap: 4px; justify-content: flex-end;"><i class="fa-solid fa-medal"></i> ${item.swagg}</div>`;

      // Use a BUTTON with a class instead of <a href> to avoid full page reload
      const popupContent = `
         <div style="font-family: 'Inter', sans-serif;">
             <div style="height: 120px; width: 100%; position: relative; overflow: hidden; border-bottom: 1px solid var(--color-accent);">
                 <img src="${item.img}" style="width: 100%; height: 100%; object-fit: cover;" alt="${item.name}">
                 <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 10px;">
                     <span style="background-color: var(--color-accent); color: black; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-family: 'Roboto Mono'; text-transform: uppercase;">${item.type}</span>
                 </div>
             </div>
             <div style="padding: 16px; background-color: var(--color-surface);">
                 <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                     <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--color-primary); line-height: 1.2;">${item.name}</h3>
                     <div style="text-align: right;">${rewardHTML}</div>
                 </div>
                 <div style="font-family: 'Roboto Mono'; font-size: 10px; color: var(--color-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 4px;">
                     <i class="fa-solid fa-location-crosshairs"></i> ${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}
                 </div>
                 <div style="background-color: var(--color-canvas); padding: 8px 10px; border-radius: 8px; border: 1px solid var(--color-accent); margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                     <div style="font-size: 11px; color: var(--color-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">
                         <i class="fa-solid fa-map-pin" style="margin-right: 4px;"></i> ${item.address}
                     </div>
                     <button id="copy-btn-${item.id}" onclick="navigator.clipboard.writeText('${item.address}')" style="background: none; border: none; cursor: pointer; color: var(--color-primary); padding: 4px; transition: color 0.2s;"><i class="fa-regular fa-copy"></i></button>
                 </div>
                 <div style="margin-top: 8px;">
                    ${isCreatingWalk 
                        ? (() => {
                            const isAdded = addedStopIds.includes(item.id);
                            return `
                                <button class="add-to-walk-trigger" data-id="${item.id}" ${isAdded ? 'disabled' : ''} style="display: block; width: 100%; text-align: center; background-color: ${isAdded ? '#4ade80' : 'var(--color-accent)'}; color: black; font-weight: bold; font-size: 12px; padding: 8px 0; border-radius: 6px; text-decoration: none; font-family: 'Roboto Mono'; transition: background-color 0.2s; border: none; cursor: ${isAdded ? 'default' : 'pointer'}; opacity: ${isAdded ? '0.7' : '1'};">
                                    ${isAdded ? '<i class="fa-solid fa-check"></i> ADDED' : '<i class="fa-solid fa-plus"></i> ADD TO ROUTE'}
                                </button>
                            `;
                        })()
                        : `<button class="explore-trigger" data-id="${item.id}" style="display: block; width: 100%; text-align: center; background-color: var(--color-accent); color: black; font-weight: bold; font-size: 12px; padding: 8px 0; border-radius: 6px; text-decoration: none; font-family: 'Roboto Mono'; transition: background-color 0.2s; border: none; cursor: pointer;">
                            EXPLORE <i class="fa-solid fa-arrow-right" style="margin-left: 4px;"></i>
                           </button>`
                    }
                 </div>
             </div>
         </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300, minWidth: 280, className: 'custom-popup-theme' });
      markersRef.current.push(marker);
    });

    // 4. Polylines
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (walkPath && walkPath.length > 1) {
      console.log("[DEBUG] Rendering Walk Line for stops:", walkPath.map(p => p.name));
      const latLngs = walkPath.map(item => [item.lat, item.lng] as [number, number]);
      polylineRef.current = L.polyline(latLngs, {
        color: isDark ? '#CCFF00' : '#B4E600',
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round'
      }).addTo(map);
      
      map.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
    }

    // 5. Global Listener for Popup Buttons (React Router Integration)
    const handlePopupClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        
        // Explore Button
        const exploreBtn = target.closest('.explore-trigger');
        if (exploreBtn) {
           const id = exploreBtn.getAttribute('data-id');
           if (id) {
               router.push(`/experience/${id}`);
           }
        }

        // Add to Walk Button
        const addBtn = target.closest('.add-to-walk-trigger');
        if (addBtn && onAddToWalk) {
            const id = addBtn.getAttribute('data-id');
            if (id) {
                // If it looks like a pure number, cast it? Or just pass as string?
                // Backend uses string UUIDs. Frontend mocks use numbers.
                // Best strategy: check if it's a valid number.
                const isNum = /^\d+$/.test(id);
                onAddToWalk(isNum ? Number(id) : id);
                // Optional: Force popup update or close? 
                // We rely on React re-rendering and the 'useEffect' to update markers/popups. 
                // But Leaflet markers don't auto-update popup content unless we re-bind.
                // The main useEffect depends on 'addedStopIds', so it should re-run and update the popup HTML.
            }
        }
    };

    const container = mapContainer.current;
    if (container) {
        container.addEventListener('click', handlePopupClick);
    }

    return () => {
        if (container) {
            container.removeEventListener('click', handlePopupClick);
        }
    };

  }, [isDark, items, walkPath, router, isCreatingWalk, addedStopIds, onAddToWalk]);

  // --- QUEST MODE VISUALIZATION ---
  const { questState, activeWalk, excludedStopIds } = useDashboardContext();
  const userMarkerRef = useRef<L.Marker | null>(null);
  const guidanceLineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
      if (!mapInstance.current) return;
      const map = mapInstance.current;

      // 1. User Marker
      if (questState.userLocation) {
          const { lat, lng } = questState.userLocation;
          
          if (!userMarkerRef.current) {
              const userIcon = L.divIcon({
                  className: 'user-location-icon',
                  html: `<div style="
                      background-color: #3b82f6;
                      width: 20px; height: 20px;
                      border-radius: 50%;
                      border: 3px solid white;
                      box-shadow: 0 0 20px #3b82f6;
                      animation: pulse 1.5s infinite;
                  "></div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
              });
              userMarkerRef.current = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
          } else {
              userMarkerRef.current.setLatLng([lat, lng]);
          }

          // 2. Guidance Line (User -> Next Stop)
          if (questState.isActive && activeWalk && !questState.showCompletionModal) {
               const validStopIds = activeWalk.stopIds.filter(id => !excludedStopIds.includes(id));
               const targetId = validStopIds[questState.currentStopIndex];
               const targetStop = items.find(i => i.id === targetId);

               if (guidanceLineRef.current) {
                   map.removeLayer(guidanceLineRef.current);
                   guidanceLineRef.current = null;
               }

               if (targetStop) {
                   guidanceLineRef.current = L.polyline([[lat, lng], [targetStop.lat, targetStop.lng]], {
                       color: '#3b82f6',
                       weight: 4,
                       opacity: 0.6,
                       dashArray: '5, 10',
                       className: 'animate-dash' // ensure CSS exists or remove
                   }).addTo(map);
               } else {
                   // Cleanup if no target (finished or invalid)
                   if (guidanceLineRef.current) {
                       map.removeLayer(guidanceLineRef.current);
                       guidanceLineRef.current = null;
                   }
               }
          } else {
               // Cleanup if not active or complete
               if (guidanceLineRef.current) {
                   map.removeLayer(guidanceLineRef.current);
                   guidanceLineRef.current = null;
               }
          }

      } else {
          // Remove if location lost
           if (userMarkerRef.current) {
              map.removeLayer(userMarkerRef.current);
              userMarkerRef.current = null;
          }
          if (guidanceLineRef.current) {
              map.removeLayer(guidanceLineRef.current);
              guidanceLineRef.current = null;
           }
      }

  }, [questState.userLocation, questState.isActive, activeWalk, questState.currentStopIndex, items, excludedStopIds, questState.showCompletionModal]); 
  // --- END QUEST MODE ---


  // Handle Selection / FlyTo
  useEffect(() => {
    if (selectedId && mapInstance.current) {
        const item = items.find(i => i.id === selectedId);
        if (item) {
            // STRICTLY DISABLE FLYTO ON MOBILE per user request
            if (window.innerWidth >= 768) {
                mapInstance.current.flyTo([item.lat, item.lng], 16, { 
                    animate: true, 
                    duration: 1.5,
                    easeLinearity: 0.25
                });
            }
            setTimeout(() => {
                 const marker = markersRef.current.find(m => (m as any).monumentId === selectedId);
                 if (marker) marker.openPopup();
            }, 500);
        }
    }
  }, [selectedId, items]);

  // --- SEARCH AREA & MAP EVENTS ---
  const { fetchPoisForLocation, isLoading } = useDashboardContext();
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const onMoveEnd = () => {
        const center = map.getCenter();
        setMapCenter({ lat: center.lat, lng: center.lng });
        setHasMoved(true);
    };

    map.on('moveend', onMoveEnd);
    return () => { map.off('moveend', onMoveEnd); };
  }, [mapInstance.current]); // Re-bind if instance changes (rare)

  const handleSearchArea = () => {
      const map = mapInstance.current;
      if (map && mapCenter) {
          // Calculate radius based on visible bounds
          const bounds = map.getBounds();
          const northEast = bounds.getNorthEast();
          const center = map.getCenter();
          // Get distance in meters
          const radiusMeters = map.distance(center, northEast);
          
          console.log(`[SEARCH] Radius calculated from view: ${Math.round(radiusMeters)}m`);
          
          fetchPoisForLocation(mapCenter.lat, mapCenter.lng, Math.round(radiusMeters));
          setHasMoved(false); // Reset button state
      }
  };

  return (
    <div className="relative w-full h-full">
        <div ref={mapContainer} className="w-full h-full z-0" />
        
        {/* Search This Area Button */}
        {hasMoved && !isLoading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400]">
                <button 
                    onClick={handleSearchArea}
                    className="flex items-center gap-2 px-4 py-2 bg-surface/90 backdrop-blur-md border border-divider/10 rounded-full shadow-lg text-sm font-bold text-primary hover:bg-surface hover:scale-105 transition-all animate-in fade-in slide-in-from-top-4"
                >
                    <i className="fa-solid fa-arrow-rotate-right text-accent"></i>
                    Search This Area
                </button>
            </div>
        )}
        
        {/* Loading Overlay (Optional, consistent with dashboard loader) */}
        {isLoading && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400]">
                <div className="flex items-center gap-2 px-4 py-2 bg-surface/90 backdrop-blur-md border border-divider/10 rounded-full shadow-lg text-sm font-bold text-primary">
                    <div className="w-4 h-4 rounded-full border-2 border-divider/10 border-t-accent animate-spin"></div>
                    Searching...
                </div>
            </div>
        )}
    </div>
  );
}
