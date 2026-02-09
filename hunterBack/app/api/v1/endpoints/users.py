from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.api import deps
from app.models.user import UserResponse
from app.models.user_domain import UserProfile
from app.repositories.user_repo import UserRepository

router = APIRouter()


@router.get("/profile/me", response_model=UserResponse)
async def read_user_me(
    current_user: UserProfile = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user profile.
    """
    repo = UserRepository()
    # current_user.user_id is the identity ID
    identity = await repo.get_identity_by_id(current_user.user_id)

    email = identity.email if identity else "unknown@example.com"

    from datetime import datetime, timezone

    # Construct response
    return UserResponse(
        id=current_user.user_id,
        handle=current_user.handle,
        role=current_user.role,
        email=email,
        level=current_user.level,
        xp=current_user.xp,
        stats=current_user.stats,
        collection=current_user.collection,
        joined_date=datetime.now(timezone.utc),
    )


@router.get("/profile/{user_id}", response_model=UserResponse)
async def get_profile(
    user_id: str,
    current_user: UserProfile = Depends(deps.get_current_user),
) -> Any:
    try:
        uuid_obj = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    repo = UserRepository()
    profile = await repo.get_profile(uuid_obj)

    if not profile:
        raise HTTPException(status_code=404, detail="User not found")

    # For public profile, do we reveal email? Original code used UserResponse which HAS email.
    # We should probably mask it or fetch it if allowed.
    # For now, let's keep behavior but mask email if not me
    from datetime import datetime, timezone

    return UserResponse(
        id=profile.user_id,
        handle=profile.handle,
        role=profile.role,
        email="hidden",  # Don't reveal others' email
        level=profile.level,
        xp=profile.xp,
        stats={"distance": "0km", "cities": 0, "secrets": 0},
        collection=[],
        joined_date=datetime.now(timezone.utc),
    )


@router.patch("/profile/{user_id}")
async def update_profile(
    user_id: str,
    data: dict,
    current_user: UserProfile = Depends(deps.get_current_user),
) -> Any:
    # current_user.user_id is a UUID object
    if str(current_user.user_id) != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this profile"
        )

    # Basic update implementation
    allowed_updates = {"handle", "avatar_url"}

    filtered_data = {k: v for k, v in data.items() if k in allowed_updates}

    if filtered_data:
        await current_user.set(filtered_data)

    return {"status": "success", "updated_fields": filtered_data}
