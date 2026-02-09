from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api import deps
from app.models.social import ActivityFeedItem, Friendship
from app.models.user_domain import UserProfile
from app.services.social_service import social_service

router = APIRouter()


@router.post("/follow/{user_id}", response_model=Friendship)
async def follow_user(
    user_id: UUID,
    current_user: UserProfile = Depends(deps.get_current_user),
):
    """
    Follow a user.
    """
    if current_user.user_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot follow yourself.",
        )

    # Verify target user exists
    # For now assuming user_id exists or handling it in service if needed.
    # Ideally should check UserRepository.

    return await social_service.follow_user(
        follower_id=current_user.user_id, followed_id=user_id
    )


@router.post("/unfollow/{user_id}")
async def unfollow_user(
    user_id: UUID,
    current_user: UserProfile = Depends(deps.get_current_user),
):
    """
    Unfollow a user.
    """
    success = await social_service.unfollow_user(
        follower_id=current_user.user_id, followed_id=user_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friendship not found.",
        )
    return {"message": "Unfollowed successfully"}


@router.get("/feed", response_model=list[ActivityFeedItem])
async def get_activity_feed(
    limit: int = 20,
    offset: int = 0,
    current_user: UserProfile = Depends(deps.get_current_user),
):
    """
    Get activity feed of followed users.
    """
    return await social_service.get_activity_feed(
        user_id=current_user.user_id, limit=limit, offset=offset
    )


@router.get("/trending")
async def get_trending_walks(
    current_user: UserProfile = Depends(deps.get_current_user),
):
    """
    Get trending walks.
    Currently returns a placeholder or empty list until Trending algorithm is implemented.
    """
    # TODO: Implement trending algorithm based on ActivityFeed or Walk visits
    return []
