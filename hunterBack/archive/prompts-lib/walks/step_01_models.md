# Step 1: Data Models & Database Setup

## Goal
Implement the core Pydantic/Beanie models to store the application state. These models must support polymorphism for POIs (Monuments/Events) and handle the complexity of versioned Walks.

## Files to Create/Edit
- `backend/app/models/domain/geo.py` (Shared GeoJSON types)
- `backend/app/models/domain/poi.py` (POI, Monument, Event)
- `backend/app/models/domain/walk.py` (Walk, Versioning logic)
- `backend/app/models/domain/session.py` (WalkSession)

## Specifications

### 1. Unified GeoJSON Types
Implement standard GeoJSON `Point` and `LineString` models to ensure compatibility with MongoDB geospatial indexing.

```python
class GeoObject(BaseModel):
    type: str = "Point"
    coordinates: List[float] # [long, lat]

class GeoLineString(BaseModel):
    type: str = "LineString"
    coordinates: List[List[float]] 
```

### 2. POI Polymorphism
Use Beanie's inheritance support. `POI` should be the parent Document.
- **Fields**: `name`, `description`, `location`, `images`, `resources`, `tags`.
- **Gamification**: `hidden_description`, `hidden_media` (revealed only upon visit).

**Subclasses**:
- `Monument`: Adds `architectural_style`, `built_year`, `opening_rules`.
- `Event`: Adds `start_time`, `end_time`, `schedule_rules`, `ticket_link`.

### 3. Walk & Versioning
The `Walk` model must support the "Immutable History" pattern.
- **Fields**: `stops` (List of Links to POI), `path` (GeoLineString), `status` (DRAFT/GREEN/PUBLISHED).
- **Versioning**:
    - `version` (int): Incremental version number.
    - `previous_version_id` (Link): Pointer to the parent version.
    - `next_version_id` (Link): Pointer to the child version (if superseded).
    - `is_latest` (bool): Indexable flag for efficient querying.

### 4. WalkSession
Tracks a user's progress.
- `unlocked_stops`: List of IDs of POIs that have been successfully "visited".
- `rating`/`review`: Optional user feedback.

## Acceptance Criteria
- [ ] All models defined in Beanie.
- [ ] MongoDB indexes created (especially `2dsphere` for `location`).
- [ ] Polymorphism works (querying `POI.find()` returns both Monuments and Events).
