# Backend Integration

This document describes how the CityHunter frontend integrates with the FastAPI backend, including API structure, authentication, and data models.

## Backend Overview

The backend is a FastAPI application located at:
```
c:\Users\Lenovo\GIT\cityHunter\vibe\hunterBack
```


## Core Services

### 1. User Management (Identity Service)

**Responsibility**: Handle user lifecycle, authentication, and profile data.

#### Operations
- `POST /auth/register` - Create new user
  - Body: `{ email, password, handle }`
  - Returns: User object

- `POST /auth/login` - Authenticate user
  - Body: `{ email, password }`
  - Returns: `{ access_token, user }`

- `GET /users/profile` - Get current user profile
  - Headers: `Authorization: Bearer <token>`
  - Returns: `UserProfile` with stats, level, XP

- `PUT /users/profile` - Update profile
  - Body: `{ avatar, settings, ... }`
  - Returns: Updated `UserProfile`

#### Data Models

```typescript
interface User {
  id: string;
  email: string;
  handle: string;
  created_at: string;
}

interface UserProfile extends User {
  level: number;
  xp: number;
  title: string;
  avatar?: string;
  stats: {
    distance: string;
    cities: number;
    secrets: number;
  };
  collection: string[];  // Collected item IDs
}
```

### 2. Content Delivery (City Data Service)

**Responsibility**: Storage and retrieval of POIs and walks.

#### Operations

- `GET /pois` - List points of interest
  - Query params: `lat`, `lng`, `radius`, `type`
  - Returns: Array of `Monument` or `Event` objects

- `POST /pois/monument` - Create monument (admin)
  - Body: `{ name, description, location, architectural_style, opening_rules }`

- `POST /pois/event` - Create event (admin)
  - Body: `{ name, description, location, start_time, end_time, ticket_link }`

- `GET /walks` - List available walks
  - Query params: `filter`, `difficulty`
  - Returns: Array of `Walk` objects

- `GET /walks/{id}` - Get walk details
  - Returns: Full `Walk` with ordered stops

#### Data Models

```typescript
interface Monument {
  id: string;
  name: string;
  description: string;
  location: {
    type: "Point";
    coordinates: [number, number];  // [lng, lat]
  };
  architectural_style?: string;
  opening_rules?: OpeningRule[];
  swagg_reward?: string;
  quiz?: Quiz;
}

interface Event {
  id: string;
  name: string;
  description: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  start_time: string;
  end_time: string;
  status: "LIVE" | "WEEKEND" | "UPCOMING";
  ticket_link?: string;
}

interface Walk {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  stops: string[];  // POI IDs in order
  estimated_time: number;  // minutes
  distance: number;  // meters
  metrics: {
    rating: number;
    visitors: number;
  };
  status: "DRAFT" | "PUBLISHED";
}
```

### 3. Gamification & Progression (Quest Engine)

**Responsibility**: Track progress, validate achievements, manage XP.

#### Operations

- `POST /quests/start` - Start a walk session
  - Body: `{ walk_id }`
  - Returns: `QuestSession` with initial state

- `POST /quests/unlock-stop` - Attempt to unlock a stop
  - Body: `{ poi_id, lat, lng }`
  - Returns: `{ success, hidden_description?, quiz? }`
  - Logic: Validates proximity (within 75m)

- `POST /quests/submit-quiz` - Submit quiz answer
  - Body: `{ quiz_id, answer }`
  - Returns: `{ correct, xp_earned, explanation }`

- `POST /quests/complete` - Finish a walk
  - Body: `{ walk_id, summary }`
  - Returns: `{ total_xp, achievements_unlocked }`

- `GET /gamification/levels` - Get level definitions
  - Returns: Array of level thresholds and requirements

#### Data Models

```typescript
interface QuestSession {
  id: string;
  user_id: string;
  walk_id: string;
  started_at: string;
  current_stop_index: number;
  completed_stops: string[];
  xp_earned: number;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
}

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  xp_reward: number;
}

interface Level {
  level: number;
  xp_required: number;
  title: string;
  rewards?: string[];
}
```

### 4. Chat Service (AI Assistant)

**Responsibility**: Conversational AI for city exploration.

#### Operations

- `POST /chat/sessions` - Create chat session
  - Returns: `{ session_id }`

- `POST /chat/message` - Send message
  - Body: `{ session_id, message, lat?, lng? }`
  - Returns: `{ response, sources? }`

- `GET /chat/sessions/{id}` - Get session history
  - Returns: Array of messages

#### Custom Tools

The AI assistant has access to:
- **search_monuments**: Find nearby monuments
- **search_walks**: Discover available walks
- **Google Search**: General information lookup
- **Wikipedia**: Historical context

### 5. Social Hub (Community Service)

**Responsibility**: Social features and community engagement.

> [!NOTE]
> Social features are currently in development.

#### Planned Operations

- `GET /social/feed` - Get activity feed
- `GET /social/trending` - Get trending walks
- `POST /social/friends/{action}` - Manage friendships

## Authentication Flow

### Login Process

```
1. User submits credentials to /api/v1/auth/login
2. Frontend proxy injects x-api-key header
3. Backend validates credentials
4. Backend returns JWT access token
5. Frontend stores token in authStore
6. Token automatically included in subsequent requests
```

### Protected Requests

```typescript
// Frontend automatically includes JWT in requests
const response = await fetch('/api/v1/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## API Proxy Architecture

The frontend uses a server-side proxy to protect the API key:

```
Client Request → Next.js Proxy → FastAPI Backend
                 (/api/v1/*)     (http://backend:8000/api/v1/*)
                 [Injects x-api-key]
```

**Proxy Route**: `app/api/v1/[...path]/route.ts`

Benefits:
- ✅ API key never exposed to client
- ✅ Maintains backend API protection
- ✅ Works with existing JWT authentication

## GeoJSON Coordinate Format

> [!IMPORTANT]
> **Coordinate Order**: MongoDB/GeoJSON uses `[longitude, latitude]`, but Leaflet uses `[latitude, longitude]`. Always convert when sending/receiving data.

```typescript
// Backend (GeoJSON)
location: {
  type: "Point",
  coordinates: [lng, lat]  // [2.3522, 48.8566]
}

// Frontend (Leaflet)
position: [lat, lng]  // [48.8566, 2.3522]
```

## Error Handling

### Standard Error Response

```typescript
interface APIError {
  detail: string;
  status_code: number;
  error_type?: string;
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity (invalid data)
- `500` - Internal Server Error

## Integration Requirements

### Real-time Updates
- WebSockets or SSE for live events (planned)
- Instant friend activity notifications (planned)

### Geo-Spatial Querying
- MongoDB with GeoJSON support
- Spatial indexing for efficient "near me" queries
- Radius-based searches

### Security
- All XP gains validated server-side
- Quest state sanitized before storage
- Rate limiting on sensitive endpoints

## API Client

The frontend uses a centralized API client (`app/lib/api.ts`):

```typescript
const API_BASE_URL = '/api/v1';  // Uses proxy

export const api = {
  get: (endpoint: string) => fetch(`${API_BASE_URL}${endpoint}`),
  post: (endpoint: string, data: any) => 
    fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  // ... other methods
};
```

## Next Steps

- [Security Documentation](security.md) - Detailed security implementation
- [API Reference](../reference/api-endpoints.md) - Complete endpoint documentation
- [Data Models](../reference/data-models.md) - Full schema definitions
