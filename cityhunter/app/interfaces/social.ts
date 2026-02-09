export interface Friendship {
  follower_id: string;
  followed_id: string;
  created_at: string;
}

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  type: 'walk_completed' | 'level_up' | 'badge_earned' | 
        'walk_started' | 'friend_joined' | 'achievement_unlocked'; 
  target_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SocialUser {
  id: string;
  handle: string;
  avatar_url?: string;
  level: number;
}
