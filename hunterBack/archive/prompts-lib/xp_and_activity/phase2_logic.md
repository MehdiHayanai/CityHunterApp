# Phase 2: Logic & Calculation

## Goals
Implement the math and business logic for the gamification system.

## Proposed Changes

### 1. Logic Implementation
**File**: `app/services/gamification_service.py` (New Service)

#### Functions:
- `calculate_xp_for_visit(visit_count: int, base_xp: int = 100) -> int`
    - **Logic**: 
        - 1st visit: 100% base_xp
        - 2nd visit: 50% (or defined decay)
        - ...
        - Minimum floor (e.g., 5 XP)
- `get_level_info(total_xp: int) -> LevelNode`
    - Binary search or simple iteration over `TEST_LEVELS` to find current level and next level progress.

### 2. Integration with Models
- Ensure `Activity` history can be queried to determine `visit_count`.

## Verification
- **Unit Tests**: `tests/unit/test_gamification_logic.py`
    - `test_decay()`: Assert 1st visit > 2nd visit.
    - `test_level_lookup()`: XP 0 -> Level 1. XP 35000 -> Level 10.
