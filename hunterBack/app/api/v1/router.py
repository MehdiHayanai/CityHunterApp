from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    chat,
    content,
    explorer,
    gamification,
    pois,
    quizzes,
    social,
    users,
    walks_builder,
)

# Public router for authentication and other open endpoints
public_router = APIRouter()

# Create separate routers for public and protected auth endpoints
auth_public_router = APIRouter()
auth_protected_router = APIRouter()

# Public auth routes (no authentication required)
auth_public_router.add_api_route("/login", auth.login, methods=["POST"])
auth_public_router.add_api_route(
    "/access-token", auth.login_access_token, methods=["POST"]
)

# Protected auth routes (API key required)
auth_protected_router.add_api_route("/register", auth.register, methods=["POST"])
auth_protected_router.add_api_route(
    "/verify-email", auth.verify_email, methods=["POST"]
)
auth_protected_router.add_api_route(
    "/request-verification", auth.request_verification, methods=["POST"]
)

# Include public auth routes
public_router.include_router(auth_public_router, prefix="/auth", tags=["auth"])

# Protected router for endpoints requiring an API key
api_router = APIRouter()
api_router.include_router(auth_protected_router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(pois.router, prefix="/pois", tags=["pois"])
api_router.include_router(walks_builder.router, prefix="/walks", tags=["walks"])
api_router.include_router(explorer.router, prefix="/explorer", tags=["explorer"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(
    gamification.router, prefix="/gamification", tags=["gamification"]
)
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["quizzes"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(social.router, prefix="/social", tags=["social"])
