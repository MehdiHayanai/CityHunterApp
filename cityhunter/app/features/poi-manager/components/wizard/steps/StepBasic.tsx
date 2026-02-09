
interface StepBasicProps {
    name: string;
    setName: (n: string) => void;
    description: string;
    setDescription: (d: string) => void;
}

export default function StepBasic({ name, setName, description, setDescription }: StepBasicProps) {
    return (
        <div className="space-y-8">
            <div className="form-control group">
                <label className="label pl-1 mb-3 block">
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] group-hover:text-accent transition-colors flex items-center gap-2">
                        <i className="fa-solid fa-signature"></i> Name of Place
                    </span>
                </label>
                <input 
                    type="text" 
                    className="input h-16 px-6 bg-black/20 border-divider/10 text-white placeholder-white/10 focus:border-accent focus:bg-black/40 rounded-2xl w-full backdrop-blur-sm shadow-inner transition-all text-xl font-bold tracking-tight" 
                    placeholder="E.g. The Grand Fountain"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="form-control group">
                <label className="label pl-1 mb-3 block">
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] group-hover:text-accent transition-colors flex items-center gap-2">
                        <i className="fa-solid fa-align-left"></i> Description
                    </span>
                </label>
                <textarea 
                    className="textarea px-6 py-5 bg-black/20 border-divider/10 text-white placeholder-white/10 focus:border-accent focus:bg-black/40 rounded-2xl h-48 w-full backdrop-blur-sm shadow-inner transition-all resize-none text-base leading-relaxed tracking-wide" 
                    placeholder="Provide a captivating description for explorers. What makes this place special? Any historical facts?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-2 px-1">
                    <span className={`text-[10px] font-mono ${description.length < 50 ? 'text-orange-400' : 'text-accent'}`}>
                        {description.length} / 50 characters min
                    </span>
                </div>
            </div>
        </div>
    );
}
