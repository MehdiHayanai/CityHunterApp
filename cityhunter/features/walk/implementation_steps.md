# Walk Feature Implementation Plan

This plan breaks down the "Walk" feature into 5 distinct implementation steps, based on `features/walk/specs.md` and following the design system in `prompts-lib/Global Styles Eport.md`.

---

# Step 1: Walk Backend Foundation

## Goal
Establish the database models and basic API endpoints for creating and retrieving Walk drafts.

## Files to Create/Edit
- `app/models/domain/walk.py` (New: Pydantic/DB Models)
- `app/api/v1/endpoints/walks.py` (New: API Routes)
- `app/services/walk_service.py` (New: Business Logic)

## Detailed Specification
Implements the core data structure for Walks, allowing them to be created and stored.

### Database Models (`walk.py`)
- **Walk** Model:
  - `id`: UUID
  - `title`: String
  - `description`: String
  - `stops`: List[POI_ID] (Ordered list)
  - `status`: Enum (DRAFT, PUBLISHED)
  - `created_at`, `updated_at`: Datetime

### API Endpoints (`walks.py`)
- **POST /api/v1/walks**: Create a new Walk Draft.
  - Input: `WalkCreate` schema ({ title, description, stops? })
  - Output: `Walk` object
- **GET /api/v1/walks/{id}**: Retrieve a specific walk.
- **PATCH /api/v1/walks/{id}**: Update a draft (title, description, stops reordering).
  - *Constraint*: Only allowed if status is DRAFT.

## Acceptance Criteria
- [ ] Can create a new Walk entry in the DB via API.
- [ ] Can retrieve a Walk by ID.
- [ ] Can update the list of stops for a Draft walk.

---

# Step 2: Walk Creator UI - Layout & Map

## Goal
Create the visual shell for the Walk Creator, utilizing the "Wizard" split-layout pattern and Global Styles.

## Files to Create/Edit
- `app/features/walk-creator/page.tsx` (New: Main Route)
- `app/features/walk-creator/components/WalkEditorLayout.tsx` (New: Shell)
- `app/features/walk-creator/components/WalkMap.tsx` (New: Map Visualizer)
- `app/services/walk_api.ts` (New: Frontend Service)

## Detailed Specification
Build the frontend "Construction Site" for walks.

### UI Architecture
- **Reference**: `prompts-lib/Global Styles Eport.md`
- **Layout**: Use `.wizard-container` (Split Layout).
  - **Left Panel (Map)**: `w-1/2` hidden md:block. Hosting `WalkMap.tsx`.
  - **Right Panel (Editor)**: `w-full md:w-1/2`. Hosting the stop list and controls.
- **Styling**:
  - Use `.glass` for the main container.
  - Use `.input-glass` for Title/Description inputs.
  - Use `.label-tech` for field labels.

### Map Component
- Integrate `react-leaflet`.
- Fetch all POIs (`GET /api/v1/pois`) on mount and display them as markers.
- Differentially style "Selected" stops vs "Available" POIs.

## Acceptance Criteria
- [ ] Page renders with the correct Split Layout (Map Left, Editor Right).
- [ ] Map displays all available POIs from the backend.
- [ ] Title and Description inputs are styled according to Global Design System.

---

# Step 3: Walk Creator UI - Drag & Drop Logic

## Goal
Implement the interactive drag-and-drop stop management system.

## Files to Create/Edit
- `app/features/walk-creator/components/StopList.tsx` (New)
- `app/features/walk-creator/components/StopCard.tsx` (New)
- `app/features/walk-creator/page.tsx` (Update)

## Detailed Specification
Enable users to build their itinerary visually.

### Interaction Design
- **Library**: `@dnd-kit` (as recommended in specs).
- **Features**:
  1. **Pool**: List of available POIs (Searchable/Filterable).
  2. **Itinerary**: Ordered list of selected stops.
  3. **Drag**: Drag from Pool -> Itinerary, or reorder within Itinerary.
- **Styling**:
  - **Stop Card**: Glassmorphic card, compact. Show thumbnail, name, and "Step Number".
  - **Drop Zone**: Dashed border with `.bg-black/20`.

### State Management
- Track `selectedStops` array.
- On change, auto-save to Draft API (debounce updates).

## Acceptance Criteria
- [ ] Can drag a POI from the "Available" list to the "Itinerary".
- [ ] Can reorder stops within the Itinerary.
- [ ] Map updates to draw a polyline connecting the selected stops in order.
- [ ] Changes persist to the backend.

---

# Step 4: Validation & Publishing Lifecycle

## Goal
Implement the "Traffic Light" validation system and the Publishing workflow.

## Files to Create/Edit
- `app/api/v1/endpoints/walks.py` (Update: Add Validate/Publish)
- `app/services/validation_engine.py` (New: Logic)
- `app/features/walk-creator/components/ValidationStatus.tsx` (New: UI)
- `app/features/walk-creator/page.tsx` (Update: Publish Action)

## Detailed Specification
Ensure walks are feasible before they go live.

### Backend Logic
- **POST /walks/{id}/validate**:
  - Calculate travel time between stops (haversine or routing engine).
  - Check `opening_rules` of Monuments vs `start_time` of Events.
  - Return `status`: GREEN (Good), yellow (Warnings), RED (Impossible).
- **POST /walks/{id}/publish**:
  - Sets `status` = PUBLISHED.
  - Locks the record (immutable).

### Frontend UI
- **Validation Indicator**:
  - Fixed panel or Toast showing current status.
  - Use `.text-accent` for Green, `text-red-500` for Red.
- **Publish Cmd**:
  - Button disabled if status is RED.
  - On click: "Preparing Launch..." animation (reuse Uplink effect).

## Acceptance Criteria
- [ ] User sees "Traffic Light" feedback on their route.
- [ ] Cannot publish a Red/Invalid route.
- [ ] Publishing locks the walk and makes it available to Explorers.

---

# Step 5: Explorer Mode (Mobile Experience)

## Goal
Build the consumer-facing mobile experience for following a walk.

## Files to Create/Edit
- `app/features/explorer/page.tsx` (New)
- `app/features/explorer/components/WalkSession.tsx` (New)
- `app/features/explorer/components/GeofenceTrigger.tsx` (New)

## Detailed Specification
The "Game" mode where users physically walk the route.

### Features
- **Geolocation**: `navigator.geolocation.watchPosition`.
- **Geofence Loop**:
  - Calc distance to `next_stop`.
  - If `< 75m` (as per spec), enable "UNLOCK REWARD" button.
  - Animation: Pulse effect when in range.
- **UI**:
  - Mobile-first, full height.
  - Large styled buttons for "Unlock".
  - "Next Stop" card floating at bottom.

## Acceptance Criteria
- [ ] Real-time distance tracking updates on screen.
- [ ] "Unlock" button becomes active only when within range.
- [ ] Unlocking reveals the `hidden_description` / Reward.
