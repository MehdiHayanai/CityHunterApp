# Manual Testing Guide for Walks Feature

This guide helps you manually verify the full lifecycle of the Walks feature, from creation to exploration.

## Prerequisites
1.  **Backend Running**: `uvicorn app.main:app --reload` (Port 8000)
2.  **Frontend Running**: `npm run dev` (Port 3000)
3.  **Database Seeded**: Run `python scripts/populate_db.py` to get initial data.

---

## Scenario 1: Curator Flow (Admin)

**Goal**: Create a new Walk and Publish it.

1.  **Open POI Manager**: Go to `http://localhost:3000/features/poi-manager`.
    *   Create a "Monument" named "Test Cafe".
    *   Create an "Event" named "Street Parade".
    *   *Verify*: Check console logs or database to see if `POST /pois` was called (Note: UI currently logs to console in MVP).

2.  **Open Walk Creator**: Go to `http://localhost:3000/features/walk-creator`.
    *   **Drag & Drop**: Drag "Test Cafe" and "Street Parade" from left to right panel.
    *   **Reorder**: Swap their positions.
    *   **Validate**: Click "Validate Walk".
        *   *Expected*: Backend calculates time intersection. If they overlap, status turns GREEN.
    *   **Publish**: Click "Save/Publish" (Note: Button in MVP might just log).

---

## Scenario 2: Explorer Flow (User)

**Goal**: Discover a walk and unlock a stop.

1.  **Open Mobile View**: Go to `http://localhost:3000/features/explorer`.
    *   *Set your browser to Mobile View (DevTools > Toggle Device Toolbar).*

2.  **Browse**:
    *   You should see "Parisian Classics" (from seed script).
    *   Click "Start Adventure".

3.  **Active Walk**:
    *   You see "Target: The Iron Lady".
    *   Coords: `48.8584, 2.2945`.

4.  **Unlock Simulation**:
    *   Click "I Have Arrived (Unlock)".
    *   *Expected*: The button is replaced by a green box showing "Content Unlocked!" and the secret text ("...secret apartment...").
    *   Click "Next Stop".

5.  **Completion**:
    *   Continue until the walk finishes.

---

## API Testing (via Swagger/Postman)

1.  **Visit Swagger UI**: http://localhost:8000/docs
2.  **Check Endpoints**:
    *   `GET /api/v1/pois`
    *   `POST /api/v1/walks`
    *   `GET /api/v1/explorer/walks`
