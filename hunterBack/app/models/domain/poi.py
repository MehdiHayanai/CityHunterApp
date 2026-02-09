from datetime import datetime
from enum import Enum
from typing import List, Optional

from beanie import Document
from pydantic import BaseModel, Field, HttpUrl

from .geo import GeoObject


class ImageMedia(BaseModel):
    url: HttpUrl
    description: Optional[str] = None
    alt_text: Optional[str] = None
    credits: Optional[str] = None


class ResourceType(str, Enum):
    TICKET = "ticket"
    WEBSITE = "website"
    SOCIAL = "social"
    ARTICLE = "article"
    VIDEO = "video"
    AUDIO_GUIDE = "audio_guide"


class ExternalResource(BaseModel):
    label: str
    url: HttpUrl
    type: ResourceType
    description: Optional[str] = None


class DayOfWeek(str, Enum):
    MONDAY = "Monday"
    TUESDAY = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY = "Thursday"
    FRIDAY = "Friday"
    SATURDAY = "Saturday"
    SUNDAY = "Sunday"


class ScheduleRule(BaseModel):
    days: List[DayOfWeek]
    open_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    close_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")


class POI(Document):
    name: str
    description: str = Field(..., description="Public teaser/description")
    short_description: Optional[str] = Field(None, max_length=150)
    location: GeoObject
    images: List[ImageMedia] = []
    resources: List[ExternalResource] = []
    tags: List[str] = []

    # Content Lock
    hidden_description: Optional[str] = Field(
        None, description="Detailed history/facts revealed on arrival"
    )
    hidden_media: List[ExternalResource] = []

    class Settings:
        name = "pois"
        is_root = True
        indexes = [[("location", "2dsphere")]]

    def get_time_window(self) -> Optional[tuple[datetime, datetime]]:
        return None


class Monument(POI):
    architectural_style: Optional[str] = None
    built_year: Optional[int] = None
    opening_rules: List[ScheduleRule] = []
    opening_hours_text: Optional[str] = None


class Event(POI):
    start_time: datetime
    end_time: datetime
    schedule_rules: List[ScheduleRule] = []
    ticket_link: Optional[HttpUrl] = None
    price_label: Optional[str] = None

    def get_time_window(self) -> Optional[tuple[datetime, datetime]]:
        return (self.start_time, self.end_time)


# --- API Schemas ---


class POIBase(BaseModel):
    name: str
    description: str
    short_description: Optional[str] = None
    location: GeoObject
    images: List[ImageMedia] = []
    resources: List[ExternalResource] = []
    tags: List[str] = []
    hidden_description: Optional[str] = None
    hidden_media: List[ExternalResource] = []


class MonumentCreate(POIBase):
    architectural_style: Optional[str] = None
    built_year: Optional[int] = None
    opening_rules: List[ScheduleRule] = []
    opening_hours_text: Optional[str] = None


class EventCreate(POIBase):
    start_time: datetime
    end_time: datetime
    schedule_rules: List[ScheduleRule] = []
    ticket_link: Optional[HttpUrl] = None
    price_label: Optional[str] = None
