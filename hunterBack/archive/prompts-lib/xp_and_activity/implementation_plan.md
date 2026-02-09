# XP System Implementation Plan

This plan tracks the high-level progress of the XP System implementation. The work is divided into three distinct phases.

## Phase 1: Core Data & Models
**Goal**: Set up the foundation data structures and constants.
- [ ] Define `LevelNode` and `TEST_LEVELS` constant.
- [ ] Create `Mission` model (Pydantic).
- [ ] Create `Activity` (Visit) model for tracking user history.
- **Detailed Plan**: [phase1_models.md](phase1_models.md)

## Phase 2: Logic & Calculation
**Goal**: Implement the core mechanics for XP gain and leveling.
- [ ] Implement `calculate_visit_xp` with decay logic.
- [ ] Implement `get_user_level` based on total XP.
- [ ] Create Service layer for Gamification transactions.
- **Detailed Plan**: [phase2_logic.md](phase2_logic.md)

## Phase 3: Integration & Persistence & Documentation
**Goal**: Connect the logic to the API and save state to the database.
- [ ] Update `QuestState` or `User` to track visits (`Activity` logs).
- [ ] Create/Update API endpoints to record visits and award XP.
- [ ] Update `API_AGENT_GUIDE.md` with new endpoints/models.
- **Detailed Plan**: [phase3_integration.md](phase3_integration.md)

## Verification Plan
### Automated Tests
- **Unit Tests**:
    - Test XP decay logic (math correctness).
    - Test Level lookup (boundary conditions).
    - Test Model instantiation.
    - Command: `pytest tests/unit/test_gamification.py` (New test file)

### Manual Verification
- **API Testing**:
    - Use `curl` or Swagger UI to hit the new visit endpoint.
    - Verify XP increases.
    - Verify subsequent visits yield less XP (decay).
