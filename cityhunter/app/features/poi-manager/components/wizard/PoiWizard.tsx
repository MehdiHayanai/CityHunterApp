'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { POIService, POIType } from '@/app/services/poi';
import { useRouter } from 'next/navigation';

// Steps
import StepType from './steps/StepType';
import StepBasic from './steps/StepBasic';
import StepDetails from './steps/StepDetails';
import StepMedia from './steps/StepMedia';

const MapPicker = dynamic(() => import('../MapPicker'), { ssr: false, loading: () => <p>Loading Map...</p> });

export default function PoiWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [type, setType] = useState<POIType>('monument');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [architecturalStyle, setArchitecturalStyle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [ticketLink, setTicketLink] = useState('');
    
    // Media & Secrets
    const [images, setImages] = useState<string[]>([]);
    const [hiddenDescription, setHiddenDescription] = useState('');

    // Local state for coordinate inputs to allow typing
    const [inputLat, setInputLat] = useState('');
    const [inputLng, setInputLng] = useState('');


    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");

    useEffect(() => {
        if (location) {
            setInputLat(location.lat.toFixed(6));
            setInputLng(location.lng.toFixed(6));
        }
    }, [location]);

    const canAdvance = () => {
        if (step === 1) return true; 
        if (step === 2) return name.length > 0 && description.length > 0;
        if (step === 3) return true; 
        return false;
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleManualLocationUpdate = () => {
        const lat = parseFloat(inputLat);
        const lng = parseFloat(inputLng);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            setLocation({ lat, lng });
        } else {
            setToastMessage("Invalid format. Please use decimal format (e.g. 48.8566).");
            setToastType("error");
            setShowToast(true);
        }
    };

    const validateForm = (): boolean => {
        if (type === 'event') {
             // Validate URL if present
             if (ticketLink && ticketLink.trim().length > 0) {
                 console.log("Validating URL:", ticketLink);
                 try {
                     new URL(ticketLink);
                 } catch (e) {
                     setToastMessage("Invalid Ticket Link URL. Please include http:// or https://");
                     setToastType("error");
                     setShowToast(true);
                     return false;
                 }
             }
             // Validate Times
             if (startTime && endTime) {
                 const start = new Date(startTime);
                 const end = new Date(endTime);
                 if (end <= start) {
                     setToastMessage("End time must be after the start time.");
                     setToastType("error");
                     setShowToast(true);
                     return false;
                 }
             }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!location) {
            setToastMessage("Target Lock Required. Please select a location on the map.");
            setToastType("error");
            setShowToast(true);
            return;
        }

        if (!validateForm()) return;

        setLoading(true);
        try {
             if (type === 'monument') {
                await POIService.createMonument({
                    name,
                    description,
                    location,
                    images: images,
                    architectural_style: architecturalStyle,
                    opening_rules: [],
                    hidden_description: hiddenDescription.trim().length > 0 ? hiddenDescription : undefined
                });
            } else {
                // Formatting dates and optional fields for 422 prevention
                const formattedStart = startTime ? new Date(startTime).toISOString() : new Date().toISOString();
                const formattedEnd = endTime ? new Date(endTime).toISOString() : new Date(Date.now() + 3600000).toISOString();
                const sanitizedTicketLink = ticketLink && ticketLink.trim().length > 0 ? ticketLink : undefined;

                await POIService.createEvent({
                    name,
                    description,
                    location,
                    images: images,
                    start_time: formattedStart,
                    end_time: formattedEnd,
                    ticket_link: sanitizedTicketLink,
                    hidden_description: hiddenDescription.trim().length > 0 ? hiddenDescription : undefined
                });
            }
            
            setToastMessage(`${type === 'monument' ? 'Monument' : 'Event'} established successfully!`);
            setToastType("success");
            setShowToast(true);
            
            setTimeout(() => {
                window.location.reload(); 
            }, 1500);

        } catch (error: any) {
            console.error(error);
            // Enhanced Error Handling
            if (error.message.includes('fetch') || error.message.includes('network')) {
                 setToastMessage("Connection lost. Unable to reach the server.");
            } else {
                 setToastMessage(error.message || "An unexpected error occurred.");
            }
            setToastType("error");
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto h-auto md:h-[750px] flex flex-col md:flex-row rounded-3xl overflow-hidden glass shadow-2xl border border-divider/10 ring-1 ring-white/5 transition-all duration-300 relative">
            
            {/* Toast Notification */}
            {showToast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] w-full max-w-md px-4">
                     <div className={`p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 ${toastType === 'success' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        <div className="flex items-center gap-3">
                            <i className={`fa-solid ${toastType === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'} text-xl`}></i>
                            <p className="font-bold text-sm tracking-wide">{toastMessage}</p>
                        </div>
                        <button onClick={() => setShowToast(false)} className="hover:bg-white/10 rounded-lg p-1 transition-colors">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                     </div>
                </div>
            )}

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-[1000] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-accent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <i className="fa-solid fa-satellite-dish text-2xl text-accent animate-pulse"></i>
                        </div>
                    </div>
                    <h3 className="mt-8 text-2xl font-black text-white tracking-tight animate-pulse">ESTABLISHING UPLINK</h3>
                    <p className="text-secondary font-mono text-sm mt-2">Securing location data...</p>
                </div>
            )}

            {/* LEFT: Context / Map */}
            <div className="w-1/2 relative hidden md:block border-r border-divider/10 bg-black/40">
                 <div className="absolute inset-0 z-0">
                    <MapPicker 
                        value={location} 
                        onChange={setLocation} 
                        onError={(msg) => {
                            setToastMessage(msg);
                            setToastType("error");
                            setShowToast(true);
                        }}
                    />
                 </div>
                 {/* Map Overlay Info - Keeping existing location (top-left) but enhanced */}
                 <div className="absolute top-6 left-6 z-[400] bg-surface/90 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-xl w-64 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2 h-2 rounded-full ${location ? 'bg-accent animate-pulse' : 'bg-red-500'}`}></span>
                        <h4 className="font-bold text-sm text-white uppercase tracking-wider">Location Status</h4>
                    </div>
                    
                    <div className="space-y-3">
                         {/* Manual Inputs */}
                        <div className="grid grid-cols-2 gap-2">
                           <div>
                                <label className="text-[10px] text-secondary font-mono block mb-1">LATITUDE</label>
                                <input 
                                    type="text" 
                                    className="input input-xs w-full bg-black/30 border-white/10 focus:border-accent text-white font-mono"
                                    value={inputLat}
                                    onChange={(e) => setInputLat(e.target.value)}
                                    onBlur={handleManualLocationUpdate}
                                    onKeyDown={(e) => e.key === 'Enter' && handleManualLocationUpdate()}
                                    placeholder="0.0000"
                                />
                           </div>
                           <div>
                                <label className="text-[10px] text-secondary font-mono block mb-1">LONGITUDE</label>
                                <input 
                                    type="text" 
                                    className="input input-xs w-full bg-black/30 border-white/10 focus:border-accent text-white font-mono"
                                    value={inputLng}
                                    onChange={(e) => setInputLng(e.target.value)}
                                    onBlur={handleManualLocationUpdate}
                                    onKeyDown={(e) => e.key === 'Enter' && handleManualLocationUpdate()}
                                    placeholder="0.0000"
                                />
                           </div>
                        </div>

                        {location ? (
                            <div className="text-[10px] text-accent font-bold bg-accent/10 py-1.5 px-2 rounded border border-accent/20 text-center">
                                <i className="fa-solid fa-lock mr-1"></i> COORDINATES LOCKED
                            </div>
                        ) : (
                             <p className="text-xs text-secondary italic text-center py-1">Click map or enter coords.</p>
                        )}
                    </div>
                 </div>
            </div>

            {/* RIGHT: Wizard Steps */}
            <div className="w-full md:w-1/2 flex flex-col bg-surface/60 backdrop-blur-xl relative">
                {/* Visual Guideline: Top Border Accent */}
                <div className="h-1 w-full bg-divider/10 relative overflow-hidden">
                    <div 
                        className="absolute top-0 left-0 h-full bg-accent transition-all duration-500 ease-out shadow-[0_0_10px_rgba(204,255,0,0.5)]"
                        style={{ width: `${(step / 4) * 100}%` }}
                    ></div>
                </div>

                <div className="flex-1 p-8 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar flex flex-col">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center pb-6 border-b border-divider/10 border-dashed">
                        <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-accent tracking-widest uppercase mb-1">
                                STEP 0{step}
                            </span>
                            <h2 className="text-2xl font-black text-white tracking-tight">
                                {step === 1 && "Select Type"}
                                {step === 2 && "Basic Info"}
                                {step === 3 && "Fine Details"}
                                {step === 4 && "Visuals & Secrets"}
                            </h2>
                        </div>
                        
                        {step > 1 && (
                            <button 
                                onClick={prevStep} 
                                className="group flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-all text-sm font-bold text-secondary hover:text-white"
                            >
                                <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform text-xs"></i>
                                Back
                            </button>
                        )}
                    </div>

                    <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                        {step === 1 && <StepType type={type} setType={setType} />}
                        {step === 2 && <StepBasic name={name} setName={setName} description={description} setDescription={setDescription} />}
                        {step === 3 && <StepDetails 
                            type={type}
                            architecturalStyle={architecturalStyle} setArchitecturalStyle={setArchitecturalStyle}
                            startTime={startTime} setStartTime={setStartTime}
                            endTime={endTime} setEndTime={setEndTime}
                            ticketLink={ticketLink} setTicketLink={setTicketLink}
                        />}
                        {step === 4 && <StepMedia 
                            images={images} setImages={setImages}
                            hiddenDescription={hiddenDescription} setHiddenDescription={setHiddenDescription}
                        />}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-divider/10 bg-black/10">
                    {step < 4 ? (
                        <button 
                            onClick={nextStep}
                            disabled={!canAdvance()}
                            className="btn w-full h-14 bg-white text-black hover:bg-white/90 border-0 font-black text-lg shadow-lg tracking-wide rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            CONTINUE
                            <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={loading || !location}
                            className="btn w-full h-14 bg-accent text-black hover:bg-accentHover border-0 font-black text-lg shadow-[0_0_30px_rgba(204,255,0,0.3)] tracking-wide rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* Removed spinner from button, text remains but locked state handled by disabled */}
                            CREATE {type === 'monument' ? 'MONUMENT' : 'EVENT'}
                            <i className="fa-solid fa-check group-hover:scale-125 transition-transform"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
