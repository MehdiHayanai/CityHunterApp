from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field


class Mission(BaseModel):
    """
    Describes a mission, typically visiting a location (POI).
    """

    id: str
    title: str
    target_location_id: str  # The POI ID to visit
    base_xp: int = 100
    decay_factor: float = 0.5  # Multiplier for subsequent visits
    min_xp: int = 5  # Minimum XP awarded for repeated visits


class Activity(BaseModel):
    """
    Records a user's activity, such as waiting a location.
    Embedded within the User's QuestState or similar.
    """

    type: Literal["visit", "mission_complete"] = "visit"
    target_id: str = Field(..., description="ID of the POI or Mission target")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    xp_awarded: int
    count: int = Field(
        default=1,
        description="The sequential number of this specific activity (e.g., 2nd visit)",
    )
