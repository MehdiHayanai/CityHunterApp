# Phase 3: Integration & Persistence

## Goals
Connect the logic to the backend API and store user progress.

## Proposed Changes

### 1. Update QuestState
**File**: `app/models/quest.py`
- Add `activity_log`: List[Activity] (or separate Collection if too large, but embedded is fine for MVP).
- Ensure `accumulated_xp` is updated correctly.

### 2. API Endpoints
**File**: `app/api/v1/endpoints/gamification.py`
- **POST** `/api/v1/gamification/visit`
    - **Body**: `{ "poi_id": "..." }`
    - **Logic**:
        - Get `QuestState` for user.
        - Check previous visits to `poi_id` in `activity_log`.
        - Calculate XP using Service.
        - Add new `Activity` to log.
        - Update `accumulated_xp`.
        - Save `QuestState`.
        - Return `{ "xp_gained": ..., "new_total": ..., "level_up": boolean }`

### 3. Documentation
**File**: `prompts-lib/agent_guide/API_AGENT_GUIDE.md`
- Add the new endpoint definition.
- Add `LevelNode` definition if relevant for frontend reference.

## Verification
- E2E Test via `fastapi-events` or direct API call.
- Check Database to see `activity_log` growing.
