# CityHunter API Reference

Complete API documentation for the CityHunter backend service.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-domain.com`

## Authentication

### API Key Authentication

Most endpoints require an API key in the header:

```http
X-API-Key: your-api-key-here
```

### JWT Authentication

User-specific endpoints require a JWT token:

```http
Authorization: Bearer <your-jwt-token>
```

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "handle": "username"
}
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "handle": "username",
  "role": "user",
  "level": 1,
  "xp": 0,
  "stats": {
    "distance": "0km",
    "cities": 0,
    "secrets": 0
  },
  "collection": [],
  "joined_date": "2026-02-09T17:30:00Z"
}
```

### Login

Authenticate and receive access token.

**Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "is_verified": true
}
```

### OAuth2 Token

OAuth2-compatible token endpoint.

**Endpoint**: `POST /api/v1/auth/access-token`

**Request** (form data):
```
username=user@example.com
password=securepassword123
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## User Endpoints

### Get Current User Profile

Retrieve the authenticated user's profile.

**Endpoint**: `GET /api/v1/users/profile/me`

**Headers**: Requires JWT token

**Response** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "handle": "username",
  "role": "user",
  "level": 5,
  "xp": 2500,
  "avatar_url": "https://example.com/avatar.jpg",
  "stats": {
    "distance": "15.3km",
    "cities": 3,
    "secrets": 12
  },
  "collection": ["badge1", "badge2"],
  "walks_history": ["walk-id-1", "walk-id-2"],
  "quizzes_history": ["quiz-id-1"]
}
```

### Update Profile

Update user profile information.

**Endpoint**: `PATCH /api/v1/users/profile/me`

**Headers**: Requires JWT token

**Request Body**:
```json
{
  "handle": "newusername",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**Response** (200 OK): Updated profile object

## Points of Interest (POI) Endpoints

### List POIs

Get all points of interest with optional filtering.

**Endpoint**: `GET /api/v1/pois/`

**Query Parameters**:
- `type` (optional): Filter by type (`monument` or `event`)
- `lat` (optional): Latitude for proximity search
- `lng` (optional): Longitude for proximity search

**Response** (200 OK):
```json
[
  {
    "id": "poi-123",
    "name": "Eiffel Tower",
    "description": "Iconic iron lattice tower",
    "location": {
      "type": "Point",
      "coordinates": [2.2945, 48.8584]
    },
    "category": "landmark",
    "image_url": "https://example.com/eiffel.jpg",
    "type": "monument"
  }
]
```

### Get POI by ID

Retrieve a specific point of interest.

**Endpoint**: `GET /api/v1/pois/{poi_id}`

**Response** (200 OK): Single POI object

### Create Monument

Create a new monument (admin only).

**Endpoint**: `POST /api/v1/pois/monuments`

**Headers**: Requires JWT token + admin role

**Request Body**:
```json
{
  "name": "Arc de Triomphe",
  "description": "Famous monument in Paris",
  "location": {
    "type": "Point",
    "coordinates": [2.2950, 48.8738]
  },
  "category": "landmark",
  "image_url": "https://example.com/arc.jpg"
}
```

## Walk Endpoints

### List Walks

Get all available walks.

**Endpoint**: `GET /api/v1/walks/`

**Response** (200 OK):
```json
[
  {
    "id": "walk-456",
    "name": "Historic Paris Tour",
    "stops": ["poi-123", "poi-456", "poi-789"],
    "difficulty": "medium",
    "metrics": {
      "rating": 4.5,
      "visitors": 1250
    }
  }
]
```

### Get Walk by ID

Retrieve a specific walk with full details.

**Endpoint**: `GET /api/v1/walks/{walk_id}`

**Response** (200 OK):
```json
{
  "id": "walk-456",
  "name": "Historic Paris Tour",
  "stops": [
    {
      "id": "poi-123",
      "name": "Eiffel Tower",
      "location": {...}
    }
  ],
  "difficulty": "medium",
  "metrics": {
    "rating": 4.5,
    "visitors": 1250
  }
}
```

## Gamification Endpoints

### Register Visit

Record a monument visit and earn XP.

**Endpoint**: `POST /api/v1/gamification/visit`

**Headers**: Requires JWT token

**Request Body**:
```json
{
  "monument_id": "poi-123"
}
```

**Response** (200 OK):
```json
{
  "xp_earned": 100,
  "new_total_xp": 2600,
  "level": 5,
  "message": "Visit recorded! +100 XP"
}
```

### Complete Walk

Mark a walk as completed and earn rewards.

**Endpoint**: `POST /api/v1/gamification/walk/finish`

**Headers**: Requires JWT token

**Request Body**:
```json
{
  "walk_id": "walk-456"
}
```

**Response** (200 OK):
```json
{
  "xp_earned": 500,
  "new_total_xp": 3100,
  "level": 6,
  "message": "Walk completed! +500 XP. Level up!"
}
```

### Get Levels

Retrieve all level configurations.

**Endpoint**: `GET /api/v1/gamification/levels`

**Response** (200 OK):
```json
[
  {
    "level_number": 1,
    "xp_threshold": 0,
    "rewards": ["Welcome Badge"]
  },
  {
    "level_number": 2,
    "xp_threshold": 100,
    "rewards": ["Explorer Badge"]
  }
]
```

## Quiz Endpoints

### Get Quizzes for Monument

Retrieve quizzes associated with a monument.

**Endpoint**: `GET /api/v1/quizzes/monument/{monument_id}`

**Response** (200 OK):
```json
[
  {
    "id": "quiz-789",
    "monument_id": "poi-123",
    "question": "When was the Eiffel Tower built?",
    "options": ["1887", "1889", "1891", "1895"],
    "correct_answer": 1,
    "xp_reward": 50
  }
]
```

### Validate Quiz Answer

Submit and validate a quiz answer.

**Endpoint**: `POST /api/v1/quizzes/validate`

**Headers**: Requires JWT token

**Request Body**:
```json
{
  "quiz_id": "quiz-789",
  "answer_index": 1
}
```

**Response** (200 OK):
```json
{
  "correct": true,
  "xp_earned": 50,
  "new_total_xp": 3150,
  "explanation": "The Eiffel Tower was completed in 1889."
}
```

## Content Discovery Endpoints

### Dashboard Items

Get nearby monuments and events based on location.

**Endpoint**: `GET /api/v1/content/dashboard/items`

**Query Parameters**:
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional): Search radius in meters (default: 5000)

**Response** (200 OK):
```json
{
  "monuments": [...],
  "events": [...],
  "walks": [...]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "API Key header is missing"
}
```

### 403 Forbidden
```json
{
  "detail": "Invalid API Key"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

- **Rate limit**: 100 requests per minute per IP
- **Burst**: 20 requests
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

## Pagination

List endpoints support pagination:

**Query Parameters**:
- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum items to return (default: 100, max: 1000)

**Example**:
```
GET /api/v1/pois/?skip=20&limit=10
```

## Interactive Documentation

- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`
- **OpenAPI JSON**: `/api/v1/openapi.json`

## SDKs and Client Libraries

Coming soon:
- Python SDK
- JavaScript/TypeScript SDK
- Mobile SDKs (iOS, Android)

## Support

- 📧 Email: api@cityhunter.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/cityhunter-backend/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/cityhunter-backend/discussions)
