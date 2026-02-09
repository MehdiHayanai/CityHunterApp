import { Category, DashboardItem, Event, Monument, Walk } from "../interfaces/dashboard";

/* --- CATEGORIES --- */
export const CATEGORIES: Category[] = [
  { id: 'all', icon: 'fa-globe', label: 'All Sectors', typeValue: null },
  { id: 'cyber', icon: 'fa-microchip', label: 'Cyberpunk', typeValue: 'Cyberpunk' },
  { id: 'history', icon: 'fa-landmark', label: 'Legacy', typeValue: 'Legacy' },
  { id: 'art', icon: 'fa-palette', label: 'Art Ops', typeValue: 'Art Ops' },
  { id: 'food', icon: 'fa-utensils', label: 'Rations', typeValue: 'Rations' }
];

/* --- MONUMENTS (PARIS ONLY) --- */
// IDs: 201 - 299
export const MONUMENTS: Monument[] = [
  {
    id: 201,
    name: "Iron Lady (Eiffel Tower)",
    type: "Landmark",
    address: "Champ de Mars, 5 Av. Anatole France, Paris",
    likes: "842k",
    visitors: "2.1k",
    xp: 1500,
    swagg: "Iron Lattice Fragment",
    dist: "0.8 km",
    rating: 4.8,
    // Stable Wikimedia Link
    img: "https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg?width=800",
    lat: 48.8584,
    lng: 2.2945,
    status: 'LEGENDARY'
  },
  {
    id: 202,
    name: "Louvre Pyramid",
    type: "Art Hub",
    address: "Rue de Rivoli, 75001 Paris",
    likes: "620k",
    visitors: "1.8k",
    xp: 1200,
    swagg: "Glass Prism",
    dist: "3.2 km",
    rating: 4.7,
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/2560px-Louvre_Museum_Wikimedia_Commons.jpg?20161126115921",
    lat: 48.8606,
    lng: 2.3376,
    status: 'HIGH TRAFFIC'
  },
  {
    id: 203,
    name: "Notre-Dame Ruins",
    type: "Legacy",
    address: "6 Parvis Notre-Dame - Pl. Jean-Paul II, Paris",
    likes: "410k",
    visitors: "950",
    xp: 2000,
    swagg: "Gargoyle Essence",
    dist: "2.1 km",
    rating: 4.9,
    img: "https://commons.wikimedia.org/wiki/Special:FilePath/Notre-Dame_de_Paris_2013-07-24.jpg?width=800",
    lat: 48.8529,
    lng: 2.3500,
    status: 'RESTORATION'
  },
  {
    id: 204,
    name: "Arc de Triomphe",
    type: "Structure",
    address: "Pl. Charles de Gaulle, 75008 Paris",
    likes: "320k",
    visitors: "1.2k",
    xp: 800,
    dist: "4.5 km",
    rating: 4.6,
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Arc_de_Triomphe_de_l%27%C3%89toile_in_July_2011.jpg/640px-Arc_de_Triomphe_de_l%27%C3%89toile_in_July_2011.jpg",
    lat: 48.8738,
    lng: 2.2950,
    status: 'ACTIVE'
  },
  {
    id: 205,
    name: "Sacré-Cœur Basilica",
    type: "Religious",
    address: "35 Rue du Chevalier de la Barre, 75018 Paris",
    likes: "280k",
    visitors: "600",
    xp: 1100,
    swagg: "White Stone",
    dist: "5.1 km",
    rating: 4.5,
    img: "https://commons.wikimedia.org/wiki/Special:FilePath/Sacre_Coeur_Paris.jpg?width=800",
    lat: 48.8867,
    lng: 2.3431,
    status: 'ELEVATED'
  }
];

