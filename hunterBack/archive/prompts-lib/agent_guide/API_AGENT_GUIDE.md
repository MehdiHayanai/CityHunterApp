# API Agent Guide

## Project Overview

### Project Structure
- **app/api/v1/endpoints/**: Contains route definitions.
- **app/models/**: Contains Pydantic models for Domain and API schemas.
- **app/services/**: Contains business logic services.

### Route Mapping

### Roles & Permissions
The API uses a Role-Based Access Control (RBAC) system.
- **User**: Standard access. Can manage own profile, view public data, and participate in gamification.
- **Admin**: Elevated access. Can create/edit Walks, manage POIs, and view all system data.

Certain endpoints (e.g., `POST /walks/`, `PUT /walks/{id}`) are restricted to **Admin** users only.

| HTTP Method | Endpoint Path | File Location |
| :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | `app/api/v1/endpoints/auth.py:29-64` |
| **POST** | `/api/v1/auth/verify-email` | `app/api/v1/endpoints/auth.py:67-94` |
| **POST** | `/api/v1/auth/request-verification` | `app/api/v1/endpoints/auth.py:97-121` |
| **POST** | `/api/v1/auth/login` | `app/api/v1/endpoints/auth.py:124-146` |
| **POST** | `/api/v1/auth/access-token` | `app/api/v1/endpoints/auth.py:149-166` |
| **GET** | `/api/v1/users/profile/me` | `app/api/v1/endpoints/users.py:14-39` |
| **GET** | `/api/v1/users/profile/{user_id}` | `app/api/v1/endpoints/users.py:42-72` |
| **PATCH** | `/api/v1/users/profile/{user_id}` | `app/api/v1/endpoints/users.py:75-95` |
| **GET** | `/api/v1/pois/{id}` | `app/api/v1/endpoints/pois.py:17-29` (Also lines 101-127) |
| **DELETE** | `/api/v1/pois/{id}` | `app/api/v1/endpoints/pois.py:35-46` (Also lines 177-187) |
| **GET** | `/api/v1/pois/` | `app/api/v1/endpoints/pois.py:49-98` |
| **POST** | `/api/v1/pois/monument` | `app/api/v1/endpoints/pois.py:130-139` |
| **POST** | `/api/v1/pois/event` | `app/api/v1/endpoints/pois.py:142-150` |
| **PUT** | `/api/v1/pois/{id}` | `app/api/v1/endpoints/pois.py:153-174` |
| **GET** | `/api/v1/walks/` | `app/api/v1/endpoints/walks_builder.py:29-42` |
| **GET** | `/api/v1/walks/{id}` | `app/api/v1/endpoints/walks_builder.py:45-53` |
| **POST** | `/api/v1/walks/` | `app/api/v1/endpoints/walks_builder.py:56-80` |
| **PUT** | `/api/v1/walks/{id}` | `app/api/v1/endpoints/walks_builder.py:86-126` |
| **DELETE** | `/api/v1/walks/{id}` | `app/api/v1/endpoints/walks_builder.py:129-139` |
| **POST** | `/api/v1/walks/{id}/validate` | `app/api/v1/endpoints/walks_builder.py:142-157` |
| **POST** | `/api/v1/walks/{id}/publish` | `app/api/v1/endpoints/walks_builder.py:160-205` |
| **POST** | `/api/v1/walks/{id}/new_version` | `app/api/v1/endpoints/walks_builder.py:208-234` |
| **GET** | `/api/v1/explorer/walks` | `app/api/v1/endpoints/explorer.py:52-85` |
| **GET** | `/api/v1/explorer/walks/{id}` | `app/api/v1/endpoints/explorer.py:88-133` |
| **POST** | `/api/v1/explorer/walks/{id}/start` | `app/api/v1/endpoints/explorer.py:136-150` |
| **POST** | `/api/v1/explorer/stops/{poi_id}/unlock` | `app/api/v1/endpoints/explorer.py:153-181` |
| **POST** | `/api/v1/explorer/sessions/{id}/complete` | `app/api/v1/endpoints/explorer.py:184-196` |
| **GET** | `/api/v1/content/dashboard/items` | `app/api/v1/endpoints/content.py:10-28` |
| **POST** | `/api/v1/gamification/quest/sync` | `app/api/v1/endpoints/gamification.py:13-31` |
| **GET** | `/api/v1/gamification/levels` | `app/api/v1/endpoints/gamification.py:13-19` |
| **POST** | `/api/v1/gamification/walk/finish` | `app/api/v1/endpoints/gamification.py:34-63` |
| **POST** | `/api/v1/gamification/visit` | `app/api/v1/endpoints/gamification.py:66-120` |
| **GET** | `/api/v1/quizzes/monument/{monument_id}/next` | `app/api/v1/endpoints/quizzes.py` |
| **POST** | `/api/v1/quizzes/{quiz_id}/answer` | `app/api/v1/endpoints/quizzes.py` |
| **POST** | `/api/v1/social/follow/{user_id}` | `app/api/v1/endpoints/social.py:13-33` |
| **POST** | `/api/v1/social/unfollow/{user_id}` | `app/api/v1/endpoints/social.py:36-52` |
| **GET** | `/api/v1/social/feed` | `app/api/v1/endpoints/social.py:55-66` |
| **GET** | `/api/v1/social/trending` | `app/api/v1/endpoints/social.py:69-78` |
| **POST** | `/api/v1/chat/sessions` | `app/api/v1/endpoints/chat.py` |
| **POST** | `/api/v1/chat/sessions/{session_id}/messages` | `app/api/v1/endpoints/chat.py` |

## Detailed Route Descriptions

### POST /api/v1/auth/register
- **Description**: Register a new user. Checks for existing email, creates identity and profile, and triggers verification email.
- **When to Use**: When a new user signs up.
- **Request Specification**:
    - **Body**: JSON
      ```json
      {
        "email": "user@example.com",
        "password": "strongpassword",
        "handle": "userhandle"
      }
      ```
- **Response Specification**:
    - **Success (200)**: `UserResponse` object with user details (id, email, handle, etc.).
    - **Error (400)**: Email already registered.

### POST /api/v1/auth/login
- **Description**: Authenticate a user and return an access token.
- **When to Use**: To log in a user and obtain a token for authorized requests.
- **Request Specification**:
    - **Body**: JSON
      ```json
      {
        "email": "user@example.com",
        "password": "password"
      }
      ```
- **Response Specification**:
    - **Success (200)**:
      ```json
      {
        "access_token": "jwt_token",
        "token_type": "bearer",
        "user_id": "uuid",
        "is_verified": true
      }
      ```
    - **Error (400)**: Incorrect email or password.

### GET /api/v1/pois/
- **Description**: Get all POIs with optional filtering (type) and geospatial search.
- **When to Use**: To fetch a list of monuments or events, optionally near a specific location.
- **Request Specification**:
    - **Query Parameters**:
        - `type`: Optional string ("monument" or "event").
        - `lat`: Optional float (latitude).
        - `lng`: Optional float (longitude).
        - `radius`: Optional float (meters, default 1000).
        - `limit`: Optional int.
        - `offset`: Optional int.
- **Response Specification**:
    - **Success (200)**: List of POI objects.

### GET /api/v1/users/profile/me
- **Description**: Get the current authenticated user's profile.
- **When to Use**: To display the logged-in user's own profile information.
- **Request Specification**:
    - **Headers**: `Authorization: Bearer <token>`
- **Response Specification**:
    - **Success (200)**: `UserResponse` object.

### GET /api/v1/explorer/walks
- **Description**: Discover published walks. Can filter by date feasibility (future implementation).
- **When to Use**: To show the user available walks to explore.
- **Request Specification**:
    - **Query Parameters**:
        - `date`: Optional datetime string.
        - `is_latest`: Boolean (default True).
- **Response Specification**:
    - **Success (200)**: List of `Walk` objects (metadata only, secrets stripped/safe).

### POST /api/v1/walks/
- **Description**: Create a new Walk structure. **Requires Admin privileges.**
- **When to Use**: When an admin or content creator starts a new walk draft.
- **Request Specification**:
    - **Body**: JSON
      ```json
      {
        "title": "Historical Paris",
        "description": "A walk through history.",
        "stops": ["poi_id_1", "poi_id_2"],
        "difficulty": "medium",
        "estimated_duration_minutes": 90
      }
      ```
- **Response Specification**:
    - **Success (201)**: `Walk` object.
    - **Error (400)**: If a POI ID in `stops` is not found.

### POST /api/v1/explorer/stops/{poi_id}/unlock
- **Description**: Unlock a POI's secret content if the user is within range.
- **When to Use**: when a user arrives at a stop during a walk and wants to see hidden content.
- **Request Specification**:
    - **Path Parameters**: `poi_id` (string).
    - **Body**: JSON
        ```json
        {
            "lat": 48.8584,
            "lng": 2.2945
        }
        ```
- **Response Specification**:
    - **Success (200)**:
        ```json
        {
            "success": true,
            "message": "Unlocked!",
             "hidden_description": "...",
             "hidden_media": []
        }
        ```

### GET /api/v1/gamification/levels
- **Description**: Fetch all defined levels and their rewards.
- **When to Use**: To display the "XP Path" or "Level Progression" screen to the user.
- **Response Specification**:
    - **Success (200)**: List of Level objects.
        ```json
        [
            { 
                "level": 1, 
                "xp": 0, 
                "title": "Tourist", 
                "reward": "None" 
            },
            ...
        ]
        ```

### POST /api/v1/gamification/visit
- **Description**: Register a user visit to a POI to award XP. (Decay logic applies).
- **When to Use**: When a user physically visits a location.
- **Request Specification**:
    - **Query Parameters**: `poi_id` (string).
- **Response Specification**:
    - **Success (200)**:
        ```json
        {
            "success": true,
            "xp_awarded": 100,
            "total_xp": 1500,
            "visit_count": 1,
            "leveled_up": false,
            "level_info": { "level": 3, "title": "Explorer", ... }
        }
        ```

### GET /api/v1/quizzes/monument/{monument_id}/next
- **Description**: Get a random, unanswered quiz for a specific monument.
- **When to Use**: When a user wants to play a quiz at a monument.
- **Request Specification**:
    - **Header**: `Authorization: Bearer <token>`
- **Response Specification**:
    - **Success (200)**: `QuizResponse` object (no correct answer revealed).
        ```json
        {
            "id": "quiz_id",
            "monument_id": "monument_id",
            "question": "When was it built?",
            "options": ["1800", "1900", "2000"],
            "xp_reward": 100,
            "difficulty": "EASY"
        }
        ```
    - **Empty (200)**: `null` (if no more questions available).

### POST /api/v1/quizzes/{quiz_id}/answer
- **Description**: Submit an answer for a quiz.
- **When to Use**: When a user selects an option.
- **Request Specification**:
    - **Header**: `Authorization: Bearer <token>`
    - **Body**: JSON
        ```json
        {
            "answer_index": 1
        }
        ```
- **Response Specification**:
    - **Success (200)**:
        ```json
        {
            "success": true,
            "message": "Correct!",
            "correct_answer": 1,
            "xp_earned": 100,
            "new_total_xp": 1200
        }
        ```

### POST /api/v1/chat/sessions
- **Description**: Initialize a new chat session.
- **When to Use**: When a user opens the chat interface.
- **Request Specification**:
    - **Body**: JSON
        ```json
        {
            "user_id": "user_123",
            "session_id": "optional_custom_id"
        }
        ```
- **Response Specification**:
    - **Success (200)**:
        ```json
        {
            "session_id": "session_user_123_...",
            "status": "created"
        }
        ```

### POST /api/v1/chat/sessions/{session_id}/messages
- **Description**: Send a message to the AI agent.
- **When to Use**: When a user types a message.
- **Request Specification**:
    - **Body**: JSON
        - **`location` is optional but highly recommended** for `monument` and `walk` searches. If provided, the agent uses this context.
        ```json
        {
            "message": "Find monuments near me",
            "user_id": "user_123",
            "location": {
                "lat": 48.8584,
                "lon": 2.2945
            }
        }
        ```
- **Response Specification**:
    - **Success (200)**:
        ```json
        {
            "response": "Here are some monuments..."
        }
        ```

## Usage Examples

### Register User
**Context**: Creating a new standard user account.
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
           "email": "newuser@test.com",
           "password": "securePass123",
           "handle": "TesterOne"
         }'
```

### Login
**Context**: Logging in to get an access token.
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
           "email": "newuser@test.com",
           "password": "securePass123"
         }'
```

### Fetch Nearby Monuments
**Context**: Finding monuments within 2km of a location in Paris.
```python
import requests

url = "http://localhost:8000/api/v1/pois/"
params = {
    "type": "monument",
    "lat": 48.8566,
    "lng": 2.3522,
    "radius": 2000
}
response = requests.get(url, params=params)
print(response.json())
```

### Create a Walk Draft
**Context**: An admin creating a new walk with two existing stops.
```python
import requests

token = "YOUR_ACCESS_TOKEN"
url = "http://localhost:8000/api/v1/walks/"
headers = {"Authorization": f"Bearer {token}"}
payload = {
    "title": "Seine Tour",
    "description": "Walk along the river.",
    "stops": ["65bb...", "65bc..."],
    "difficulty": "easy",
    "estimated_duration_minutes": 60
}
response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

### Unlock a Stop
**Context**: A user trying to unlock content at a POI location.
```python
import requests

token = "YOUR_ACCESS_TOKEN"
poi_id = "65bb..."
url = f"http://localhost:8000/api/v1/explorer/stops/{poi_id}/unlock"
headers = {"Authorization": f"Bearer {token}"}
payload = {
    "lat": 48.8584,
    "lng": 2.2945
}
response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

### Play Quiz
**Context**: Fetching a question and submitting an answer.
```python
import requests

token = "YOUR_ACCESS_TOKEN"
monument_id = "65bb..."

# 1. Get Question
url_next = f"http://localhost:8000/api/v1/quizzes/monument/{monument_id}/next"
res = requests.get(url_next, headers={"Authorization": f"Bearer {token}"})
quiz = res.json()

if quiz:
    print(f"Question: {quiz['question']}")
    
    # 2. Answer (assuming index 0)
    quiz_id = quiz['id']
    url_ans = f"http://localhost:8000/api/v1/quizzes/{quiz_id}/answer"
    payload = {"answer_index": 0}
    res_ans = requests.post(url_ans, json=payload, headers={"Authorization": f"Bearer {token}"})
    print(res_ans.json())
else:
    print("No more questions!")
```

## AI Agent Instructions

### MonumentExpert
- **Role**: Expert in global monuments, history, and heritage sites.
- **Tools**: `search_monuments`, `google_search`
- **Instructions**:
    - You are a scholarly guide. Use `search_monuments` to find specific local data from our database first.
    - **You MUST provide `lat` and `lon` when calling `search_monuments`.** This data comes from the user's current location context.
    - **If you do not have the location, ASK the user for it.**
    - If not found locally, use `google_search` for broader factual queries about monuments.

### TravelManager
- **Role**: Specialist in travel logistics, routes, and suggestion of activities.
- **Tools**: `search_walks`
- **Instructions**:
    - You help with 'how-to' travel. Use `search_walks` to find curated routes in our system.
    - **You MUST provide `lat` and `lon` for `search_walks`.** Obtain this from the user's context or ask them.
    - Suggest local activities near monuments. Focus on transportation, regional routes, and visitor tips.
