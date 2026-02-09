from uuid import UUID

from pydantic import BaseModel


class BaseEvent(BaseModel):
    pass


class WalkFinishedEvent(BaseEvent):
    user_id: UUID
    walk_id: str
    duration_seconds: int
    timestamp_iso: str
