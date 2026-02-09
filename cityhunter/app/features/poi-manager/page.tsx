'use client';

import { useState } from 'react';
import DashboardNavbar from '@/app/components/DashboardNavbar';
import PoiWizard from './components/wizard/PoiWizard';

export default function PoiManagerPage() {
  const [activeTab, setActiveTab] = useState('Monument');

  return (
    <div className="min-h-screen bg-canvas text-primary relative overflow-hidden flex flex-col font-sans">
      {/* Background Grids/Gradients */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none"></div>

      <DashboardNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container mx-auto py-8 px-4 relative z-10 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl">
            {/* Header section */}
            <div className="text-center mb-8 animate-on-scroll is-visible">
                <h1 className="text-4xl font-extrabold mb-2 text-gradient tracking-tight">
                    New POI
                </h1>
                <p className="text-secondary text-sm max-w-xl mx-auto">
                    Add a landmark or event to the map.
                </p>
            </div>
            
            {/* Replaced old card with Wizard (which is its own card) */}
            <div className="animate-on-scroll is-visible delay-100">
                 <PoiWizard />
            </div>
        </div>
      </main>
    </div>
  );
}
