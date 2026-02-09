
import { POIType } from '@/app/services/poi';

interface StepTypeProps {
    type: POIType;
    setType: (t: POIType) => void;
}

export default function StepType({ type, setType }: StepTypeProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <button 
                    type="button"
                    onClick={() => setType('monument')}
                    className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-4 group overflow-hidden ${
                        type === 'monument' 
                        ? 'border-accent bg-accent/5 shadow-[inset_0_0_20px_rgba(204,255,0,0.05)]' 
                        : 'border-divider/10 hover:border-accent/50 hover:bg-white/5'
                    }`}
                >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110 shadow-lg ${
                        type === 'monument' ? 'bg-accent text-black shadow-accent/20' : 'bg-surface border border-white/5 text-secondary group-hover:border-accent/30'
                    }`}>
                        🏛️
                    </div>
                    <div className="text-center">
                        <span className={`font-black text-lg tracking-tight block ${type === 'monument' ? 'text-accent' : 'text-primary group-hover:text-white'}`}>MONUMENT</span>
                        <span className="text-[10px] text-secondary font-mono mt-1 block">Permanent Structure</span>
                    </div>
                    
                    {type === 'monument' && (
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(204,255,0,1)]"></div>
                    )}
                </button>
                
                <button 
                    type="button"
                    onClick={() => setType('event')}
                   className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-4 group overflow-hidden ${
                        type === 'event' 
                        ? 'border-accent bg-accent/5 shadow-[inset_0_0_20px_rgba(204,255,0,0.05)]' 
                        : 'border-divider/10 hover:border-accent/50 hover:bg-white/5'
                    }`}
                >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110 shadow-lg ${
                        type === 'event' ? 'bg-accent text-black shadow-accent/20' : 'bg-surface border border-white/5 text-secondary group-hover:border-accent/30'
                    }`}>
                        🎉
                    </div>
                    <div className="text-center">
                        <span className={`font-black text-lg tracking-tight block ${type === 'event' ? 'text-accent' : 'text-primary group-hover:text-white'}`}>EVENT</span>
                        <span className="text-[10px] text-secondary font-mono mt-1 block">Temporary Happening</span>
                    </div>

                    {type === 'event' && (
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(204,255,0,1)]"></div>
                    )}
                </button>
            </div>
            
            <div className="bg-surface/50 p-6 rounded-2xl border border-divider/10 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/20"></div>
                <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <i className="fa-solid fa-circle-info text-accent text-xs"></i>
                    What is a {type === 'monument' ? 'Monument' : 'Event'}?
                </h4>
                <p className="text-xs text-secondary leading-relaxed">
                    {type === 'monument' 
                        ? "Monuments are static, physical locations that players can visit at any time. They serve as key landmarks for quests and user check-ins. Think statues, historic buildings, or art installations." 
                        : "Events are time-bounded occurrences. They have a start and end time and are often tied to specific social gatherings, concerts, or festivals."}
                </p>
            </div>
        </div>
    );
}
