# Step 8: Frontend - Explorer App (Mobile)

## Goal
The end-user mobile interface for discovering and taking walks.

## Components to Build

### 1. Discovery Feed
- Card-based feed of available walks.
- **Date Filter**: Users pick "I am visiting [Next Saturday]". The app filters out walks that are invalid for that date.

### 2. Active Mode (The "SatNav")
- When "Start Walk" is clicked:
    - Switch global app state to `ActiveSession`.
    - Show live map with user location.
    - Highlight the *Next Stop*.

### 3. Unlock Interaction
- When near a stop, show "You have arrived!" button.
- Clicking it calls the `unlock` API.
- On success: Play animation, reveal Hidden Content (Audio/Text), and mark checkmark on map.

## Tech Stack
- Mobile-first CSS (Tailwind).
- Geolocation API (`navigator.geolocation.watchPosition`).

## Acceptance Criteria
- [ ] User flow: Select Walk -> Start -> Walk to Stop 1 -> Unlock -> Stop 2... works end-to-end.
- [ ] "Locked" content is visually distinct (blurred or padlock icon) until unlocked.
