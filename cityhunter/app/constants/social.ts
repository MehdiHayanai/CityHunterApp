import { TrendingWalkData } from "../types/social";



export const MOCK_TRENDING_WALKS: TrendingWalkData[] = [
    {
        id: 401,
        name: "The Iron Circuit",
        description: "A high-altitude tour starting at the Iron Lady and ending at the Arch.",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg?width=800",
        rating: 4.8,
        visitors: 15400,
        difficulty: "Medium",
        estTime: "1h 30m"
    },
    {
        id: 402,
        name: "Gothic Shadows",
        description: "Explore the darker side of Paris history, from ruins to the underground.",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Notre-Dame_de_Paris_2013-07-24.jpg?width=800",
        rating: 4.9,
        visitors: 22000,
        difficulty: "Hard",
        estTime: "2h 45m"
    },
    {
        id: 403,
        name: "Art & Glitch Path",
        description: "A creative run through the city's most inspiring art hubs.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/2560px-Louvre_Museum_Wikimedia_Commons.jpg?20161126115921",
        rating: 4.7,
        visitors: 8500,
        difficulty: "Easy",
        estTime: "3h 00m"
    },
     {
        id: 499, // Unique ID for coming soon item
        name: "Midnight Runners (Beta)",
        description: "A challenging route designed for the night owls. (Coming Soon)",
        image: "https://images.unsplash.com/photo-1555590924-f7614e590408?q=80&w=2071&auto=format&fit=crop",
        rating: 4.5,
        visitors: 5600,
        difficulty: "Hard",
        estTime: "3h 00m"
    }
];
