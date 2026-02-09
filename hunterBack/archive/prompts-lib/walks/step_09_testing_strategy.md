# Step 9: Testing Strategy

## Goal
Ensure reliability of the complex validation logic and geospatial features.

## Backend Tests (Pytest)
1. **Unit Tests**:
    - `ValidationEngine`: Mock various schedules (overlapping, non-overlapping, edge cases like midnight crossing).
    - `Versioning`: Ensure `new_version` correctly copies data and links pointers.
2. **Integration Tests**:
    - `Flow`: Create POIs -> Create Draft Walk -> Validate -> Publish -> Create New Version.
    - `Explorer`: Simulate a user moving closer to a target and ensuring `unlock` only works within range.

## Frontend Tests (Jest/Cypress)
1. **Component Tests**:
    - Validate POI Form inputs.
    - Verify Walk Builder drag-and-drop updates the internal state.
2. **E2E Tests**:
    - "The Happy Path": Admin logs in, creates a Walk. User logs in, sees the Walk, starts it.

## Manual QA Checklist
- [ ] **Geofencing**: Test with real device GPS or browser location override.
- [ ] **TimeZone Handling**: Ensure events scheduled for 9 AM local time appear correctly for users in different zones (though usually relevant for local time).