/* --- EVENTS (PARIS ONLY) --- */
// IDs: 301 - 399
export const EVENTS: Event[] = [
  { 
    id: 301, 
    name: "La Défense Cyber-Hack", 
    type: "Cyberpunk", 
    address: "La Défense, Puteaux", 
    likes: "15k", 
    visitors: "10k+", 
    swagg: "Corporate Keycard", 
    dist: "6.2 km", 
    rating: 4.9, 
    img: "https://commons.wikimedia.org/wiki/Special:FilePath/La_Defense_Paris.jpg?width=800", 
    lat: 48.8922, 
    lng: 2.2370, 
    status: 'TONIGHT' 
  },
  { 
    id: 302, 
    name: "Catacombs Rave", 
    type: "Underground", 
    address: "1 Av. du Colonel Henri Rol-Tanguy", 
    likes: "8.2k", 
    visitors: "300+", 
    swagg: "Bone Token", 
    dist: "3.5 km", 
    rating: 4.8, 
    img: "https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?width=800", 
    lat: 48.8338, 
    lng: 2.3324, 
    status: 'SECRET' 
  },
  { 
    id: 303, 
    name: "Seine Holo-Show", 
    type: "Art Ops", 
    address: "Pont Alexandre III, Paris", 
    likes: "45k", 
    visitors: "5k+", 
    swagg: "River Glitch Pin", 
    dist: "1.1 km", 
    rating: 4.7, 
    img: "https://images.pexels.com/photos/35415047/pexels-photo-35415047.jpeg?width=800", 
    lat: 48.8639, 
    lng: 2.3135, 
    status: 'LIVE' 
  },
  { 
    id: 304, 
    name: "Le Marais Vintage Expo", 
    type: "Rations", 
    address: "Le Marais, 4th Arr.", 
    likes: "12k", 
    visitors: "2k+", 
    swagg: "Retro Macaron", 
    dist: "2.8 km", 
    rating: 4.6, 
    img: "https://images.pexels.com/photos/2607308/pexels-photo-2607308.jpeg?width=800", 
    lat: 48.8575, 
    lng: 2.3592, 
    status: 'WEEKEND' 
  },
  { 
    id: 305, 
    name: "Montmartre AI Canvas", 
    type: "Art Ops", 
    address: "Place du Tertre, 75018 Paris", 
    likes: "9.1k", 
    visitors: "1.5k", 
    swagg: "Digital Brush", 
    dist: "5.2 km", 
    rating: 4.5, 
    img: "https://images.pexels.com/photos/3073666/pexels-photo-3073666.jpeg?width=800", 
    lat: 48.8865, 
    lng: 2.3408, 
    status: 'LIMITED' 
  }
];

/* --- WALKS (PARIS ONLY) --- */
// IDs: 401 - 499
export const WALKS: Walk[] = [
  {
      id: 401,
      name: "The Iron Circuit",
      desc: "A high-altitude tour starting at the Iron Lady and ending at the Arch.",
      difficulty: "Medium",
      estTime: "1h 30m",
      stopIds: [201, 303, 204] // Eiffel -> Seine Show -> Arc de Triomphe
  },
  {
      id: 402,
      name: "Gothic Shadows",
      desc: "Explore the darker side of Paris history, from ruins to the underground.",
      difficulty: "Hard",
      estTime: "2h 45m",
      stopIds: [203, 304, 302] // Notre Dame -> Marais -> Catacombs
  },
  {
      id: 403,
      name: "Art & Glitch Path",
      desc: "A creative run through the city's most inspiring art hubs.",
      difficulty: "Easy",
      estTime: "3h 00m",
      stopIds: [202, 305, 205] // Louvre -> Montmartre AI -> Sacré-Cœur
  }
];

/* --- HELPER FUNCTIONS --- */

export const getItemById = (id: number | string): DashboardItem | undefined => {
  return MONUMENTS.find(m => m.id === id) || EVENTS.find(e => e.id === id);
};

export const getLorem = (type: string) => {
    if (type === 'Cyberpunk') return "The neon-soaked streets of Paris pulse with the rhythm of the data-grid. Originally built as a neural-link hub in 2042, this sector now serves as a gathering ground for hackers and net-runners.";
    if (type === 'Legacy') return "Steeped in history, this location stands as a testament to the old French Republic. The stone architecture contrasts sharply with the holographic skyline, offering a quiet sanctuary.";
    if (type === 'Rations') return "Famous for its synthetic croissants and gene-spliced wines, this spot has been a favorite for night-shifters for decades. The chef claims to have served the President of the Federation.";
    return "A key location in the Paris grid. Experience the vibe and collect data tokens while you explore the City of Light.";
};
