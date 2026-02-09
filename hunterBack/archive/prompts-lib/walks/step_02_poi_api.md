# Step 2: POI Management API

## Goal
Create the CRUD endpoints for managing the raw building blocks of the city: Monuments and Events.

## Files to Create/Edit
- `backend/app/api/routes/pois.py`

## Endpoints

### 1. GET /pois
**Purpose**: Main map view discovery.
- **Query Params**:
    - `type` (optional): "monument" | "event"
    - `lat`, `long`, `radius`: For geospatial search.
    - `tags`: Filter by tag list.
- **Response**: List of POI objects (stripped of hidden content).
- **Performance**: Use MongoDB `$near` operator. Implement pagination (limit/offset).

### 2. POST /pois/monument
**Purpose**: Create a permanent landmark.
- **Body**: `MonumentCreate` schema.
- **Permissions**: Admin/Creator.

### 3. POST /pois/event
**Purpose**: Create a temporary event.
- **Body**: `EventCreate` schema.
- **Side Effects**: Trigger a background check? (Not strictly required for MVP, but good to note).

### 4. GET /pois/{id}
**Purpose**: Detail view.
- **Security**: DO NOT return `hidden_description` or `hidden_media` unless the user has unlocked it (handled in Explorer API, but here we just return public data).

### 5. PUT /pois/{id}
**Purpose**: Update POI details.
- **Note**: Changing a POI's location or opening hours might affect existing Walks. For MVP, allow it but log a warning.

## Acceptance Criteria
- [ ] Can create a Monument and an Event.
- [ ] `GET /pois` returns both types.
- [ ] Geospatial filtering works (only return POIs within X meters).
