# Backend Specification & Feature Requirements

## 1. Overview
This document outlines the backend requirements to support the CityHunter application as currently implemented in the frontend. The backend needs to handle user authentication, gamified content delivery (walks, monuments), real-time social features, and persistent quest state synchronization.

## 2. Core Services & Features

### 2.1 User Management (Identity Service)
**Responsibility**: Handle user lifecycle, authentication, and profile data.
- **Operations**:
    - `register(email, password, handle)`: Create new user.
    - `login(email, password)`: Issue JWT/Session token.
    - `getProfile(userId)`: Retrieve detailed profile (stats, level, avatar).
    - `updateProfile(userId, data)`: Update settings or avatar.
- **Objects**:
    - `User`: Standard auth entity.
    - `UserProfile`: Extended data (Level, Title, XP, JoinedDate).

### 2.2 Content Delivery (City Data Service)
**Responsibility**: storage and retrieval of static and dynamic game world data.
- **Features**:
    - **Monuments & Events**: Retrieve POIs based on location or category.
    - **Dynamic Walks**: Support for both "Official" curated walks and "User-Created" custom routes.
- **Operations**:
    - `getDashboardItems(lat, lng, radius)`: Fetch `Monument` and `Event` objects nearby.
    - `getWalks(filter)`: Fetch list of available walks (Official + Community).
    - `getWalkDetails(walkId)`: Get full route with ordered `stopIds`.
- **Objects**:
    - `Monument`: Location data, history, swagg reward.
    - `Event`: Time-limited POIs with status (LIVE, WEEKEND).
    - `Walk`: Ordered collection of POIs with difficulty and estimated time.

### 2.3 Gamification & Progression (Quest Engine)
**Responsibility**: Track user progress, active missions, and rewards.
- **Features**:
    - **Quest Persistence**: Sync the `QuestState` from the frontend (Active Walk, Current Stop, XP Gained) to the cloud to allow cross-device play.
    - **XP System**: Validate and apply XP gains from completed stops and quizzes.
    - **Inventory/Swagg**: Management of collected digital items.
- **Operations**:
    - `syncQuestState(userId, state)`: Periodic auto-save of active quest progress.
    - `completeStop(userId, encounterId, result)`: Server-side validation of a quiz or check-in.
    - `finishWalk(userId, walkId, summary)`: Finalize visual summary and commit rewards to history.
- **Objects**:
    - `QuestState`: JSON object mirroring frontend state (activeWalkId, currentStopIndex, etc.).
    - `MissionHistory`: Log of completed activities.
    - `Achievement`: Unlockable milestones.

### 2.4 Social Hub (Community Service)
**Responsibility**: Drive engagement through interaction.
- **Features**:
    - **Activity Feed**: Aggregated timeline of friends' actions (Walks finished, badges earned).
    - **Trending Walks**: Algorithm to rank walks based on recent "Visitors" and "Ratings".
    - **Friend Graph**: Follow/Unfollow logic.
- **Operations**:
    - `getFeed(userId)`: Return paginated `ActivityFeedItem` list.
    - `getTrendingWalks()`: Return top X walks sorted by popularity.
    - `friendAction(action, targetId)`: Send request, accept, or remove friend.
- **Objects**:
    - `ActivityFeedItem`: Polymorphic object (Type: 'walk'|'badge'|'event').
    - `Friend`: Connection entity.

## 3. Data Objects Specification

### User Profile Model
```json
{
  "id": "u_123",
  "handle": "NeonHunter",
  "level": 5,
  "xp": 12500,
  "stats": {
    "distance": "42km",
    "cities": 3,
    "secrets": 12
  },
  "collection": ["item_id_1", "item_id_2"]
}
```

### Walk Model
```json
{
  "id": "w_55",
  "name": "Cyberpunk Circuit",
  "difficulty": "Hard",
  "stops": [201, 305, 204], // References Monument IDs
  "metrics": {
    "rating": 4.8,
    "visitors": 12050
  }
}
```

### Activity Feed Item
```json
{
  "id": "feed_99",
  "actorId": "u_456",
  "type": "COMPLETED_WALK",
  "payload": {
    "walkId": "w_55",
    "walkName": "Cyberpunk Circuit",
    "image": "url_to_snapshot"
  },
  "timestamp": "2026-01-03T12:00:00Z"
}
```

## 4. Integration Requirements
1.  **Real-time Updates**: WebSockets or SSE for accurate "Live Events" status and instant "Friend Activity" notifications.
2.  **Geo-Spatial Querying**: Database must support spatial indexing (e.g., PostGIS, MongoDB GeoJSON) to efficiently "find monuments near me".
3.  **Security**: 
    - Validate all "XP Earned" requests on the server to prevent cheating.
    - `QuestState` should be sanitized before storage.
