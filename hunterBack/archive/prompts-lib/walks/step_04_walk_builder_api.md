# Step 4: Walk Builder API & Versioning

## Goal
Implement the backend routes for creating, editing, and publishing walks, ensuring strict version control enforcement.

## Files to Create/Edit
- `backend/app/api/routes/walks_builder.py`

## Endpoints

### 1. POST /walks (Create Draft)
- Creates a new Walk with `status=DRAFT`, `version=1`.

### 2. PATCH /walks/{id} (Edit Draft)
- **Constraint**: Only allowed if `status != PUBLISHED`.
- **Logic**: Updates fields. If `stops` is modified, reset `validation_status` to PENDING/DRAFT and clear `path` (needs re-calculation).

### 3. POST /walks/{id}/validate
- Triggers the `ValidationEngine` (from Step 3).
- Updates `walk.status` based on results.
- Returns the validation report.

### 4. POST /walks/{id}/publish
- **Constraint**: Only allowed if validations pass (Green/Yellow).
- **Logic**:
    - Sets `status` = `PUBLISHED`.
    - If this was a version update, find the previous version and update its `next_version_id` link.

### 5. POST /walks/{id}/new_version
- **Goal**: Edit a published walk safely.
- **Logic**:
    - Deep copy the published walk data.
    - Set new object `version = old.version + 1`.
    - Link `previous_version_id = old.id`.
    - Set `status = DRAFT`.
    - Return new ID.

## Acceptance Criteria
- [ ] Cannot PATCH a Published walk.
- [ ] Publishing a Draft updates the status.
- [ ] Creating a new version creates a linked copy.
