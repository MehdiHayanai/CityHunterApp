from datetime import datetime
from enum import Enum
from typing import Optional

from beanie import Document
from pydantic import BaseModel, ConfigDict


class ContentType(str, Enum):
    MONUMENT = "MONUMENT"
    EVENT = "EVENT"


class GeoPoint(BaseModel):
    type: str = "Point"
    coordinates: list[float]  # [lng, lat]


class Monument(Document):
    name: str
    description: str
    location: GeoPoint
    h3_index: Optional[str] = None
    category: str
    image_url: Optional[str] = None
    swagg_reward_id: Optional[str] = None

    class Settings:
        name = "monuments"
        indexes = [[("location", "2dsphere")]]


class EventStatus(str, Enum):
    LIVE = "LIVE"
    WEEKEND = "WEEKEND"
    ENDED = "ENDED"


class Event(Document):
    name: str
    description: str
    location: GeoPoint
    status: EventStatus
    start_time: datetime
    end_time: datetime

    class Settings:
        name = "events"
        indexes = [[("location", "2dsphere")]]


class WalkMetrics(BaseModel):
    rating: float = 0.0
    visitors: int = 0


class Walk(Document):
    name: str
    description: str
    difficulty: str  # e.g., "Easy", "Medium", "Hard"
    stops: list[str] = []  # List of Monument IDs (manual reference)
    metrics: WalkMetrics = WalkMetrics()
    estimated_time: str
    distance: str
    image_url: Optional[str] = None
    is_official: bool = True

    class Settings:
        name = "walks"

    model_config = ConfigDict(populate_by_name=True)


class WalkDetail(Walk):
    expanded_stops: list[Monument] = []
