"use client";

import { useState, useEffect } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import ActivityFeed from "../components/social/ActivityFeed";
import TrendingWalks from "../components/social/TrendingWalks";
import { MOCK_TRENDING_WALKS } from "../constants/social"; // Keep trending mock for now or Implement later
import { socialService } from "../services/social";
import { ActivityFeedItem } from "../interfaces/social";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState('Social');
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
        try {
            const data = await socialService.getFeed();
            
            // Map API data to UI format
            // Note: API returns raw data. We need to fetch User info or include it in response.
            // For now, we might have missing user names/avatars if the API doesn't populate them.
            // Assuming the backend eventually populates user info or we fetch valid ones.
            // Since we seeded it, we might have IDs.
            
            // Temporary mapping for UI compatibility
            const mapped = data.map((item: ActivityFeedItem) => ({
                id: item.id,
                userName: "Explorer " + item.user_id.substring(0, 4), // Placeholder until we populate user
                userAvatar: "https://i.pravatar.cc/150?u=" + item.user_id,
                action: item.type,
                targetName: item.metadata?.walk_name || item.metadata?.badge_name || "Unknown",
                timestamp: new Date(item.created_at).toLocaleDateString(),
                image: item.type === 'walk_completed' ? "https://images.unsplash.com/photo-1511739001486-da283B4e7.jpg" : undefined,
                likes: 0,
                comments: 0
            }));
            
            setFeedItems(mapped);
        } catch (error) {
            console.error("Failed to fetch feed:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchFeed();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-canvas text-primary selection:bg-accent selection:text-black">
      <DashboardNavbar />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">
                    Social <span className="text-accent">Hub</span>
                </h1>
                <p className="text-secondary max-w-2xl">
                    See what your friends are exploring and discover the most popular routes in the city.
                </p>
            </div>

            {/* Trending Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-fire text-orange-500 animate-pulse"></i>
                    <h2 className="text-xl font-bold tracking-tight uppercase">Trending Walks</h2>
                </div>
                <TrendingWalks walks={MOCK_TRENDING_WALKS} />
            </section>

            <div className="h-[1px] bg-divider/10 w-full"></div>

            {/* Feed Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                     <div className="flex items-center gap-2 mb-4">
                        <i className="fa-solid fa-users-viewfinder text-accent"></i>
                        <h2 className="text-xl font-bold tracking-tight uppercase">Friend Activity</h2>
                    </div>
                    {loading ? (
                        <div className="text-center p-8 text-secondary">Loading feed...</div>
                    ) : (
                        <ActivityFeed activities={feedItems} />
                    )}
                </div>

                {/* Sidebar (Optional Stats or Suggestions) */}
                <div className="space-y-6">
                    <div className="bg-surface border border-divider/10 rounded-xl p-6">
                        <h3 className="font-bold text-sm uppercase text-secondary mb-4">Your Weekly Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Distance</span>
                                <span className="font-mono font-bold text-accent">12.5 km</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm">Walks</span>
                                <span className="font-mono font-bold">3</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm">Social Rank</span>
                                <span className="font-mono font-bold text-yellow-500">#42</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 rounded-xl p-6 text-center space-y-2">
                        <div className="w-12 h-12 bg-accent text-black rounded-full flex items-center justify-center mx-auto mb-2 text-xl">
                            <i className="fa-solid fa-user-plus"></i>
                        </div>
                        <h3 className="font-bold">Invite Friends</h3>
                        <p className="text-xs text-secondary">Earn 500 XP for every friend who joins the hunt.</p>
                        <button className="w-full py-2 bg-accent text-black font-bold text-xs rounded-lg mt-2 hover:opacity-90 transition-opacity">
                            COPY LINK
                        </button>
                    </div>
                </div>
            </section>

        </div>
      </div>
    </div>
  );
}
