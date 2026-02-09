# Frontend Security Implementation

## Overview

The frontend uses a **server-side API proxy** to inject the `x-api-key` header, preventing exposure of sensitive API keys to the client.

## Architecture

```
Client (Browser)
    ↓
Next.js Frontend (/api/v1/*)
    ↓ [Injects x-api-key header]
FastAPI Backend (http://backend:8000/api/v1/*)
```

## Key Files

### 1. API Proxy Route
**File**: [`app/api/v1/[...path]/route.ts`](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/api/v1/[...path]/route.ts)

This Next.js API route acts as a proxy between the frontend and backend:
- Forwards all requests to the backend
- Injects the `x-api-key` header server-side
- **Next.js 15+ Fix**: Properly awaits `params` to ensure the path is correctly preserved.
- Preserves JWT tokens from cookies
- Handles all HTTP methods (GET, POST, PUT, PATCH, DELETE)

### 2. API Client
**File**: [`app/lib/api.ts`](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/lib/api.ts)

Updated to use the proxy route:
- `API_BASE_URL` is set to `/api/v1`
- All existing API calls automatically use the proxy

### 3. Environment Variables
**File**: [`.env.local`](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/.env.local)

```env
# Server-side only - never exposed to client
API_BASE_KEY="SOME_RANDOM_STRING"

# Backend URL for proxy to forward requests
BACKEND_API_URL="http://127.0.0.1:8000/api/v1"
```

## Security Benefits

✅ **API key never exposed to client**
✅ **Maintains backend API protection**
✅ **Works with existing JWT authentication**

## Troubleshooting

### Issue: "POST /api/v1/ HTTP/1.1" (Incorrect Path)

If the backend receives a request to `/api/v1/` instead of the full endpoint (e.g., `/api/v1/auth/login`), it is usually because the `params` object in the Next.js Route Handler was not awaited.

**Fixed in**: [`app/api/v1/[...path]/route.ts`](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/api/v1/[...path]/route.ts)

```typescript
export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params; // This must be awaited
  return handleRequest(request, resolvedParams, 'POST');
}
```
