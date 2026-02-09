'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

interface MapPickerProps {
    value: { lat: number; lng: number } | null;
    onChange: (val: { lat: number; lng: number }) => void;
}


// Custom hook/component for "Locate Me"
function LocateControl({ onFound, onError }: { onFound: (latlng: L.LatLng) => void, onError: (msg: string) => void }) {
    const map = useMap();
    const [loading, setLoading] = useState(false);

    const handleLocate = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent map click
        setLoading(true);
        map.locate().on("locationfound", function (e) {
            onFound(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
            setLoading(false);
        }).on("locationerror", function (e) {
            console.error(e);
            onError("Unable to acquire satellite lock. Please enable location services.");
            setLoading(false);
        });
    };

    return (
        <div className="leaflet-top leaflet-right" style={{ marginTop: '80px' }}> {/* Positioned below zoom control */}
            <div className="leaflet-control leaflet-bar">
                <a 
                    href="#" 
                    onClick={handleLocate}
                    className={`flex items-center justify-center bg-white hover:bg-gray-100 text-black w-[30px] h-[30px] ${loading ? 'animate-pulse' : ''}`}
                    title="Use my location"
                >
                    {loading ? (
                         <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                    ) : (
                         <i className="fa-solid fa-crosshairs"></i>
                    )}
                </a>
            </div>
        </div>
    );
}

function LocationMarker({ value, onChange }: MapPickerProps) {
    const map = useMapEvents({
        click(e) {
            onChange(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
       if (value) {
           map.flyTo(value, map.getZoom(), { animate: true });
       } 
    }, [value, map]);

    return value === null ? null : (
        <Marker position={value} icon={defaultIcon}></Marker>
    );
}

export default function MapPicker({ value, onChange, onError }: MapPickerProps & { onError?: (msg: string) => void }) {
    const center = value || { lat: 48.8566, lng: 2.3522 };

    return (
        <div className="h-full w-full z-0 bg-surface relative"> 
             <MapContainer 
                center={center} 
                zoom={13} 
                scrollWheelZoom={true} 
                className="h-full w-full outline-none"
                zoomControl={false} // Disable default top-left
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {/* Custom Controls */}
                <ZoomControl position="topright" />
                <LocateControl 
                    onFound={(latlng) => onChange({ lat: latlng.lat, lng: latlng.lng })} 
                    onError={(msg) => onError && onError(msg)}
                />
                
                <LocationMarker value={value} onChange={onChange} />
            </MapContainer>
        </div>
    );
}
