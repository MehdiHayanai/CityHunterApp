# Step 3: Feasibility & Validation Engine

## Goal
Implement the core logic that differentiates this app from a generic map: ensuring Walks are actually physically possible to complete.

## Files to Create/Edit
- `backend/app/services/validation_engine.py`

## Core Logic

### 1. Schedule Parsing
Create a utility to parse `ScheduleRule` (e.g., "Mon-Fri, 09:00-17:00") into queryable time windows.

### 2. Intersection Logic
Implement a function `calculate_common_open_window(pois: List[POI]) -> List[TimeWindow]`.
- Input: A list of POIs (stops in a walk).
- Output: A list of time ranges (e.g., "Next Saturday 10:00-14:00") where *all* stops are open simultaneously.
- Logic:
    - Monuments have weekly repeating schedules.
    - Events have absolute start/end datetimes.
    - Find the intersection of all these sets.

### 3. Walk Validation Service
- **Function**: `validate_walk(walk: Walk) -> WalkStatus`
- **Checks**:
    - **Geospatial Continuity**: Are stops reasonably close? (Optional warning if > 5km apart).
    - **Temporal Feasibility**: Does the `common_open_window` exist?
        - If NO intersection -> Status `RED` (Impossible).
        - If intersection < estimated duration -> Status `YELLOW` (Rushed).
        - If intersection > estimated duration -> Status `GREEN` (Specific Date) or `PUBLISHED`.

## Acceptance Criteria
- [ ] Unit tests for `calculate_common_open_window`.
- [ ] Test case: User tries to add a generic Monument (Open 9-5) and a Night Market Event (Open 18-22). Result should be empty intersection (Impossible).
- [ ] Test case: 3 Museums. Result should be the common open hours (e.g., 10-17).
