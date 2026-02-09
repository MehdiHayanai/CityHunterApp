'use client';

import { ReactNode } from 'react';

interface WalkEditorLayoutProps {
    map: React.ReactNode;
    children: React.ReactNode;
    isMapHidden?: boolean;
    mapTools?: React.ReactNode;
    headerTools?: React.ReactNode;
}

export default function WalkEditorLayout({ map, children, isMapHidden = false, mapTools, headerTools }: WalkEditorLayoutProps) {
    return (
        <div className="w-full h-[85vh] max-w-7xl mx-auto flex bg-surface/30 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden relative ring-1 ring-white/5">
            {/* Map Panel & Overlay Controls */}
            <div className={`relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isMapHidden ? 'w-0 opacity-0 invisible' : 'w-[45%] opacity-100 visible border-r border-white/5'}`}>
                <div className="absolute inset-0 z-10">
                    {map}
                </div>

                {/* Top-Left Map Tools (EXPAND/SHOW) */}
                {!isMapHidden && mapTools && (
                    <div className="absolute top-6 left-6 z-[400] animate-in fade-in slide-in-from-left-4 duration-500">
                        {mapTools}
                    </div>
                )}
                
                {/* Map Overlay Badge - BOTTOM LEFT */}
                {!isMapHidden && (
                    <div className="absolute bottom-6 left-6 z-[400] bg-surface/90 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                        <span className="font-bold text-[10px] text-white uppercase tracking-wider">LIVE MAPPING</span>
                    </div>
                )}
            </div>

            {/* RIGHT: Editor Content */}
            <div className={`w-full flex flex-col bg-surface/60 backdrop-blur-xl relative transition-all duration-500 ${isMapHidden ? 'md:w-full' : 'md:w-1/2'}`}>
                {/* Top Guideline */}
                <div className="h-1 w-full bg-divider/10 relative overflow-hidden">
                     <div className="absolute top-0 left-0 h-full bg-accent w-1/3 shadow-[0_0_10px_rgba(204,255,0,0.5)]"></div>
                </div>

                {/* Header Tools (Persistent Toggle) */}
                {headerTools && (
                    <div className="absolute top-10 left-10 z-[50] flex items-center gap-3">
                        {headerTools}
                    </div>
                )}

                {/* Content Area */}
                <div className={`flex-1 overflow-hidden relative ${headerTools ? 'pt-16' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}
