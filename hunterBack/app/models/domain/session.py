from datetime import datetime
from typing import List, Optional
from beanie import Document, Link, PydanticObjectId
from pydantic import Field
from app.models.content import Walk


class WalkSession(Document):
    """Tracks a user's active attempt at a walk."""

    user_id: str = "ADMIN"
    walk_id: Link[Walk]
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    unlocked_stops: List[PydanticObjectId] = []  # Secrets unlocked
    accepted_stops: List[str] = []  # Monument IDs found
    is_completed: bool = False
    rating: Optional[int] = Field(None, ge=1, le=5)
    review_text: Optional[str] = None

    class Settings:
        name = "walk_sessions"
