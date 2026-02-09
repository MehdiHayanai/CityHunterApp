# Phase 1: Models & Core Data

## Goals
Define the static measurement scales (Levels) and the data structures for Missions and Activities.

## Proposed Changes

### 1. Levels Constant
**File**: `app/core/gamification_constants.py` (New File)
- Define `LevelNode` TypedDict/Pydantic model.
- Export `TEST_LEVELS` array as provided by user.

### 2. Mission Model
**File**: `app/models/gamification.py` (New File)
- **Class**: `Mission` (Pydantic BaseModel)
    - `id`: str
    - `title`: str
    - `target_location_id`: str (POI ID)
    - `base_xp`: int
    - `decay_factor`: float (optional, default 0.5?)
    - `min_xp`: int (optional)

### 3. Activity Model
**File**: `app/models/gamification.py` (or same file)
- **Class**: `Activity` (Pydantic BaseModel / Embedded Document)
    - `type`: str (e.g., "visit")
    - `target_id`: str (POI ID / Mission ID)
    - `timestamp`: datetime
    - `xp_awarded`: int
    - `count`: int (nth visit)

## Verification
- Usage in Python shell to verify structure.
