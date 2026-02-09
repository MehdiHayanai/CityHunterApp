# API Usage & Frontend Implementation Guide

This guide outlines the backend API endpoints available for the "Walks" feature and provides architectural recommendations for implementing the frontend consumers.

## 1. Backend API Reference

### 1.1 POI Management (Admin)
- **Endpoint**: `/api/v1/pois`
- **GET /pois**: Returns list of POIs. Supports `?lat=...&lng=...&radius=...` for geospatial search and `?type=monument|event` filtering.
- **POST /pois/monument**: Create a Monument.
  - Body: `{ name, description, location: {coordinates: [lng, lat]}, architectural_style, opening_rules: [...] }`
- **POST /pois/event**: Create an Event.
  - Body: `{ name, description, location, start_time, end_time, ticket_link }`

### 1.2 Walk Builder (Creator)
- **Endpoint**: `/api/v1/walks`
- **POST /walks**: Create a Draft Walk.
  - Body: `{ title, description, stops: ["poi_id_1", "poi_id_2"] }`
- **POST /walks/{id}/validate**: Checks feasibility (overlap of opening hours).
  - Returns: `{ status: "GREEN" | "RED", messages: [...] }`
- **POST /walks/{id}/publish**: Finalizes the walk. Locks it as Immutable.
- **POST /walks/{id}/new_version**: Forks a Published walk into a new Draft.

### 1.3 Explorer (Mobile App)
- **Endpoint**: `/api/v1/explorer`
- **GET /explorer/walks**: Returns list of *Published* walks.
- **GET /explorer/walks/{id}**: Get details (Secrets stripped).
- **POST /explorer/walks/{id}/start**: Start a session.
- **POST /explorer/stops/{poi_id}/unlock**: Attempt to unlock content.
  - Body: `{ lat: <user_lat>, lng: <user_lng> }`
  - Logic: Returns `success: true` if within 75m. Returns `hidden_description` only on success.

## 2. Frontend Implementation Strategy

### 2.1 POI Manager (`/features/poi-manager`)
**Requirement**: A form to input city data.
- **Map Picker**: Use `react-leaflet` or Mapbox. Allow user to click the map to populate `lat/lng` fields.
- **Polymorphism**: Use a toggle to switch form fields between Monument (Opening Rules) and Event (Date Range).

### 2.2 Walk Creator (`/features/walk-creator`)
**Requirement**: A workspace to select POIs and order them.
- **Drag & Drop**: Use `@dnd-kit` (recommended) or `react-beautiful-dnd`.
- **Workflow**:
  1. Fetch POIs (`GET /pois`).
  2. Drag POIs to an "Itinerary" list.
  3. POST to `/walks` to save draft.
  4. Call `/validate` to show "Traffic Light" feedback (Green/Red validation status).
  5. Call `/publish` when ready.

### 2.3 Explorer App (`/features/explorer`)
**Requirement**: Mobile-first navigation experience.
- **Geolocation**: Use `navigator.geolocation.watchPosition` (wrapped in a hook/context).
- **Geofence Loop**:
  - Compare User Location vs Next Stop Location.
  - If `< 100m`, enable "Unlock" button.
  - User clicks Unlock -> Call API -> Show Result.
- **State**: Track "Active Walk" locally or via Context.

## 3. Data Models

### GeoJSON
Points are stored as `[Longitude, Latitude]`. 
*Note: Leaflet often uses `[Lat, Lng]`, so ensure you flip coordinates when sending/receiving.*

### Validation Status
- **DRAFT**: Editable.
- **GREEN**: Validated (Feasible).
- **RED**: Invalid (Times don't overlap).
- **PUBLISHED**: Live & Immutable.

## 4. API and Endpoint access

you can browse the directory 
PS C:\Users\Lenovo\GIT\cityHunter\vibe\hunterBack 

to see the API and endpoints implementation
