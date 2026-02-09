from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import BaseModel, Field

from app.models.gamification import Activity


class QuestStateBase(BaseModel):
    active_walk_id: Optional[str] = None
    current_stop_index: int = 0
    accumulated_xp: int = 0
    visited_stop_ids: list[str] = []
    activity_log: list["Activity"] = []
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class QuestState(Document, QuestStateBase):
    user_id: str  # Link to User ID

    class Settings:
        name = "quest_states"
