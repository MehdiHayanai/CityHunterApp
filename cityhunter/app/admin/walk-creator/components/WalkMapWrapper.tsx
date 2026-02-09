'use client';

import dynamic from 'next/dynamic';
import { POI } from '@/app/services/poi';

// Dynamically load the actual Map component
// This ensures Leaflet (which needs window) is not loaded on server
const WalkMap = dynamic(() => import('./WalkMap'), { 
    ssr: false, 
    loading: () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 text-secondary gap-3">
             <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
             <p className="text-xs font-mono tracking-widest">INITIALIZING SAT-UPLINK...</p>
        </div>
    )
});

interface WalkMapWrapperProps {
    selectedStops: POI[];
    availablePois: POI[];
    onPoisFetched: (pois: POI[]) => void;
    onSelect?: (poi: POI) => void;
}

export default function WalkMapWrapper({ selectedStops, availablePois, onPoisFetched, onSelect }: WalkMapWrapperProps) {
    return <WalkMap selectedStops={selectedStops} availablePois={availablePois} onPoisFetched={onPoisFetched} onSelect={onSelect} />;
}
