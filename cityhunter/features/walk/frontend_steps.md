# Step 1: POI Manager UI

## Goal
Create an admin interface (`/features/poi-manager`) to input Monuments and Events into the system, integrating with the map for location selection.

## Files to Create/Edit
- `app/features/poi-manager/page.tsx`
- `app/features/poi-manager/components/PoiForm.tsx`
- `app/features/poi-manager/components/MapPicker.tsx`
- `app/services/poi.ts`

## Detailed Specification
Implements a polymorphic form to create either a "Monument" or an "Event".

### API Client (`app/services/poi.ts`)
- `createMonument(data: MonumentCreate): Promise<POI>`
  - POST `/api/v1/pois/monument`
- `createEvent(data: EventCreate): Promise<POI>`
  - POST `/api/v1/pois/event`

### MapPicker Component
- **Library**: `react-leaflet`
- **Props**: `value: {lat, lng} | null`, `onChange: (val: {lat, lng}) => void`
- **Behavior**:
  - Displays a map centered on the city.
  - User interaction: Click on map places a marker.
  - Callback: Calls `onChange` with the new coordinates.

### PoiForm Component
- **State**: `type` ("monument" | "event")
- **Shared Fields**: 
  - `name` (text), `description` (textarea)
  - `location` (using `MapPicker`)
  - `images` (file upload or URL for MVP)
- **Monument Specifics**:
  - `architectural_style` (select/text)
  - `opening_rules` (JSON editor or simple text input for MVP)
- **Event Specifics**:
  - `start_time` (datetime-local), `end_time` (datetime-local)
  - `ticket_link` (url)
- **Submission**: Validates inputs and calls the appropriate service method.

## Acceptance Criteria
- [ ] User can navigate to `/features/poi-manager`.
- [ ] User can toggle between Monument and Event forms.
- [ ] Clicking the map updates the latitude/longitude fields.
- [ ] Submitting the form creates the POI in the backend (verified via Network tab).

---

# Step 2: Walk Creator - Builder UI

## Goal
Implement the core interactive workspace (`/features/walk-creator`) where creators can drag-and-drop POIs to build a walk itinerary.

## Files to Create/Edit
- `app/features/walk-creator/page.tsx`
- `app/features/walk-creator/components/WalkBuilder.tsx`
- `app/features/walk-creator/components/PoiSidebar.tsx`
- `app/features/walk-creator/components/ItineraryCanvas.tsx`
- `app/services/walks.ts`

## Detailed Specification
A split-screen layout: Sidebar (Source) and Canvas (Destination).

### API Client (`app/services/walks.ts`)
- `createWalk(data: WalkCreate): Promise<Walk>`
- `getWalk(id: string): Promise<Walk>`

### POI Sidebar
- Fetches all POIs using `getPois()`.
- Renders draggable cards for each POI (Name + Thumbnail).
- Filter search bar to find POIs by name.

### Itinerary Canvas
- Droppable area.
- Renders the "Walk Path" as a list of connected stops.
- Allows reordering of stops (Drag & Drop sorting).
- Allows deleting a stop from the walk.

### Walk Builder (Main Page)
- **State**: 
  - `walkTitle` (string)
  - `walkDescription` (string)
  - `stops` (Array of POIs)
- **Actions**:
  - "Save Draft": Calls `createWalk` with the current state.

## Acceptance Criteria
- [ ] Sidebar lists available Monuments/Events.
- [ ] User can drag a POI from sidebar to canvas.
- [ ] User can reorder stops within the canvas.
- [ ] User can save the current configuration as a Draft Walk.

---

# Step 3: Walk Creator - Logic & Publishing

## Goal
Add "Traffic Light" feasibility validation and the ability to publish a valid walk, making it immutable.

## Files to Create/Edit
- `app/features/walk-creator/components/ValidationStatus.tsx`
- `app/features/walk-creator/components/WalkToolbar.tsx`
- `app/services/walks.ts` (Update)

## Detailed Specification
Integrates the backend validation logic to give feedback.

### API Client Updates
- `validateWalk(id: string): Promise<ValidationResult>`
  - POST `/api/v1/walks/{id}/validate`
  - Response: `{ status: "GREEN"|"RED", messages: string[] }`
- `publishWalk(id: string): Promise<Walk>`
  - POST `/api/v1/walks/{id}/publish`

### ValidationStatus Component
- Visual indicator (Green Check / Red X).
- Displays the list of validation messages (e.g., "Stop 2 is closed when you arrive").

### WalkToolbar Implementation
- **Check Feasibility Button**:
  - Triggers `validateWalk`.
  - Updates `ValidationStatus`.
- **Publish Button**:
  - Disabled if `status !== "GREEN"`.
  - On click: Calls `publishWalk`, then redirects to a success/summary page or locks the UI.

## Acceptance Criteria
- [ ] clicking "Check Feasibility" shows validation results from backend.
- [ ] "Publish" button is disabled if validation fails.
- [ ] Successfully publishing a walk marks it as finalized.

---

# Step 4: Explorer - Discovery UI

## Goal
Create the mobile-first "Home" screen (`/features/explorer`) for users to discover and select published walks.

## Files to Create/Edit
- `app/features/explorer/page.tsx`
- `app/features/explorer/components/WalkList.tsx`
- `app/features/explorer/components/WalkCard.tsx`
- `app/services/explorer.ts`

## Detailed Specification
A browsable catalog of available walks.

### API Client (`app/services/explorer.ts`)
- `getPublishedWalks(): Promise<Walk[]>`
  - GET `/api/v1/explorer/walks`

### WalkCard Component
- Displays:
  - Hero Image (First stop's image).
  - Title & Short Description.
  - Metrics: "X Stops", "Approx Y mins".
  - "Start" CTA Button.

### Discovery Page
- Fetches walks on mount.
- Renders `WalkList` grid.
- Responsive design tailored for mobile viewports.

## Acceptance Criteria
- [ ] Page loads list of published walks from API.
- [ ] Cards display correct metadata (title, stops count).
- [ ] Clicking "Start" navigates to the Active Session page (`/features/explorer/[id]`).

---

# Step 5: Explorer - Active Session

## Goal
Implement the core gameplay loop: tracking user location, detecting proximity to the next stop, and unlocking content.

## Files to Create/Edit
- `app/features/explorer/[id]/page.tsx`
- `app/features/explorer/components/ActiveSession.tsx`
- `app/features/explorer/components/UnlockButton.tsx`
- `app/hooks/useGeolocation.ts`

## Detailed Specification
The real-time guidance interface.

### Geolocation Hook
- Uses `navigator.geolocation.watchPosition`.
- Returns `{ lat, lng, accuracy, error }`.

### Unlock Logic
- **State**: `currentStopIndex`.
- **Computation**:
  - Calculate distance between `userLocation` and `walk.stops[currentStopIndex].location`.
  - If distance < 75m (configurable), set `canUnlock = true`.
- **Action**:
  - User clicks "Unlock".
  - API Call: `POST /explorer/stops/{id}/unlock` with coords.
  - If success: Show hidden content, then "Next Stop" button appears.

### ActiveSession UI
- **Header**: "Stop X of Y: [Stop Name]".
- **Map**: Shows current user pos and target pin.
- **Controls**: 
  - "Walk to location..." (Disabled state).
  - "I'm here!" (Enabled when close).

## Acceptance Criteria
- [ ] UI updates user coordinates in real-time.
- [ ] "Unlock" button becomes active only when within range of the target stop.
- [ ] Unlocking reveals the secret content and advances the state.
