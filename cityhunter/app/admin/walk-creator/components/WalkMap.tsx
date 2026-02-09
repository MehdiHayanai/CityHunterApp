'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { POI, POIService } from '@/app/services/poi';

interface WalkMapProps {
    selectedStops: POI[];
    availablePois: POI[];
    onPoisFetched: (pois: POI[]) => void;
    onSelect?: (poi: POI) => void;
}

declare global {
    interface Window {
        onAddToPool: (id: string) => void;
    }
}

export default function WalkMap({ selectedStops, availablePois, onPoisFetched, onSelect }: WalkMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const polylineRef = useRef<L.Polyline | null>(null);
    
    // Search State
    const [hasMoved, setHasMoved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchCenter, setSearchCenter] = useState<{lat: number, lng: number} | null>(null);

    // Bind Global Action for Popups
    useEffect(() => {
        window.onAddToPool = (id: string) => {
            const poi = availablePois.find(p => p.id === id) || selectedStops.find(p => p.id === id);
            if (poi && onSelect) {
                onSelect(poi);
            }
        };
    }, [availablePois, selectedStops, onSelect]);

    // Initialize Map
    useEffect(() => {
        if (!mapInstance.current && mapContainer.current) {
            const map = L.map(mapContainer.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([48.8566, 2.3522], 13);
            
            L.control.zoom({ position: 'topright' }).addTo(map);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            mapInstance.current = map;

            // Movement Listener
            map.on('moveend', () => {
                const center = map.getCenter();
                setSearchCenter({ lat: center.lat, lng: center.lng });
                setHasMoved(true);
            });
        }
    }, []);

    // Handle "Search This Area"
    const handleSearchArea = async () => {
        const map = mapInstance.current;
        if (map && searchCenter) {
             setIsLoading(true);
             try {
                // Calculate radius based on visible bounds
                const bounds = map.getBounds();
                const northEast = bounds.getNorthEast();
                const center = map.getCenter();
                const radiusMeters = map.distance(center, northEast);
                const radius = Math.round(radiusMeters); // Dynamic Radius

                console.log(`[WalkMap] Searching radius: ${radius}m at [${searchCenter.lat}, ${searchCenter.lng}]`);
                
                // Fetch both types
                const [monuments, events] = await Promise.all([
                     POIService.getPois('monument', searchCenter.lat, searchCenter.lng, radius).catch(() => []),
                     POIService.getPois('event', searchCenter.lat, searchCenter.lng, radius).catch(() => [])
                ]);

                // Combine results
                const rawPois = [...monuments, ...events];
                const newPois = rawPois.map(POIService.transformToFrontendPOI);
                
                onPoisFetched(newPois);
                setHasMoved(false);

             } catch (e) {
                 console.error("Failed to search area:", e);
             } finally {
                 setIsLoading(false);
             }
        }
    };

    // Update Markers
    // Group POIs by location for collision handling
    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        // Clear existing
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Build Map Groups
        const groupedPois = new Map<string, { available: POI[], selected: Array<{poi: POI, index: number}> }>();

        // Phase A: Selected
        selectedStops.forEach((poi, index) => {
             // Skip POIs without valid location
             if (!poi.location || typeof poi.location.lat !== 'number' || typeof poi.location.lng !== 'number') {
                 console.warn(`Skipping POI without valid location:`, poi);
                 return;
             }
             const key = `${poi.location.lat.toFixed(5)},${poi.location.lng.toFixed(5)}`;
             if (!groupedPois.has(key)) groupedPois.set(key, { available: [], selected: [] });
             groupedPois.get(key)!.selected.push({ poi, index });
        });

        // Phase B: Available (KEEP duplicates allowed)
        availablePois.forEach(poi => {
             // Skip POIs without valid location
             if (!poi.location || typeof poi.location.lat !== 'number' || typeof poi.location.lng !== 'number') {
                 console.warn(`Skipping POI without valid location:`, poi);
                 return;
             }
             const key = `${poi.location.lat.toFixed(5)},${poi.location.lng.toFixed(5)}`;
             if (!groupedPois.has(key)) groupedPois.set(key, { available: [], selected: [] });
             groupedPois.get(key)!.available.push(poi);
        });

        // Helper: Create HTML for a Single Item Popup
        const createItemPopupHTML = (item: POI, index?: number, isSelected: boolean = false) => {
             const type = (item as any).tags?.[0] || ((item as any).start_time ? 'event' : 'monument');
             const img = item.images?.[0] || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34.jpg';
             
             return `
                  <div style="font-family: 'Inter', sans-serif; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 12px; border-radius: 12px; overflow: hidden; background-color: #121212;">
                      <div style="height: 100px; width: 100%; position: relative; overflow: hidden; border-bottom: 1px solid #CCFF00;">
                          <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;" alt="${item.name}">
                          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 8px;">
                              <span style="background-color: ${isSelected ? '#CCFF00' : '#A855F7'}; color: black; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-family: 'Roboto Mono'; text-transform: uppercase;">
                                  ${isSelected ? `#${index! + 1} ` : ''}${type}
                              </span>
                          </div>
                      </div>
                      <div style="padding: 12px; background-color: #121212;">
                          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: white; line-height: 1.2;">${item.name}</h3>
                          <div style="font-family: 'Roboto Mono'; font-size: 10px; color: #9ca3af; margin-bottom: 10px;">
                              <i class="fa-solid fa-location-dot"></i> ${item.location?.lat?.toFixed(4) || 'N/A'}, ${item.location?.lng?.toFixed(4) || 'N/A'}
                          </div>
                          <button 
                            onclick="window.onAddToPool('${item.id}')"
                            style="width: 100%; padding: 8px; background-color: #CCFF00; border: none; border-radius: 6px; color: black; font-weight: bold; font-size: 10px; cursor: pointer; text-transform: uppercase; tracking: 0.1em;"
                          >
                            <i class="fa-solid fa-plus"></i> Add to Pool
                          </button>
                      </div>
                  </div>
             `;
        };

        // Render Groups
        groupedPois.forEach((group, key) => {
             const { available, selected } = group;
             if (available.length === 0 && selected.length === 0) return;

             // 1. Render Unique Selected Markers (only show the first one if multiple visits at same spot)
             if (selected.length > 0) {
                 const { poi, index } = selected[0]; // Just show first visit visually at spot
                 const type = (poi as any).tags?.[0] || ((poi as any).start_time ? 'event' : 'monument');
                 const isEvent = type === 'event';
                 const color = isEvent ? '#A855F7' : '#CCFF00';

                 const icon = L.divIcon({
                     className: 'custom-map-icon',
                     html: `<div style="
                        background-color: ${color};
                        width: 24px; height: 24px;
                        border-radius: 50%;
                        border: 2px solid white;
                        color: black;
                        display: flex; align-items: center; justify-content: center;
                        font-weight: bold; font-size: 10px;
                        box-shadow: 0 0 10px ${color};
                     ">${index + 1}</div>`,
                     iconSize: [24, 24],
                     iconAnchor: [12, 12],
                     popupAnchor: [0, -12]
                 });

                 const marker = L.marker([poi.location.lat, poi.location.lng], {
                     icon,
                     zIndexOffset: 0
                 }).addTo(map);

                 const popupContent = `
                     <div style="max-height: 350px; overflow-y: auto; padding-right: 5px;" class="custom-scrollbar"> 
                        <h4 style="color: #9ca3af; font-size: 9px; text-transform: uppercase; tracking: 0.2em; margin-bottom: 10px;">Assets at this Sector</h4>
                        ${selected.map(s => createItemPopupHTML(s.poi, s.index, true)).join('')}
                        ${available.map(a => createItemPopupHTML(a, 0, false)).join('')}
                     </div>
                 `;

                 marker.bindPopup(popupContent, { maxWidth: 300, minWidth: 280, className: 'custom-popup-theme' });
                 markersRef.current.push(marker);
             } else if (available.length > 0) {
                 // 2. Render Available Marker only if NO selected items here
                 const poi = available[0];
                 const type = (poi as any).tags?.[0] || ((poi as any).start_time ? 'event' : 'monument');
                 const isEvent = type === 'event';
                 const color = isEvent ? '#A855F7' : '#CCFF00';

                 const icon = L.divIcon({
                     className: 'custom-map-icon',
                     html: `<div style="
                        background-color: ${color};
                        width: 12px; height: 12px;
                        border-radius: 50%;
                        border: 2px solid white;
                        opacity: 0.9;
                        box-shadow: 0 0 8px ${color};
                     "></div>`,
                     iconSize: [12, 12],
                     iconAnchor: [6, 6],
                     popupAnchor: [0, -6]
                 });

                 const marker = L.marker([poi.location.lat, poi.location.lng], {
                     icon,
                     zIndexOffset: 1000
                 }).addTo(map);

                 const popupContent = `
                     <div style="max-height: 350px; overflow-y: auto; padding-right: 5px;" class="custom-scrollbar"> 
                        <h4 style="color: #9ca3af; font-size: 9px; text-transform: uppercase; tracking: 0.2em; margin-bottom: 10px; font-family: 'Roboto Mono';">Available Intelligence</h4>
                        ${available.map(a => createItemPopupHTML(a, 0, false)).join('')}
                     </div>
                 `;

                 marker.bindPopup(popupContent, { maxWidth: 300, minWidth: 280, className: 'custom-popup-theme' });
                 markersRef.current.push(marker);
             }
        });


        // Draw Polyline
        if (polylineRef.current) {
            polylineRef.current.remove();
            polylineRef.current = null;
        }

        if (selectedStops.length > 1) {
            // Filter out stops without valid location before drawing polyline
            const validStops = selectedStops.filter(s => 
                s.location && typeof s.location.lat === 'number' && typeof s.location.lng === 'number'
            );
            
            if (validStops.length > 1) {
                const latlngs = validStops.map(s => [s.location.lat, s.location.lng] as [number, number]);
                polylineRef.current = L.polyline(latlngs, {
                    color: '#CCFF00',
                    weight: 3,
                    dashArray: '5, 10',
                    opacity: 0.7
                }).addTo(map);
            }
        }

    }, [availablePois, selectedStops]);

    return (
        <div className="w-full h-full relative group">
            <div ref={mapContainer} className="w-full h-full bg-surface/50" />
            
            {/* Search Button */}
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

             {isLoading && (
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400]">
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface/90 backdrop-blur-md border border-divider/10 rounded-full shadow-lg text-sm font-bold text-primary">
                        <div className="w-4 h-4 rounded-full border-2 border-divider/10 border-t-accent animate-spin"></div>
                        Scanning Sector...
                    </div>
                </div>
            )}
        </div>
    );
}
