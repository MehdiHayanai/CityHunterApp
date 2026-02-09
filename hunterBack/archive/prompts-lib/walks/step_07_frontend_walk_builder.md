# Step 7: Frontend - Walk Builder

## Goal
Create the "Creator Studio" for curating walks. This is the most complex UI component.

## Components to Build

### 1. The Builder Canvas
- **Left Panel**: Searchable list of available POIs (Draggable).
- **Center Panel**: The Map. Visualizes the path between selected stops.
- **Right Panel**: The Itinerary (Droppable). Re-order stops here.

### 2. Real-time Validation UI
- As stops are added, call the backend validation endpoint.
- Display a "Traffic Light" status bar:
    - 🟢 "Valid for all weekends"
    - 🟡 "Valid only on Saturday"
    - 🔴 "Impossible (Museum closes before Event starts)"

### 3. Versioning Controls
- If editing a Published walk, show "You are viewing a Read-Only version".
- "Edit New Version" button -> Forks the state into a new draft mode.

## Tech Stack
- `dnd-kit` or `react-beautiful-dnd` for drag-and-drop.
- Map Polyline rendering.

## Acceptance Criteria
- [ ] Dragging a POI from list to itinerary updates the map route.
- [ ] "Impossible" combinations trigger a visual error alert.
