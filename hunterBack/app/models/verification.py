from datetime import datetime, timezone

from beanie import Document
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class VerificationToken(Document):
    email: str
    token: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "verification_tokens"
        indexes = [
            IndexModel(
                [("created_at", ASCENDING)],
                expireAfterSeconds=120,  # 2 minutes TTL
            )
        ]
