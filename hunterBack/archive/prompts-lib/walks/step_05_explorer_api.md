# Step 5: Explorer API & Gamification

## Goal
Implement the user-facing API for discovering walks and tracking active progress (sessions), including the "geofence unlock" mechanic.

## Files to Create/Edit
- `backend/app/api/routes/explorer.py`

## Endpoints

### 1. GET /explorer/walks
- Returns list of *Published* walks.
- **Filter**: `is_latest=True` (default).
- **Dynamic Filter**: Accept a Date param. Use `ValidationEngine` to check if the walk is valid on that specific date (Real-time feasibility check).

### 2. GET /explorer/walks/{id}
- Returns full walk details.
- **Security**: Must strip `hidden_description` / `hidden_media` from the nested stops. These are "secrets" to be unlocked.

### 3. POST /explorer/walks/{id}/start
- Creates a `WalkSession`.
- Logs `start_time`.

### 4. POST /explorer/stops/{poi_id}/unlock
- **Input**: User's current Lat/Long.
- **Logic**:
    - Retrieve POI location.
    - Calculate distance (Haversine).
    - If dist < 50m:
        - Add `poi_id` to `session.unlocked_stops`.
        - Return 200 OK + `hidden_content` payload.
    - Else:
        - Return 403 Forbidden ("Too far away").

### 5. POST /explorer/sessions/{id}/complete
- Marks session as finished.
- Accepts rating/review.

## Acceptance Criteria
- [ ] `GET /explorer/walks` filters out Drafts and Old Iterations.
- [ ] `unlock` endpoint correctly validates distance.
- [ ] Secrets are NOT returned in the standard specific walk GET.
