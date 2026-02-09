from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.handlers.gamification  # Register handlers
from app.api.deps import get_api_key
from app.api.v1.router import api_router, public_router
from app.core.config import settings
from app.db.mongodb import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("INFO: Starting up...")
    print(f"INFO: Initializing database connection to {settings.DB_NAME}...")
    try:
        await init_db()
        print("INFO: Database initialization complete.")
    except Exception as e:
        print(f"ERROR: Database initialization failed: {e}")
        # Re-raise to crash early if DB is required
        raise e
    yield
    # Shutdown
    print("INFO: Shutting down...")
    pass


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Event Handling Middleware
    from fastapi_events.handlers.local import local_handler
    from fastapi_events.middleware import EventHandlerASGIMiddleware

    app.add_middleware(EventHandlerASGIMiddleware, handlers=[local_handler])

# Public routes (no API key required)
app.include_router(public_router, prefix=settings.API_V1_STR)

# Protected routes (required API key)
app.include_router(
    api_router, prefix=settings.API_V1_STR, dependencies=[Depends(get_api_key)]
)


@app.get(f"{settings.API_V1_STR}/test-api-key", dependencies=[Depends(get_api_key)])
async def test_api_key():
    return {"message": "API Key is valid and correctly injected"}


@app.get("/")
def root():
    return {"message": "Welcome to CityHunter API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
