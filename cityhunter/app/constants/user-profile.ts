import { Achievement, SwaggItem, Mission, Friend, LevelNode, UserProfileData } from '../types/profile';

// --- 1. TEST DATA POOLS (Easily Modify Lists Here) ---

export const TEST_ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: "First Steps", icon: "fa-shoe-prints", desc: "Completed your first walk.", unlocked: true },
  { id: 2, name: "Night Owl", icon: "fa-moon", desc: "Completed a hunt after 10 PM.", unlocked: true },
  { id: 3, name: "Historian", icon: "fa-book-open", desc: "Answered 50 history trivia correctly.", unlocked: true },
  { id: 4, name: "Marathoner", icon: "fa-person-running", desc: "Walked 10km in a single session.", unlocked: false },
];

export const TEST_COLLECTION: SwaggItem[] = [
  { id: 1, name: "Neon Sneakers", type: "footwear", rarity: "rare", icon: "fa-shoe-prints" },
  { id: 2, name: "Cyber Mask", type: "headgear", rarity: "epic", icon: "fa-mask" },
  { id: 3, name: "Vintage Cam", type: "gadget", rarity: "common", icon: "fa-camera" },
  { id: 4, name: "Graffiti Tag", type: "accessory", rarity: "rare", icon: "fa-spray-can" },
];

export const TEST_MISSIONS: Mission[] = [
  { id: 101, type: "walk", city: "Paris, France", zone: "Le Marais Hidden Gems", date: "2 days ago", score: 98, status: "Complete", xp: 450, swagg: null },
  { id: 102, type: "monument", city: "Berlin, Germany", zone: "Brandenburg Gate", date: "1 week ago", score: 100, status: "Complete", xp: 150, swagg: "Berlin Bear Charm" },
  { id: 103, type: "event", city: "London, UK", zone: "Midnight Glitch Hunt", date: "2 weeks ago", score: 45, status: "Incomplete", xp: 50, swagg: null },
  { id: 104, type: "walk", city: "Tokyo, Japan", zone: "Shinjuku Neon Nights", date: "3 weeks ago", score: 100, status: "Complete", xp: 1200, swagg: "Cyber Mask" },
  { id: 105, type: "monument", city: "New York, USA", zone: "Statue of Liberty", date: "1 month ago", score: 92, status: "Complete", xp: 300, swagg: null },
  { id: 106, type: "event", city: "Barcelona, Spain", zone: "Gaudí's Lost Blueprint", date: "1 month ago", score: 78, status: "Complete", xp: 800, swagg: "Mosaic Fragment" },
  { id: 107, type: "walk", city: "Rome, Italy", zone: "Ancient Echoes", date: "2 months ago", score: 88, status: "Complete", xp: 600, swagg: null },
];

export const TEST_FRIENDS: Friend[] = [
  { id: 2, name: "Sarah Connor", handle: "@skynet_hunter", level: 8, xp: 18200, avatar: "SC", status: "online" },
  { id: 3, name: "John Doe", handle: "@johnd", level: 5, xp: 5100, avatar: "JD", status: "offline" },
  { id: 4, name: "Emily Paris", handle: "@em_in_paris", level: 7, xp: 13300, avatar: "EP", status: "online" },
  { id: 5, name: "Ryu Street", handle: "@hadouken", level: 3, xp: 1600, avatar: "RS", status: "offline" },
];

// --- 2. USER DEFINITIONS ---

export const USER_PROFILE_DATA: UserProfileData = {
  id: 1,
  name: "Alex Wanderer",
  handle: "@urban_nomad",
  level: 7,
  title: "Street Savant",
  xp: 12450,
  nextLevelXp: 17000,
  joined: "October 2024",
  stats: {
    distance: "42.5 km",
    cities: 3,
    secrets: 127,
    perfectRuns: 8
  },
  achievements: TEST_ACHIEVEMENTS,
  collection: TEST_COLLECTION,
  history: TEST_MISSIONS,
  friends: TEST_FRIENDS,
  levelTree: []
};

export const MOCK_USERS_DB: Record<string, UserProfileData> = {
  "1": USER_PROFILE_DATA,
  "2": {
    ...USER_PROFILE_DATA,
    id: 2,
    name: "Sarah Connor",
    handle: "@skynet_hunter",
    level: 8,
    title: "Resistance Leader",
    xp: 18200,
    nextLevelXp: 25000,
    stats: { distance: "89.2 km", cities: 5, secrets: 210, perfectRuns: 15 },
    collection: [
      { id: 1, name: "Plasma Rifle Prop", type: "gadget", rarity: "legendary", icon: "fa-gun" },
      { id: 2, name: "Terminator Sunglasses", type: "headgear", rarity: "epic", icon: "fa-glasses" },
    ],
    history: [
       { id: 201, type: "event", city: "Los Angeles, USA", zone: "Cyberdyne Systems Raid", date: "yesterday", score: 100, status: "Complete", xp: 2000, swagg: "Chip Fragment" }
    ]
  },
  "3": {
    ...USER_PROFILE_DATA,
    id: 3,
    name: "John Doe",
    handle: "@johnd",
    level: 5,
    title: "Casual Walker",
    xp: 5100,
    nextLevelXp: 8000,
    stats: { distance: "12.0 km", cities: 1, secrets: 15, perfectRuns: 1 },
    collection: [],
    history: []
  },
  "4": {
    ...USER_PROFILE_DATA,
    id: 4,
    name: "Emily Paris",
    handle: "@em_in_paris",
    level: 7,
    title: "Fashionista",
    xp: 13300,
    nextLevelXp: 17000,
    stats: { distance: "35.5 km", cities: 2, secrets: 88, perfectRuns: 5 },
    collection: [
        { id: 10, name: "Red Beret", type: "headgear", rarity: "rare", icon: "fa-hat-cowboy-side" }
    ]
  }
};

export const getUserById = (id: string): UserProfileData => {
  return MOCK_USERS_DB[id] || MOCK_USERS_DB["1"];
};
