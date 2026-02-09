
export interface ActivityFeedItem {
  id: number;
  userId: number;
  userAvatar: string;
  userName: string;
  action: 'completed_walk' | 'earned_badge' | 'joined_event';
  targetName: string; // Name of walk, badge, or event
  targetId?: number; // ID for linking
  timestamp: string;
  image?: string; // Optional image (e.g., photo from walk)
  likes: number;
  comments: number;
}

export interface TrendingWalkData {
    id: number;
    name: string;
    description: string;
    image: string;
    rating: number; // 0-5
    visitors: number; // "12k"
    difficulty: "Easy" | "Medium" | "Hard";
    estTime: string;
}
