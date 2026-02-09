from enum import Enum
from typing import List, Optional

from beanie import Document, Link

from .geo import GeoLineString
from .poi import POI, ImageMedia


class ValidationStatus(str, Enum):
    DRAFT = "DRAFT"
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    RED = "RED"
    PUBLISHED = "PUBLISHED"


class Difficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class Walk(Document):
    title: str
    description: str
    cover_image: Optional[ImageMedia] = None
    stops: List[Link[POI]] = []
    path: Optional[GeoLineString] = None
    estimated_duration_minutes: Optional[int] = None
    distance_km: Optional[float] = None
    difficulty: Difficulty = Difficulty.MEDIUM
    status: ValidationStatus = ValidationStatus.DRAFT
    validation_messages: List[str] = []

    # --- Identity & Versioning ---
    creator_id: str = "ADMIN"

    version: int = 1
    # If this walk is an edit of an older one:
    previous_version_id: Optional[Link["Walk"]] = None
    # If this walk has been superseded by a newer one:
    next_version_id: Optional[Link["Walk"]] = None

    is_latest: bool = True

    class Settings:
        name = "walks"
