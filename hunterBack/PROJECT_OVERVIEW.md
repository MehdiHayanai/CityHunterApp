# CityHunter Vibe Backend Project Overview

## 1. Project Description
**CityHunter Vibe** is a gamified urban exploration backend service. It powers a mobile application that allows users to explore their city, complete walking quests, answer quizzes about monuments, and earn XP to level up. The backend manages user progress, geospatial content delivery, and social interactions.

## 2. Technology Stack
- **Language**: Python 3.12+
- **Framework**: FastAPI (High-performance Async API)
- **Database**: MongoDB (via **Beanie** ODM & **Motor** Async Driver)
- **Authentication**: OAuth2 with JWT (JSON Web Tokens)
- **Testing**: Pytest (Asyncio integration)
- **Dependency Management**: uv / pip

## 3. Data Models (Current Implementation)
The application uses Beanie Document models to enforce schema and handle database interactions.

### User & Identity
- **User**: The primary user entity.
    - Fields: `id`, `email`, `hashed_password`, `handle`, `level` (int), `xp` (int), `stats` (UserStats), `collection` (List[str]).
    - **History**: `walks_history` (List[str]), `quizzes_history` (List[str]) - Tracks completed activities to prevent duplicate rewards.
    - **Security**: ID is stored as UUID string.

### Content (Geospatial)
- **Monument**: A point of interest.
    - Fields: `name`, `description`, `location` (GeoPoint: `{type: "Point", coordinates: [lng, lat]}`), `category`, `image_url`.
    - **Index**: 2dsphere index on `location` for `$near` queries.
- **Walk**: A curated path connecting multiple monuments.
    - Fields: `name`, `stops` (List[Monument IDs]), `difficulty`, `metrics` (rating, visitors).
- **Event**: Time-limited occurrences.
    - Fields: `location`, `start_time`, `end_time`, `status`.

### Gamification
- **Quiz**: Trivia questions linked to Monuments.
    - Fields: `monument_id`, `question`, `options`, `correct_answer` (index), `xp_reward`.
- **Level**: Configuration for progression.
    - Fields: `level_number`, `xp_threshold`, `rewards`.
- **QuestState**: Snapshots of a user's active game state (synced from client).
    - Fields: `user_id`, `active_walk_id`, `current_stop_index`, `visited_stop_ids`.

## 4. Implemented Features
### 4.1 Authentication & User Management
- **Registration/Login**: `/api/v1/auth/register` and `/api/v1/auth/access-token`.
- **Profile**: `/api/v1/users/profile/me` returns full user stats and progression.

### 4.2 Content Service
- **Geospatial Discovery**: `/api/v1/content/dashboard/items` finds monuments within a radius using MongoDB `$near`.
- **Walk Hydration**: `/api/v1/content/walks/{id}` returns full walk details, expanding standard Monument IDs into full objects.

### 4.3 Gamification Engine
- **Quizzes**:
    - `GET /api/v1/quizzes/monument/{id}`: Fetches quizzes.
    - `POST /api/v1/quizzes/validate`: Validates answers, calculates XP, and **updates user profile**.
    - **Deduplication**: Ensures users only get XP for a quiz *once*.
- **Walk Completion**:
    - `POST /api/v1/gamification/walk/finish`: Marks walk as complete in `walks_history` and awards 500 XP (first-time only).
- **Levels**: Database seeded with levels 1-10 defining XP curves.

## 5. Desired Features (Roadmap)
The following features are designed but **not yet implemented**:

### 5.1 Social Hub (Community Service)
- **Activity Feed**: Timeline of friend activities (e.g., "NeonHunter completed Cyberpunk Walk").
    - **Model**: `ActivityFeedItem` exists but is unused.
    - **Needs**: Endpoints to publish/retrieve feed.
- **Friend Graph**: Follow/Unfollow logic.
- **Trending Walks**: Algorithms to rank walks by popularity.

### 5.2 Real-time Features
- **WebSockets/SSE**: For live event updates or friend notifications.

### 5.3 Advanced Gamification
- **Badges**: Awarding specific items based on criteria (e.g., "5 Walks Completed").
