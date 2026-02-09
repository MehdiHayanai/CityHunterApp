export interface Achievement {
  id: number;
  name: string;
  icon: string;
  desc: string;
  unlocked: boolean;
}

export interface SwaggItem {
  id: number;
  name: string;
  type: 'footwear' | 'headgear' | 'gadget' | 'accessory';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

export interface Mission {
  id: number;
  type: 'walk' | 'monument' | 'event';
  city: string;
  zone: string;
  date: string;
  score: number;
  status: 'Complete' | 'Incomplete';
  xp: number;
  swagg: string | null;
}

export interface LevelNode {
  level: number;
  xp: number;
  title: string;
  reward: string;
}

export interface Friend {
  id: number;
  name: string;
  handle: string;
  level: number;
  xp: number;
  avatar: string;
  status: 'online' | 'offline';
  isMe?: boolean;
}

export interface UserStats {
  distance: string;
  cities: number;
  secrets: number;
  perfectRuns: number;
}

export interface UserProfileData {
  id: number;
  name: string;
  handle: string;
  email?: string;
  level: number;
  title: string;
  xp: number;
  nextLevelXp: number;
  joined: string;
  avatar?: string; // Initial/Icon string if no image
  stats: UserStats;
  achievements: Achievement[];
  collection: SwaggItem[];
  history: Mission[];
  friends: Friend[]; // The user's friend list
  levelTree: LevelNode[]; // Progression tree (usually static global data, but kept here for now)
  role?: 'admin' | 'user'; // Optional role for access control
}
