City Exploration App - Technical Specification

1. Executive Summary

This document outlines the technical architecture and functional requirements for a location-based City Exploration Application. The platform connects permanent Monuments and ephemeral Events into curated Walks, allowing users to explore a city through time-sensitive itineraries.

Core Value Proposition:
Unlike standard map apps, this system solves the "validity problem" of city tourism. It ensures that a suggested itinerary is actually doable at the user's specific time of visit by calculating the intersection of opening hours and event schedules.

Key Technical Pillars:

Polymorphic POI System: A unified architecture handling both permanent structures (Monuments) and temporary occurrences (Events) to allow seamless querying.

Dynamic Feasibility Engine: An algorithmic approach to validation that flags "Impossible Walks" (e.g., non-overlapping events) before they are published.

Gamified Exploration: A "Content Unlock" system that requires physical presence (Geofencing) to access exclusive digital rewards, tracked via a session-based architecture.

Immutable Versioning: Published walks are immutable. Editing a published experience creates a new version linked to the original, preserving the history of user experiences.

2. Functional Requirements

A. Point of Interest (POI) Management

Functions to manage the raw data of the city (Monuments & Events).

Monuments (Permanent):

Create/Edit with details like architectural style, built year, and opening hours.

Search by tags (e.g., "Art Deco") or proximity.

Events (Ephemeral):

Define global start/end dates and specific weekly schedules.

Clone recurring events for rapid data entry.

Auto-archive events past their end date.

Shared Features:

Rich media galleries with captions/credits.

External resource linking (Tickets, Socials).

Geospatial Search: "Find everything within 2km."

B. Walk Management (Creator Tools)

Functions for creators to build itineraries.

Walk Builder:

Drag-and-drop stop ordering.

Path definition (Manual drawing or Auto-routing via API).

Auto-calculation of distance and duration.

Validation Logic:

Check Feasibility: Algorithmically verify that all stops are open simultaneously.

Status System: Draft $\rightarrow$ Validation Error (Red) $\rightarrow$ Warning (Yellow) $\rightarrow$ Published (Green).

Versioning System:

Published walks become Read-Only.

"Editing" a published walk forks it into a new Draft (Version N+1).

Old versions retain a pointer to the new version.

C. User Experience (Explorer)

Functions for the end-user.

Discovery:

Filter walks by date (checking dynamic validity), theme, or duration.

Cluster map views for high-density areas.

Active Navigation:

Start Session: distinct tracking of a user's attempt.

Geofencing Unlock: Verify user location (<50m) to reveal hidden content (Audio/History).

Completion: Rate and review walks upon finishing.

3. Data Models (Python/Beanie)

The following Pydantic models define the database schema.

Implementation Note: Security is currently simplified. All creator_id fields default to "ADMIN" pending full auth implementation.

from typing import List, Optional, Union
from datetime import datetime, timedelta, time
from enum import Enum
import motor.motor_asyncio
from beanie import Document, Link, init_beanie, PydanticObjectId
from pydantic import BaseModel, Field, HttpUrl

# --- Value Objects ---

class GeoObject(BaseModel):
    type: str = "Point"
    coordinates: List[float] 

class GeoLineString(BaseModel):
    type: str = "LineString"
    coordinates: List[List[float]] 

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

class ValidationStatus(str, Enum):
    DRAFT = "DRAFT"
    GREEN = "GREEN"   
    YELLOW = "YELLOW" 
    RED = "RED"
    # Published walks are effectively immutable in business logic,
    # but still marked as GREEN/PUBLISHED in status.

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

# --- POI Hierarchy ---

class POI(Document):
    name: str
    description: str = Field(..., description="Public teaser/description")
    short_description: Optional[str] = Field(None, max_length=150)
    location: GeoObject
    images: List[ImageMedia] = []
    resources: List[ExternalResource] = []
    tags: List[str] = [] 

    # Content Lock
    hidden_description: Optional[str] = Field(None, description="Detailed history/facts revealed on arrival")
    hidden_media: List[ExternalResource] = [] 

    class Settings:
        name = "pois"  
        is_root = True 

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

# --- Walk & Session Models ---

class Walk(Document):
    title: str
    description: str 
    cover_image: Optional[ImageMedia] = None 
    stops: List[Link[POI]] = [] 
    path: Optional[GeoLineString] = None 
    estimated_duration_minutes: Optional[int] = None
    distance_km: Optional[float] = None
    status: ValidationStatus = ValidationStatus.DRAFT
    validation_messages: List[str] = []

    # --- Identity & Versioning ---
    creator_id: str = "ADMIN" # Default placeholder for MVP
    
    version: int = 1
    # If this walk is an edit of an older one:
    previous_version_id: Optional[Link['Walk']] = None 
    # If this walk has been superseded by a newer one:
    next_version_id: Optional[Link['Walk']] = None 
    
    is_latest: bool = True # Helper to find current versions quickly

    class Settings:
        name = "walks"

