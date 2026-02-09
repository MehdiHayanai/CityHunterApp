import Link from "next/link";
import { TrendingWalkData } from "../../types/social";

interface TrendingWalksProps {
  walks: TrendingWalkData[];
}

export default function TrendingWalks({ walks }: TrendingWalksProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {walks.map((walk) => (
        <Link 
            key={walk.id} 
            href={`/dashboard?walkId=${walk.id}`}
            className="group relative bg-surface border border-divider/10 rounded-xl overflow-hidden hover:border-accent/50 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer block"
        >
            <div className="h-40 w-full overflow-hidden relative">
                <img 
                    src={walk.image} 
                    alt={walk.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1">
                    <i className="fa-solid fa-star text-yellow-400"></i> {walk.rating}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-3 left-3">
                     <div className="text-xs font-bold text-white tracking-wide drop-shadow-md">{walk.estTime}</div>
                </div>
            </div>

            <div className="p-4 space-y-2">
                <h3 className="font-bold text-primary group-hover:text-accent truncate">{walk.name}</h3>
                <p className="text-xs text-secondary line-clamp-2">{walk.description}</p>
                
                <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-secondary uppercase">
                    <span className={`px-2 py-0.5 rounded border ${
                        walk.difficulty === 'Easy' ? 'border-green-500/30 text-green-500' :
                        walk.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-500' :
                        'border-red-500/30 text-red-500'
                    }`}>
                        {walk.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                        <i className="fa-solid fa-shoe-prints"></i> {walk.visitors.toLocaleString()}
                    </span>
                </div>
            </div>
        </Link>
      ))}
    </div>
  );
}
