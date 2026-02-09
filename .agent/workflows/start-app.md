---
description: Start the full application (frontend + backend)
---

# Start Full Application

This workflow starts both the frontend and backend services.

## Prerequisites
- Node.js and npm installed
- Python 3.11+ with uv installed
- Environment files configured (`.env` or `.env.local`)

## Steps

### 1. Start Backend
```bash
cd hunterBack
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend (in a new terminal)
```bash
cd cityhunter
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Using Docker Compose (Alternative)

If you prefer to use Docker:

```bash
# From the root directory
docker-compose up
```

Or for individual services:

```bash
# Backend only
cd hunterBack
docker-compose up

# Frontend only
cd cityhunter
docker-compose -f compose.yaml up
```
