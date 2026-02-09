# Backend Implementation Plan & Task List (FastAPI + MongoDB)

## Phase 1: Foundation & Identity (Weeks 1-2)
**Goal**: Establish the server infrastructure and user management system using NoSQL.

### Tasks
- [ ] **Infrastructure Setup**
    - [ ] Initialize FastAPI project with `uvicorn` and `pydantic`.
    - [ ] Set up Database (MongoDB with **Beanie ODM** or **Motor**).
    - [ ] Configure Docker environment with `docker-compose` (MongoDB image).
- [ ] **Authentication Module**
    - [ ] Implement `POST /auth/register` (Pydantic schemas + Password hashing with `passlib`).
    - [ ] Implement `POST /auth/login` (OAuth2 password flow + JWT issuance).
    - [ ] Implement Dependency Injection for JWT verification and `get_current_user`.
- [ ] **User Profile Module**
    - [ ] Define `User` and `UserProfile` Beanie Document models.
    - [ ] Implement `GET /users/me` (Protected route using Depends).
    - [ ] Update `PATCH /users/me` (Avatar, Handle updates using Pydantic `Optional` fields).

### Intermediate Deliverables
1.  **Running API Server**: Health check endpoint returns 200 OK and Swagger UI is accessible at `/docs`.
2.  **Auth System**: Users can sign up, log in, and receive a valid JWT.
3.  **Database Connection**: MongoDB connection established and user documents correctly persisted.

---

## Phase 2: Core Game Loop - City Data (Weeks 3-4)
**Goal**: Serve game content (Monuments, Walks) using MongoDB geospatial indexes.

### Tasks
- [ ] **City Data Schema**
    - [ ] Define `Monument`, `Event`, and `Walk` documents with **2dsphere** indexes for GeoJSON support.
    - [ ] Seed database with the initial "Paris" dataset (Python scripts using Motor/Beanie).
- [ ] **Geospatial API**
    - [ ] Implement `GET /city/items` with lat/lng/radius query parameters.
    - [ ] Optimize MongoDB spatial queries (e.g., `$nearSphere` or `$geoWithin`) for "Find nearest" operations.
- [ ] **Walks API**
    - [ ] Implement `GET /walks` (Filter by difficulty/type using MongoDB query filters).
    - [ ] Implement `GET /walks/:id` ensuring all nested `Stop` data is included (via DBRefs or manual `fetch_links()`).

### Intermediate Deliverables
1.  **Playable Map Backend**: Frontend map fetches real GeoJSON data from the API instead of mock constants.
2.  **Dynamic Lists**: The Dashboard list view populates from MongoDB collections.

---

## Phase 3: Quest Engine & Persistence (Weeks 5-6)
**Goal**: Enable cross-device play and secure progression.

### Tasks
- [ ] **Quest State Schema**
    - [ ] Define `QuestState` and `MissionHistory` documents (leveraging nested arrays for event history).
- [ ] **Progression API**
    - [ ] Implement `POST /quest/sync` for auto-saving active walk state (Atomic updates with `$set`).
    - [ ] Implement `POST /quest/encounter/verify` for validating quiz answers server-side.
    - [ ] Implement `POST /quest/finish` to award XP and Items (Atomic `$inc` for XP).
- [ ] **Security Layer**
    - [ ] Add rate limiting to XP-earning endpoints (e.g., `slowapi`).
    - [ ] Validate "Time to Arrival" (calculate distance/speed to prevent spoofing).

### Intermediate Deliverables
1.  **Cloud Save**: Starting a walk on Mobile, pausing, and resuming on Desktop works via document syncing.
2.  **Verified Scoring**: Cheating by manipulating client-side XP is prevented.

---

## Phase 4: Social Hub (Weeks 7-8)
**Goal**: Connect users and drive engagement.

### Tasks
- [ ] **Social Graph**
    - [ ] Define `Friendship` document (requester_id, recipient_id, status) with unique compound indexes.
    - [ ] Implement Friend Request logic (Send, Accept, Block).
- [ ] **Activity Feed System**
    - [ ] Create `ActivityLog` collection to record major user events.
    - [ ] Implement `GET /social/feed` with pagination (Cursor-based pagination recommended for MongoDB).
    - [ ] Trigger "Activity Creation" using FastAPI `BackgroundTasks` when Quests are completed.
- [ ] **Trending Algorithm**
    - [ ] Implement background job (APScheduler or Celery) to aggregate "Walk Visits" using MongoDB **Aggregation Pipeline**.
    - [ ] Cache "Trending" results in Redis for high-performance reads.

### Intermediate Deliverables
1.  **Working Social Tab**: Friends list is functional.
2.  **Live Feed**: Completing a walk instantly pushes an activity document to the feed.
