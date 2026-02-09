import { useState } from 'react';

interface StepMediaProps {
    images: string[];
    setImages: (images: string[]) => void;
    hiddenDescription: string;
    setHiddenDescription: (desc: string) => void;
}

export default function StepMedia({ 
    images, setImages,
    hiddenDescription, setHiddenDescription
}: StepMediaProps) {
    const [imageUrl, setImageUrl] = useState('');

    const addImage = (e: React.FormEvent) => {
        e.preventDefault();
        if (imageUrl && imageUrl.trim().length > 0) {
            setImages([...images, imageUrl.trim()]);
            setImageUrl('');
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8">
            <div className="bg-black/20 p-8 rounded-3xl border border-divider/10 space-y-8">
                <div className="flex items-center gap-4 mb-2 pb-6 border-b border-divider/10">
                    <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-accent text-2xl shadow-lg shadow-accent/5">
                        📸
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-lg">Visuals & Secrets</h4>
                        <p className="text-xs text-secondary font-mono">Add photos and hidden rewards.</p>
                    </div>
                </div>

                {/* --- IMAGE UPLOAD (URL) --- */}
                <div className="space-y-4">
                    <label className="label-tech">
                        <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                             <i className="fa-solid fa-image"></i> Public Photos
                        </span>
                    </label>
                    
                    <div className="flex gap-2">
                        <input 
                            type="url" 
                            className="input-glass w-full text-sm font-mono"
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addImage(e)}
                        />
                        <button 
                            onClick={addImage}
                            className="bg-accent text-black h-16 w-16 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                        >
                            <i className="fa-solid fa-plus text-xl"></i>
                        </button>
                    </div>

                    {/* Image Preview Grid */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mt-4 animate-in fade-in duration-500">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <i className="fa-solid fa-xmark text-xs"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- HIDDEN CONTENT --- */}
                <div className="form-control group pt-4 border-t border-divider/5">
                     <label className="label-tech mb-4 block">
                        <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] group-hover:text-accent transition-colors flex items-center gap-2">
                            <i className="fa-solid fa-user-secret"></i> Hidden Secrets (Reward)
                        </span>
                    </label>
                    <textarea 
                        className="textarea bg-black/20 border-white/10 text-white placeholder-white/20 focus:border-accent focus:bg-black/40 w-full h-32 p-6 text-sm leading-relaxed rounded-2xl backdrop-blur-sm shadow-inner transition-all resize-none"
                        placeholder="Enter the history or fun facts that users unlock when they arrive at this location..."
                        value={hiddenDescription}
                        onChange={(e) => setHiddenDescription(e.target.value)}
                    ></textarea>
                     <div className="flex justify-end mt-2">
                        <span className="text-[10px] text-secondary/50 font-mono flex items-center gap-1">
                            <i className="fa-solid fa-lock text-accent/50"></i> Encrypted until arrival
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}
