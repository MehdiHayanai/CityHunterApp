from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

from beanie import Document
from pydantic import ConfigDict, Field


class Friendship(Document):
    """
    Represents a directional follow relationship: Follower follows Followed.
    """

    follower_id: UUID
    followed_id: UUID
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "friendships"

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "follower_id": "123e4567-e89b-12d3-a456-426614174000",
                "followed_id": "987fcdeb-51a2-43c4-9876-543210987654",
                "created_at": "2023-01-01T12:00:00Z",
            }
        }
    )


class ActivityFeedItem(Document):
    """
    Represents an event in the social feed (e.g., User X completed Walk Y).
    """

    user_id: UUID
    type: str  # e.g., 'walk_completed', 'level_up', 'badge_earned'
    target_id: Optional[str] = None  # ID of the walk, badge, etc.
    metadata: dict[str, Any] = {}  # Extra data (e.g., walk name, badge name)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "activity_feed"

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "type": "walk_completed",
                "target_id": "walk_123",
                "metadata": {"walk_name": "Brutalist London", "score": 95},
                "created_at": "2023-01-01T12:00:00Z",
            }
        }
    )
