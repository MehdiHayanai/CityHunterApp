# Dashboard Data Interfaces Guide

This guide defines the data structures used for the main dashboard content: **Monuments**, **Events**, and **Walks**. These interfaces ensure data consistency across the map, list, and interactive elements.

---

## 1. Monument Interface
**Definition:** `app/interfaces/dashboard.ts`

Defines static locations like landmarks, hidden gems, or cyberpunk hubs.

```typescript
export interface Monument {
  id: number;       // Unique identifier
  name: string;     // Title text
  type: string;     // Category (e.g., 'Cyberpunk', 'Legacy')
  address: string;  // Location string
  likes: string;    // Social proof (e.g., "12.4k")
  visitors: string; // Visitor count
  xp?: number;      // (Optional) XP reward
  swagg?: string;   // (Optional) Collectible reward
  dist: string;     // Distance string
  rating: number;   // 0-5 Star rating
  img: string;      // Image URL
  lat: number;      // Latitude
  lng: number;      // Longitude
  status: string;   // Badge text (e.g., 'HIGH YIELD')
}
```

### Usage Example
```typescript
{ 
  id: 1, 
  name: "Neo-Shinjuku Hub", 
  type: "Cyberpunk",
  address: "Tokyo, Japan",
  likes: "12k",
  visitors: "500",
  dist: "0.5 km",
  rating: 4.8,
  img: "https://...",
  lat: 35.6915, 
  lng: 139.7034,
  status: 'ACTIVE'
}
```

---

## 2. Event Interface
**Definition:** `app/interfaces/dashboard.ts`

Defines temporary or time-sensitive occurrences. Very similar to `Monument` but often includes specific `swagg` rewards and status indicators like 'TONIGHT' or 'LIVE'.

```typescript
export interface Event {
  id: number;
  name: string;
  type: string;
  address: string;
  likes: string;
  visitors: string;
  swagg: string;    // REQUIRED for events (unlike Monuments)
  xp?: number;      
  dist: string;
  rating: number;
  img: string;
  lat: number;
  lng: number;
  status: string;   // e.g., 'TONIGHT', 'WEEKEND', 'LIVE'
}
```

### Key Differences from Monument
- **`swagg` is usually required/prominent**: Events are often driven by exclusive rewards.
- **`status` implies time**: e.g., 'LIVE' vs 'OPEN'.

### Usage Example
```typescript
{
  id: 201, 
  name: "Techno-Shaman Ritual", 
  type: "Cyberpunk", 
  address: "Womb Club, Shibuya", 
  likes: "2.1k", 
  visitors: "500+", 
  swagg: "Neon Demon Pin", 
  dist: "2.3 km", 
  rating: 4.7, 
  img: "https://...", 
  lat: 35.6585, 
  lng: 139.6990, 
  status: 'TONIGHT' 
}
```

---

## 3. Walk Interface
**Definition:** `app/interfaces/dashboard.ts`

Defines a curated route consisting of multiple stops (which are ID references to Monuments or Events).

```typescript
export interface Walk {
  id: number;
  name: string;     // Route Title
  desc: string;     // Brief description of the experience
  difficulty: "Easy" | "Medium" | "Hard"; 
  estTime: string;  // e.g., "2h 30m"
  stopIds: number[]; // Array of Monument/Event IDs to visit in order
}
```

### Logic
- **`stopIds`**: Connects the walk to valid `Monument` or `Event` IDs.
- If an ID in `stopIds` does not exist in the `MONUMENTS` or `EVENTS` arrays, it will simply be ignored by the UI (or flagged as a bug).

### Usage Example
```typescript
{
    id: 301,
    name: "Neon Nights Run",
    desc: "A high-octane tour of the city's brightest cyber-hubs.",
    difficulty: "Hard",
    estTime: "2h 30m",
    stopIds: [1, 8, 5, 7, 201] // Links to Neo-Shinjuku (1), Synth-Noodle (8), etc.
}
```
