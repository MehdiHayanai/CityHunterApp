'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { POIService, POIType } from '@/app/services/poi';
import { useRouter } from 'next/navigation';
import { usePopup } from '@/app/context/PopupContext';

const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false, loading: () => <p>Loading Map...</p> });

export default function PoiForm() {
    const router = useRouter();
    const { showAlert } = usePopup();
    const [type, setType] = useState<POIType>('monument');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Shared state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [images, setImages] = useState<string[]>([]); // simplified for MVP

    // Monument specific
    const [architecturalStyle, setArchitecturalStyle] = useState('');
    
    // Event specific
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [ticketLink, setTicketLink] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!location) {
            setError('Please select a location on the map');
            return;
        }

        setLoading(true);
        try {
            if (type === 'monument') {
                await POIService.createMonument({
                    name,
                    description,
                    location,
                    images,
                    architectural_style: architecturalStyle,
                    opening_rules: [] // Default empty for MVP
                });
            } else {
                await POIService.createEvent({
                    name,
                    description,
                    location,
                    images,
                    start_time: startTime,
                    end_time: endTime,
                    ticket_link: ticketLink
                });
            }
            showAlert("SECTOR CREATED", `${type === 'monument' ? 'Monument' : 'Event'} data has been successfully uploaded to the grid.`, 'success');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 glass rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
            <h2 className="text-3xl font-extrabold mb-8 text-gradient">Create New POI</h2>
            
            <div className="flex gap-4 mb-8 bg-black/20 p-2 rounded-xl">
                <button 
                    type="button"
                    onClick={() => setType('monument')}
                    className={`btn flex-1 transition-all duration-300 ${type === 'monument' ? 'bg-primary text-black font-bold' : 'btn-ghost text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                    Monument
                </button>
                <button 
                    type="button"
                    onClick={() => setType('event')}
                    className={`btn flex-1 transition-all duration-300 ${type === 'event' ? 'bg-accent text-black font-bold' : 'btn-ghost text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                    Event
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Map Section */}
                <div className="form-control">
                    <label className="label mb-2">
                        <span className="label-text font-semibold text-lg">Location</span>
                    </label>
                    <div className="border border-white/10 rounded-xl overflow-hidden shadow-inner">
                        <MapPicker value={location} onChange={setLocation} />
                    </div>
                     {location && <p className="text-xs text-white/50 mt-2 font-mono">Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
                </div>

                {/* Common Fields */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-white/80">Name</span>
                    </label>
                    <input 
                        type="text" 
                        className="input bg-black/30 border-white/10 text-white focus:border-accent w-full backdrop-blur-sm" 
                        placeholder="E.g. Eiffel Tower"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-white/80">Description</span>
                    </label>
                    <textarea 
                        className="textarea bg-black/30 border-white/10 text-white focus:border-accent h-32 backdrop-blur-sm" 
                        placeholder="Describe the place..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>

                {/* Type Specific Fields */}
                {type === 'monument' && (
                    <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            🏛️ <span className="text-white/90">Monument Details</span>
                        </h3>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-white/80">Architectural Style</span>
                            </label>
                            <input 
                                type="text" 
                                className="input bg-black/30 border-white/10 text-white focus:border-accent w-full"
                                placeholder="e.g. Gothic, Modern"
                                value={architecturalStyle}
                                onChange={(e) => setArchitecturalStyle(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                )}

                {type === 'event' && (
                    <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            🎉 <span className="text-white/90">Event Details</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-white/80">Start Time</span>
                                </label>
                                <input 
                                    type="datetime-local" 
                                    className="input bg-black/30 border-white/10 text-white focus:border-accent w-full"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-white/80">End Time</span>
                                </label>
                                <input 
                                    type="datetime-local" 
                                    className="input bg-black/30 border-white/10 text-white focus:border-accent w-full"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text text-white/80">Ticket Link</span>
                            </label>
                            <input 
                                type="url" 
                                className="input bg-black/30 border-white/10 text-white focus:border-accent w-full"
                                placeholder="https://..."
                                value={ticketLink}
                                onChange={(e) => setTicketLink(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {error && <div className="alert alert-error font-bold">{error}</div>}

                <button 
                    type="submit" 
                    className={`btn bg-gradient-to-r from-white to-gray-200 text-black border-none hover:scale-[1.02] active:scale-95 transition-all w-full text-lg font-bold shadow-lg ${loading ? 'loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Creating...' : `Create ${type === 'monument' ? 'Monument' : 'Event'}`}
                </button>
            </form>
        </div>
    );
}
