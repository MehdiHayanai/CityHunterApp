# FastAPI Backend Walkthrough

The backend for CityHunter has been successfully initialized using FastAPI, Motor (MongoDB Async), and Pydantic.

## 🚀 Setup & Running

### 1. Environment Variables
The `.env` file has been created. **You must update the `MONGO_URI`** with your actual MongoDB Atlas connection string before running the app.

```bash
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=hunter_db
SECRET_KEY=...
```

### 2. Run the Server
Use `uv` to run the application with live reloading:

```powershell
uv run uvicorn app.main:app --reload
```

The server will start at `http://127.0.0.1:8000`.

## 🔒 Security & Authentication

We now use **JWT (JSON Web Tokens)** for security.

- **Login**: `POST /api/v1/auth/login` (JSON) or `/api/v1/auth/access-token` (Form Data for Swagger UI).
- **Token**: Returns a Bearer token.
- **Protection**: Secured endpoints require `Authorization: Bearer <token>` header.

### How to use Swagger UI Auth
1. Go to `http://127.0.0.1:8000/docs`.
2. Click the green **Authorize** button.
3. Enter your **Email** in the "username" field and your **Password**.
4. Click **Authorize**.
5. Your lock icon should close, and you can now try protected endpoints!

## 📂 Project Structure

- **`app/core/config.py`**: Manages settings via Pydantic.
- **`app/core/security.py`**: Password hashing and JWT generation.
- **`app/api/deps.py`**: Auth dependencies (`get_current_user`).
- **`app/db/mongodb.py`**: Handles async MongoDB connections.
- **`app/models`**: Contains Pydantic models (User, Monument, Walk, QuestState).
- **`app/api/v1`**: Contains all route handlers.

## 🔌 API Endpoints

### Auth (`/api/v1/auth`)
- `POST /register`: Register a new user.
- `POST /login`: Authenticate and get a token.
- `POST /access-token`: OAuth2 compliant login for Docs.

### User (`/api/v1/users`)
- `GET /profile/me`: Get **current** user profile (Protected).
- `GET /profile/{user_id}`: Get user profile (Protected).
- `PATCH /profile/{user_id}`: Update user stats/settings (Protected + Ownership Check).

### Content (`/api/v1/content`)
- `GET /dashboard/items`: Get monuments nearby.
- `GET /walks`: List available walks.
- `GET /walks/{walk_id}`: Get walk details.

### Gamification (`/api/v1/gamification`)
- `POST /quest/sync`: Sync player quest state (Protected).
- `POST /quest/stop/complete`: Verify answer and award XP (Protected).

## 🛠️ Next Steps

1.  **Connect Database**: Fill in your MongoDB connection string.
2.  **Seed Data**: Add monuments/walks to DB.
3.  **Refine Logic**: Implement actual geospatial queries.
