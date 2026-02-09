"use client";

import { useEffect, useState } from "react";
import { DashboardItem, Walk } from "../../interfaces/dashboard";
import { POIService } from "../../services/poi";
import { CATEGORIES } from "../../constants/dashboard-constants";

interface WalkModalProps {
  initialData?: Walk | null;
  availablePOIs?: DashboardItem[]; // To select stops from
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function WalkModal({ initialData, availablePOIs = [], onSave, onClose }: WalkModalProps) {
  const [formData, setFormData] = useState({
      name: '',
      description: '',
      difficulty: 'Medium',
      estTime: '90 min',
      stopIds: [] as (number | string)[]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Set initial data
  useEffect(() => {
    if (initialData) {
        setFormData({
            name: initialData.name,
            description: initialData.desc,
            difficulty: initialData.difficulty,
            estTime: initialData.estTime,
            stopIds: initialData.stopIds || []
        });
    }
  }, [initialData]);

  const toggleStop = (id: number | string) => {
      setFormData(prev => {
          const stops = prev.stopIds.includes(id) 
              ? prev.stopIds.filter(sid => sid !== id)
              : [...prev.stopIds, id];
          return { ...prev, stopIds: stops };
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.stopIds.length < 2) {
          setError("Walk must have at least 2 stops.");
          return;
      }

      setLoading(true);
      setError('');

      try {
          // Extract number from estTime string
          const durationMatch = formData.estTime.match(/(\d+)/);
          const duration = durationMatch ? parseInt(durationMatch[1]) : 90;

          const payload: any = {
              title: formData.name,
              description: formData.description,
              difficulty: formData.difficulty,
              estimated_duration_minutes: duration,
              stops: formData.stopIds
          };
          
          if (initialData) {
              payload.id = initialData.id;
          }

          await onSave(payload);
          onClose();
      } catch (err: any) {
          setError(err.message || "Failed to save walk");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-surface border border-divider/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[85vh]">
            
            <div className="p-4 border-b border-divider/10 flex justify-between items-center bg-surface/50 shrink-0">
                <h2 className="text-lg font-bold tracking-tight uppercase flex items-center gap-2">
                    <i className="fa-solid fa-route text-accent"></i>
                    {initialData ? 'Edit' : 'Create'} Walk
                </h2>
                <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
                    <i className="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded text-xs flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation"></i>{error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-secondary uppercase">Walk Name</label>
                        <input 
                            required
                            type="text" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-canvas border border-divider/20 rounded px-3 py-2 text-sm focus:border-accent outline-none"
                            placeholder="e.g. Historic Paris Tour"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-mono text-secondary uppercase">Difficulty</label>
                            <select 
                                value={formData.difficulty}
                                onChange={e => setFormData({...formData, difficulty: e.target.value})}
                                className="w-full bg-canvas border border-divider/20 rounded px-3 py-2 text-sm focus:border-accent outline-none appearance-none"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-mono text-secondary uppercase">Estimated Time</label>
                            <input 
                                required
                                type="text" 
                                value={formData.estTime}
                                onChange={e => setFormData({...formData, estTime: e.target.value})}
                                className="w-full bg-canvas border border-divider/20 rounded px-3 py-2 text-sm focus:border-accent outline-none"
                                placeholder="e.g. 90 min"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-mono text-secondary uppercase">Description</label>
                        <textarea 
                            rows={2}
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-canvas border border-divider/20 rounded px-3 py-2 text-sm focus:border-accent outline-none"
                        />
                    </div>
                </div>

                {/* STOP SELECTION */}
                <div className="border-t border-divider/10 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-mono text-secondary uppercase">Select Stops ({formData.stopIds.length})</label>
                        <span className="text-[10px] text-secondary/70">Click to select/deselect</span>
                    </div>
                    
                    <div className="h-64 overflow-y-auto border border-divider/10 rounded-lg bg-canvas/50 custom-scrollbar p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availablePOIs.map(poi => {
                            const isSelected = formData.stopIds.includes(poi.id);
                            return (
                                <div 
                                    key={poi.id}
                                    onClick={() => toggleStop(poi.id)}
                                    className={`
                                        p-2 rounded border cursor-pointer transition-all flex items-center gap-3
                                        ${isSelected ? 'bg-accent/10 border-accent/50' : 'bg-surface border-divider/10 hover:border-divider/30'}
                                    `}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-accent bg-accent text-black' : 'border-secondary/50'}`}>
                                        {isSelected && <i className="fa-solid fa-check text-[10px]"></i>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-bold truncate ${isSelected ? 'text-primary' : 'text-secondary'}`}>{poi.name}</div>
                                        <div className="text-[10px] text-secondary/50 truncate">{poi.type}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {availablePOIs.length === 0 && (
                             <div className="col-span-2 text-center py-8 text-secondary text-xs italic">
                                 No monuments or events available. Create some first!
                             </div>
                        )}
                    </div>
                </div>
            </form>

            <div className="p-4 border-t border-divider/10 bg-surface/50 shrink-0 flex gap-3">
                 <button 
                    type="button" 
                    onClick={onClose}
                    className="flex-1 py-3 bg-surface border border-divider/20 text-secondary hover:text-primary rounded-lg font-bold text-xs transition-colors"
                >
                    CANCEL
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={loading || formData.stopIds.length < 2}
                    className={`flex-1 py-3 bg-primary text-canvas hover:bg-accent hover:text-black rounded-lg font-bold text-xs transition-all shadow-lg hover:shadow-accent/20 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                >
                    {loading ? 'SAVING...' : 'SAVE WALK'}
                </button>
            </div>
        </div>
    </div>
  );
}
