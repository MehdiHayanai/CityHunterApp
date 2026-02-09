import { fetchWithAuth } from "../lib/api";
import { ActivityFeedItem, Friendship } from "../interfaces/social";

export const socialService = {
  followUser: async (userId: string): Promise<Friendship> => {
    return fetchWithAuth(`/social/follow/${userId}`, {
      method: 'POST',
    });
  },

  unfollowUser: async (userId: string): Promise<void> => {
    return fetchWithAuth(`/social/unfollow/${userId}`, {
      method: 'POST',
    });
  },

  getFeed: async (limit = 20, offset = 0): Promise<ActivityFeedItem[]> => {
    return fetchWithAuth(`/social/feed?limit=${limit}&offset=${offset}`);
  },

  getTrendingWalks: async () => {
    return fetchWithAuth(`/social/trending`);
  }
};
