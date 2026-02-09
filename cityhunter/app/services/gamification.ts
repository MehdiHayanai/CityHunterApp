import { fetchWithAuth } from "@/app/lib/api";
import { LevelNode } from '../types/profile';

export const GamificationService = {
  /**
   * Fetch all level definitions and rewards.
   */
  getLevels: async (): Promise<LevelNode[]> => {
    try {
      // Check Cache
      const CACHE_KEY = 'gamification_levels';
      const CACHE_TIME_KEY = 'gamification_levels_timestamp';
      const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in ms

      if (typeof window !== 'undefined') {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

        if (cachedData && cachedTime) {
            const age = Date.now() - parseInt(cachedTime, 10);
            if (age < CACHE_DURATION) {
                console.log("Using cached levels data");
                return JSON.parse(cachedData);
            }
        }
      }

      const data = await fetchWithAuth('/gamification/levels');

      // Set Cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching levels:', error);
      throw error;
    }
  },

  /**
   * Record a visit to a POI to award XP.
   * @param poiId The ID of the POI visited.
   * @param token The user's auth token. (Deprecated: fetchWithAuth handles this)
   */
  visitPOI: async (poiId: string, token: string) => {
    try {
      return await fetchWithAuth(`/gamification/visit?poi_id=${poiId}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error visiting POI:', error);
      throw error;
    }
  }
};
