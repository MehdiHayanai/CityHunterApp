from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from beanie import Document
from pydantic import BaseModel, Field


class UserIdentity(Document):
    id: UUID = Field(default_factory=uuid4)
    email: str
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False

    class Settings:
        name = "user_identities"


class UserStats(BaseModel):
    distance: str = "0km"
    cities: int = 0
    secrets: int = 0


class UserProfile(Document):
    user_id: UUID  # Links to UserIdentity.id
    handle: str
    role: str  # "user" or "admin"
    level: int = 1
    xp: int = 0
    avatar_url: Optional[str] = None
    stats: UserStats = UserStats()
    collection: list[str] = []
    walks_history: list[str] = []
    quizzes_history: list[str] = []  # Legacy support for quizzes

    class Settings:
        name = "user_profiles"


class ActivityLog(Document):
    user_id: UUID
    action: str  # e.g., "WALK_COMPLETED", "QUIZ_ANSWERED"
    target_id: str  # ID of the walk or monument
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict = {}  # Stores XP earned, time taken, etc.

    class Settings:
        name = "activity_logs"
