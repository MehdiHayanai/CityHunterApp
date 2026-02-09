from datetime import datetime, timezone
from uuid import UUID, uuid4

from beanie import Document
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user_domain import UserStats


class UserBase(BaseModel):
    handle: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(Document, UserBase):
    """
    Beanie Document representing a user in the database.
    Replaces UserProfile and UserInDB.
    """

    hashed_password: str
    role: str = "user"  # "user" or "admin"
    level: int = 1
    xp: int = 0
    stats: UserStats = UserStats()
    collection: list[str] = []
    walks_history: list[str] = []
    quizzes_history: list[str] = []
    joined_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Beanie automatically handles _id.
    # If we want to use UUIDs as IDs, we explicitly define it.
    id: UUID = Field(default_factory=uuid4)

    class Settings:
        name = "users"

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "handle": "NeonHunter",
                "email": "hunter@example.com",
                "role": "user",
                "level": 5,
                "xp": 12500,
                "stats": {"distance": "42km", "cities": 3, "secrets": 12},
                "collection": ["item_id_1"],
            }
        },
    )


# Alias User to UserProfile for backward compatibility/readability in endpoints if preferred,
# or simply update endpoints to use User.
# Given UserInDB had hashed_password but UserProfile didn't,
# we might need a separate Response model that EXCLUDES hashed_password.


class UserResponse(UserBase):
    id: UUID
    role: str
    level: int
    xp: int
    stats: UserStats
    collection: list[str]
    joined_date: datetime

    model_config = ConfigDict(from_attributes=True)
