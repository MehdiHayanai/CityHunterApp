"use client";

import { useEffect, useState } from "react";
import { DashboardItem } from "../../interfaces/dashboard";
import { POI } from "../../services/poi";

interface POIModalProps {
  type: 'monument' | 'event';
  initialData?: DashboardItem | null;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function POIModal({ type, initialData, onSave, onClose }: POIModalProps) {
  const [formData, setFormData] = useState({
      name: '',
      description: '',
      lat: 48.8566,
      lng: 2.3522,
      img: '',
      type: '',
      // Event specifics
      start_time: '',
      end_time: '',
      ticket_link: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
        setFormData({
            ...initialData,
            name: initialData.name || '',
            description: (initialData as any).desc || (initialData as any).description || '',
            lat: initialData.lat ?? 48.8566,
            lng: initialData.lng ?? 2.3522,
            img: initialData.img || '',
            type: initialData.type || '',
            start_time: (initialData as any).start_time || '',
            end_time: (initialData as any).end_time || '',
            ticket_link: (initialData as any).ticket_link || ''
        });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
          const payload: any = {
              ...formData, // Preserve extra fields
              name: formData.name,
              description: formData.description,
              location: { lat: Number(formData.lat), lng: Number(formData.lng) },
              images: [formData.img],
              type: formData.type || (type === 'monument' ? 'Landmark' : 'Concert'),
          };

          if (type === 'event') {
              payload.start_time = formData.start_time;
              payload.end_time = formData.end_time;
              payload.ticket_link = formData.ticket_link;
          }

          // If editing, include ID if needed by parent handler (which likely has it from initialData)
          if (initialData) {
              payload.id = initialData.id;
          }

          await onSave(payload);
          onClose();
      } catch (err: any) {
          setError(err.message || "Failed to save");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-surface border border-divider/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-4 border-b border-divider/10 flex justify-between items-center bg-surface/50">
                <h2 className="text-lg font-bold tracking-tight uppercase flex items-center gap-2">
                    <i className={`fa-solid ${type === 'monument' ? 'fa-landmark' : 'fa-calendar'} text-accent`}></i>
                    {initialData ? 'Edit' : 'Add'} {type}
                </h2>
                <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
                    <i className="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded text-xs">
                        <i className="fa-solid fa-triangle-exclamation mr-2"></i>{error}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-mono text-secondary uppercase">Name</label>
                    <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-canvas border border-divider/20 rounded px-3 py-2 text-sm focus:border-accent outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-secondary uppercase">Coordinates (Lat)</label>
                        <input 
                            required
                            type="number" 
                            step="any"
                            value={formData.lat}
                            onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})}
                            className="w-full bg-canvas border border-divider/20 rounded px-3 py-2 text-sm focus:border-accent outline-none font-mono"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-secondary uppercase">Coordinates (Lng)</label>
                        <input 
                            required
                            type="number" 
                            step="any"
                            value={formData.lng}
                            onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})}
                            className="w-full bg-canvas border border-divider/20 rounded px-3 py-2 text-sm focus:border-accent outline-none font-mono"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-mono text-secondary uppercase">Description</label>
                    <textarea 
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-canvas border border-divider/20 rounded px-3 py-2 text-sm focus:border-accent outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-mono text-secondary uppercase">Image URL</label>
                    <input 
                         
                        type="url" 
                        value={formData.img}
                        onChange={e => setFormData({...formData, img: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-canvas border border-divider/20 rounded px-3 py-2 text-sm focus:border-accent outline-none"
                    />
                </div>

                {type === 'event' && (
                    <div className="grid grid-cols-2 gap-4 bg-surface/50 p-3 rounded-lg border border-divider/10">
                         <div className="space-y-1">
                            <label className="text-xs font-mono text-secondary uppercase">Start Time</label>
                            <input 
                                type="datetime-local" 
                                value={formData.start_time}
                                onChange={e => setFormData({...formData, start_time: e.target.value})}
                                className="w-full bg-canvas border border-divider/20 rounded px-2 py-1 text-xs focus:border-accent outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-mono text-secondary uppercase">End Time</label>
                            <input 
                                type="datetime-local" 
                                value={formData.end_time}
                                onChange={e => setFormData({...formData, end_time: e.target.value})}
                                className="w-full bg-canvas border border-divider/20 rounded px-2 py-1 text-xs focus:border-accent outline-none"
                            />
                        </div>
                    </div>
                )}

                <div className="pt-4 flex gap-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 py-2 bg-surface border border-divider/20 text-secondary hover:text-primary rounded-lg font-bold text-xs transition-colors"
                    >
                        CANCEL
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 py-3 bg-primary text-canvas hover:bg-accent hover:text-black rounded-lg font-bold text-xs transition-all shadow-lg hover:shadow-accent/20 flex items-center justify-center gap-2"
                    >
                        {loading && <i className="fa-solid fa-circle-notch animate-spin"></i>}
                        {loading ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}
