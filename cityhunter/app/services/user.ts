import { fetchWithAuth } from "../lib/api";
import { UserProfileData } from '../types/profile';

export const UserService = {
  /**
    * Fetch the current user's full profile.
    */
  getMe: async (token: string): Promise<UserProfileData> => {
    try {
      // fetchWithAuth handles the token via cookie, so 'token' arg is technically optional/unused/redundant here
      // depending on lib/api.ts implementation, but passing it won't hurt if we relied on arg
      // However, lib/api.ts gets it from cookie.
      return await fetchWithAuth('/users/profile/me');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Fetch a user profile by ID.
   */
  getUserById: async (userId: string, token: string): Promise<UserProfileData> => {
    try {
        return await fetchWithAuth(`/users/profile/${userId}`);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
  }
};