class WalkSession(Document):
    """Tracks a user's active attempt at a walk."""
    user_id: str = "ADMIN" # Default placeholder
    walk_id: Link[Walk]
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    unlocked_stops: List[PydanticObjectId] = []
    is_completed: bool = False
    rating: Optional[int] = Field(None, ge=1, le=5)
    review_text: Optional[str] = None

    class Settings:
        name = "walk_sessions"


4. API Reference and Context

Global Security Note:
Authentication is currently disabled. All requests are treated as authorized. The creator_id and user_id fields will automatically populate with "ADMIN" if not provided. Future updates will introduce JWT validation.

4.1 POI Management Routes

Context: These endpoints are primarily used by Content Creators and Admins. They populate the database with the raw building blocks (Places) that Walks are built upon.

General Discovery

Endpoint: GET /pois

Access: Public

Context: This is the heavy-lifting endpoint for the main map view.

Filtering: Must support type (Event vs. Monument) to allow toggling layers on the map.

Pagination: Should implement limit/offset or cursor-based pagination to prevent overloading the client when 1000+ POIs exist in a city center.

Geospatial: Uses MongoDB $near queries.

Monuments & Events

Endpoint: POST /monuments / POST /events

Access: Open (Default: ADMIN)

Context:

Data Entry: Supports rich text (Markdown) for description.

Gamification: hidden_description is set here.

Events Side Effect: If start_time or end_time is modified on an Event, the system trigger a background job to check if any Draft Walks are now invalid. (Published walks are immutable so they don't break, they just become historically inaccurate).

4.2 Walk Management Routes

Context: These endpoints constitute the "Builder" experience. They involve complex state management including the new Versioning logic.

Builder Lifecycle

Endpoint: POST /walks

Access: Open (Default: ADMIN)

Context: Creates a skeletal object. version defaults to 1. is_latest defaults to True.

Endpoint: PATCH /walks/{id}

Access: Open (Default: ADMIN)

Context (Immutability Check):

Logic: The API checks the status of the walk.

If status is DRAFT, RED, or YELLOW: Updates are allowed.

If status is PUBLISHED (or GREEN): Updates are Forbidden (403). The client must use the "New Version" endpoint.

Stops Update: If stops change, path and distance_km reset to None.

Endpoint: POST /walks/{id}/new_version

Access: Open (Default: ADMIN)

Context (Versioning Fork):

Input: ID of a Published walk.

Logic:

Creates a deep copy of the Walk data.

Sets new walk status = DRAFT.

Sets new walk version = old_walk.version + 1.

Sets new walk previous_version_id = old_walk._id.

Returns the new Walk ID.

Note: The old walk is NOT modified yet. The link is established, but the "pointer" update happens on publish.

Validation & Publishing

Endpoint: POST /walks/{id}/validate

Access: Open (Default: ADMIN)

Context: Runs the intersection algorithm.

Endpoint: POST /walks/{id}/publish

Access: Open (Default: ADMIN)

Context:

Logic:

Checks if status is valid (not RED).

Versioning Update: If this walk has a previous_version_id:

It fetches the Previous Version.

It sets previous_walk.next_version_id = current_walk._id.

It sets previous_walk.is_latest = False.

Sets current walk status = PUBLISHED and is_latest = True.

4.3 Explorer Experience Routes

Context: High-volume, read-heavy endpoints for end-users.

Discovery

Endpoint: GET /explorer/walks

Access: Public

Context:

Version Filter: By default, this endpoint returns only walks where is_latest = True. Users generally shouldn't see old versions unless they are viewing their own history.

Dynamic Filtering: Filters based on date validity.

Endpoint: GET /explorer/walks/{id}

Access: Public

Context (Security):

Sanitization: MUST strip hidden_description and hidden_media from the nested POI objects.

Active Session (Gamification)

Endpoint: POST /explorer/walks/{id}/start

Access: Open (Default: ADMIN)

Context: Creates a WalkSession.

Endpoint: POST /explorer/stops/{poi_id}/unlock

Access: Open (Default: ADMIN)

Context:

Geofence Check: Server calculates distance (Haversine formula).

If distance < 50m: Returns 200 OK with hidden content.

If distance > 50m: Returns 403 Forbidden.