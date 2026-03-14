
import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authService } from '../app/services/auth';
import { GamificationService } from '../app/services/gamification';

import { UserProfileData, LevelNode } from '../app/types/profile';
import { USER_PROFILE_DATA as DEFAULT_PROFILE } from '../app/constants/user-profile';

// Mapper to convert Backend Response -> UI Profile Data
const mapBackendToUser = (backendUser: any, levels: LevelNode[] = []): UserProfileData => {
  const currentLevel = backendUser.level || 1;
  
  // Find next level node
  const nextLevelNode = levels.find((l: LevelNode) => l.level === currentLevel + 1);
  // Default to current XP + 5000 if max level or not found
  const nextLevelXp = nextLevelNode ? nextLevelNode.xp : (backendUser.xp || 0) + 5000;

  return {
    ...DEFAULT_PROFILE, // Fallback to default for missing fields
    id: backendUser.id || DEFAULT_PROFILE.id,
    name: backendUser.handle || backendUser.email || "Explorer", // Backend doesn't have name yet
    handle: backendUser.handle || "Explorer",
    email: backendUser.email,
    level: currentLevel,
    xp: backendUser.xp || 0,
    nextLevelXp: nextLevelXp,
    // Backend stats: { distance: "0km", cities: 0, secrets: 0 }
    stats: {
        ...DEFAULT_PROFILE.stats,
        ...backendUser.stats
    },
    // Backend collection is list[str], UI expects SwaggItem[]
    // We'll just mock this mapping for now or leave it empty if string list
    collection: DEFAULT_PROFILE.collection, 
    joined: backendUser.joined_date ? new Date(backendUser.joined_date).toLocaleDateString() : DEFAULT_PROFILE.joined,
    // Preserve default complex objects for now as backend doesn't support them yet
    achievements: DEFAULT_PROFILE.achievements,
    history: DEFAULT_PROFILE.history,
    friends: DEFAULT_PROFILE.friends,
    levelTree: DEFAULT_PROFILE.levelTree,
    // TODO Change the default role from admin to user
    role: backendUser.role || 'admin' // Default to 'user' if not present
  };
};

interface AuthState {
  user: UserProfileData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  levelUpData: { newLevel: number } | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearLevelUp: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading to check auth on mount
  levelUpData: null,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      // Access Token
      const token = response.access_token;
      
      // Set cookie (expires in 7 days)
      Cookies.set('access_token', token, { expires: 7, sameSite: 'Strict' });

      // Fetch user data immediately
      const userData = await authService.getMe();
      
      // Fetch Levels for XP calc
      let levels: LevelNode[] = [];
      try {
        levels = await GamificationService.getLevels();
      } catch (e) {
        console.warn("Failed to fetch levels during login, using defaults");
      }

      const mappedUser = mapBackendToUser(userData, levels);

      set({ 
        user: mappedUser, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    Cookies.remove('access_token');
    authService.logout(); // Clears any other local storage if needed
    
    // Clear application state to prevent leaking to the next user
    if (typeof window !== 'undefined') {
        localStorage.removeItem('cityhunter_quest_state');
        localStorage.removeItem('custom_walks');
        localStorage.removeItem('cityhunter_map_center');
        localStorage.removeItem('cityhunter_map_zoom');
        localStorage.removeItem('cityhunter_active_session');
        localStorage.removeItem('cityhunter_chat_session_id');
    }

    set({ user: null, isAuthenticated: false });
    // Optional: Redirect to login
    // Force full reload to clear state
    window.location.assign('/login');
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const token = Cookies.get('access_token');

    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const userData = await authService.getMe();
      
      // Fetch Levels for XP calc
      let levels: LevelNode[] = [];
      try {
        levels = await GamificationService.getLevels();
      } catch (e) {
        console.warn("Failed to fetch levels during auth check, using defaults");
      }

      const mappedUser = mapBackendToUser(userData, levels);
      set({ user: mappedUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // Token probably invalid/expired
      Cookies.remove('access_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const currentUser = get().user;
      const userData = await authService.getMe();
      
      let levels: LevelNode[] = [];
      try {
        levels = await GamificationService.getLevels();
      } catch (e) {
        console.warn("Failed to fetch levels during refresh, using defaults");
      }

      const mappedUser = mapBackendToUser(userData, levels);
      
      // Check if level increased
      if (currentUser && mappedUser.level > currentUser.level) {
        set({ 
          user: mappedUser,
          levelUpData: { newLevel: mappedUser.level }
        });
      } else {
        set({ user: mappedUser });
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  },

  clearLevelUp: () => {
    set({ levelUpData: null });
  }
}));
