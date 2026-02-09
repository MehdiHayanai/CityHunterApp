
import { POIType } from '@/app/services/poi';
import { useState } from 'react';

interface StepDetailsProps {
    type: POIType;
    architecturalStyle: string;
    setArchitecturalStyle: (s: string) => void;
    startTime: string;
    setStartTime: (s: string) => void;
    endTime: string;
    setEndTime: (s: string) => void;
    ticketLink: string;
    setTicketLink: (s: string) => void;
}

// Predefined tabs for simpler selection
const STYLE_TAGS = [
    "Gothic", "Renaissance", "Baroque", "Neoclassical", 
    "Modern", "Brutalist", "Art Deco", "Contemporary", 
    "Romanesque", "Industrial", "Futuristic", "Traditional"
];

const EVENT_TAGS = [
    "Music", "Art", "Food", "Workshop", 
    "Festival", "Meetup", "Sports", "Theatre", 
    "Tech", "Party", "Educational", "Charity"
];

export default function StepDetails({ 
    type, 
    architecturalStyle, setArchitecturalStyle,
    startTime, setStartTime,
    endTime, setEndTime,
    ticketLink, setTicketLink
}: StepDetailsProps) {

    // Helper for tag selection (multi-select)
    const handleTagSelect = (tag: string) => {
        const currentTags = architecturalStyle ? architecturalStyle.split(',').map(t => t.trim()).filter(Boolean) : [];
        if (currentTags.includes(tag)) {
            setArchitecturalStyle(currentTags.filter(t => t !== tag).join(', '));
        } else {
            setArchitecturalStyle([...currentTags, tag].join(', '));
        }
    };
    
    return (
        <div className="space-y-8">
            {type === 'monument' ? (
                <div className="bg-black/20 p-8 rounded-3xl border border-divider/10">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-divider/10">
                        <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-accent text-2xl shadow-lg shadow-accent/5">
                            🏛️
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Monument Specifications</h4>
                            <p className="text-xs text-secondary font-mono">Define the architectural identity.</p>
                        </div>
                    </div>

                     <div className="form-control group">
                        <label className="label pl-1 mb-4 block">
                            <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] group-hover:text-accent transition-colors">
                                Architectural Style
                            </span>
                        </label>
                        
                        {/* Tag Selection Grid */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {STYLE_TAGS.map(tag => {
                                const isSelected = architecturalStyle.split(',').map(t => t.trim()).includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagSelect(tag)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300 ${
                                            isSelected 
                                            ? 'bg-accent text-black border-accent scale-105 shadow-[0_0_15px_rgba(204,255,0,0.3)]' 
                                            : 'bg-surface/50 text-secondary border-divider/10 hover:border-white/30 hover:text-white hover:bg-surface'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Input fallback */}
                        <div className="relative">
                             <input 
                                type="text" 
                                className="input h-12 px-5 bg-surface/50 border-divider/10 text-white focus:border-accent w-full text-sm font-bold tracking-wide rounded-xl"
                                placeholder="Or type a custom style..."
                                value={architecturalStyle}
                                onChange={(e) => setArchitecturalStyle(e.target.value)}
                            />
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary/30">
                                <i className="fa-solid fa-pen"></i>
                             </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-black/20 p-8 rounded-3xl border border-divider/10 space-y-8">
                    <div className="flex items-center gap-4 mb-2 pb-6 border-b border-divider/10">
                        <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-accent text-2xl shadow-lg shadow-accent/5">
                            📅
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Event Logistics</h4>
                            <p className="text-xs text-secondary font-mono">Set schedule and access info.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="form-control group">
                            <label className="label pl-1 mb-3 block">
                                <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] group-hover:text-accent transition-colors">Start Time</span>
                            </label>
                            <input 
                                type="datetime-local" 
                                className="input h-14 px-4 bg-surface/50 border-divider/10 text-white focus:border-accent w-full text-sm font-mono rounded-xl shadow-sm"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="form-control group">
                            <label className="label pl-1 mb-3 block">
                                <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] group-hover:text-accent transition-colors">End Time</span>
                            </label>
                            <input 
                                type="datetime-local" 
                                className="input h-14 px-4 bg-surface/50 border-divider/10 text-white focus:border-accent w-full text-sm font-mono rounded-xl shadow-sm"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="form-control group">
                        <label className="label pl-1 mb-3 block">
                             <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] group-hover:text-accent transition-colors">Ticket / Info Link</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i className="fa-solid fa-link text-secondary text-sm"></i>
                            </div>
                            <input 
                                type="url" 
                                className="input h-14 pl-12 bg-surface/50 border-divider/10 text-white focus:border-accent w-full font-mono text-sm rounded-xl"
                                placeholder="https://..."
                                value={ticketLink}
                                onChange={(e) => setTicketLink(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
