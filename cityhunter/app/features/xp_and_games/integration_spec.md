# XP and Games Integration Specification

This document outlines how to integrate the frontend with the backend API for XP, Levels, and Gamification features.

## Backend Base URL
`http://localhost:8000`

## Authentication
All protected endpoints require a Bearer token in the `Authorization` header.
`Authorization: Bearer <your_access_token>`

## API Endpoints

### 1. Fetch Levels
**Endpoint:** `GET /api/v1/gamification/levels`
**Description:** Returns the full list of levels, XP thresholds, titles, and rewards.
**Usage:** Call this on app initialization or when loading the "Levels" tab in the user profile.

**Response Example:**
```json
[
  {
    "level": 1,
    "xp": 0,
    "title": "Tourist",
    "reward": "Basic Map Access"
  },
  {
    "level": 2,
    "xp": 500,
    "title": "Wanderer",
    "reward": "Custom Avatar Frame"
  }
]
```

### 2. Fetch User Profile
**Endpoint:** `GET /api/v1/users/profile/me`
**Description:** Returns the current logged-in user's profile, including current level, total XP, and stats.
**Usage:** Use this to populate the User Profile header and XP progress bar.

**Response Example:**
```json
{
  "id": "user_uuid",
  "email": "user@example.com",
  "handle": "UserHandle",
  "level": 5,
  "xp": 5100,
  "title": "Explorer",
  "is_verified": true
}
```

### 3. Award XP (Visit POI)
**Endpoint:** `POST /api/v1/gamification/visit`
**Query Parameters:** `poi_id` (string)
**Description:** Records a visit to a POI and awards XP. Handles decay logic automatically.
**Usage:** Call this when a user "checks in" or completes a visit to a monument/event.

**Response Example:**
```json
{
  "success": true,
  "xp_awarded": 100,
  "total_xp": 1500,
  "visit_count": 1,
  "leveled_up": false,
  "level_info": {
    "level": 3,
    "title": "Explorer"
  }
}
```

## Local Development Setup

1. **Ensure Backend is Running:**
   Navigate to `hunterBack` and run:
   ```bash
   uvicorn app.main:app --reload
   ```

2. **Frontend Service Implementation:**
   Create `app/services/gamification.ts` to encapsulate these API calls.

   ```typescript
   // Example Helper
   const API_URL = "http://localhost:8000/api/v1";

   export const getLevels = async (token: string) => {
     const res = await fetch(`${API_URL}/gamification/levels`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     return res.json();
   };
   ```

3. **Replace Hardcoded Constants:**
   Replace `TEST_LEVELS` in `app/constants/user-profile.ts` with calls to `getLevels()`.

## Data Types

### LevelNode
```typescript
interface LevelNode {
  level: number;
  xp: number;
  title: string;
  reward: string;
}
```

### UserProfile (Gamification Slice)
```typescript
interface UserGamificationData {
  level: number;
  xp: number;
  title: string;
  nextLevelXp?: number; // Calculated on frontend or added to backend response
}
```
