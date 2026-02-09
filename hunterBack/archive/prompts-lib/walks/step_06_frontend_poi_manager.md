# Step 6: Frontend - POI Manager

## Goal
Create the Admin UI interfaces for inputting the raw city data (Monuments and Events).

## Components to Build

### 1. POI Form
- **Fields**: Name, Description (Rich Text/Markdown), Images (Upload), Tags.
- **Location Picker**: Interactive Leaflet/Mapbox component to click and set Lat/Long.
- **Polymorphic Toggle**:
    - If **Monument**: Show "Opening Rules" builder (Day/Time inputs).
    - If **Event**: Show DatePicker ranges and Ticket Link inputs.

### 2. POI List
- Data Table with filtering by Type.
- "Clone Event" action (to quickly replicate recurring events).

## Tech Stack
- React / Next.js
- `react-hook-form`
- Mapping Library (Leaflet or Mapbox)

## Acceptance Criteria
- [ ] Can successfully submit a new Monument with complex opening hours.
- [ ] Can successfully submit an Event with start/end dates.
