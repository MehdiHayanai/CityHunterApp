import { ActivityFeedItem } from "../../types/social";

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {activities.map((item) => (
        <div 
          key={item.id} 
          className="bg-surface/50 border border-divider/10 rounded-xl p-4 flex gap-4 hover:border-accent/30 transition-all hover:bg-surface/80"
        >
            {/* Avatar */}
            <div className="shrink-0">
                <img 
                    src={item.userAvatar} 
                    alt={item.userName} 
                    className="w-10 h-10 rounded-full border border-divider/20"
                />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="font-bold text-sm text-primary">{item.userName}</span>
                        <span className="mx-2 text-secondary text-xs">•</span>
                        <span className="text-xs text-secondary">{item.timestamp}</span>
                    </div>
                </div>

                <p className="text-sm text-secondary">
                    {item.action === 'completed_walk' && <><span className="text-accent">Completed</span> the walk</>}
                    {item.action === 'earned_badge' && <><span className="text-yellow-500">Earned</span> the badge</>}
                    {item.action === 'joined_event' && <><span className="text-blue-400">Joined</span> the event</>}
                    {' '}
                    <span className="font-bold text-primary">"{item.targetName}"</span>
                </p>

                {/* Optional Image */}
                {item.image && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-divider/10 max-h-48 w-full group cursor-pointer relative">
                         <img src={item.image} alt="Activity" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <i className="fa-solid fa-expand text-white"></i>
                         </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 mt-2">
                    <button className="text-xs text-secondary hover:text-accent flex items-center gap-1 group">
                        <i className="fa-regular fa-heart group-hover:scale-110 transition-transform"></i> 
                        {item.likes}
                    </button>
                    <button className="text-xs text-secondary hover:text-primary flex items-center gap-1 group">
                        <i className="fa-regular fa-comment group-hover:scale-110 transition-transform"></i> 
                        {item.comments}
                    </button>
                </div>
            </div>
        </div>
      ))}
    </div>
  );
}
