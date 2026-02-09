from datetime import datetime
from math import asin, cos, radians, sin, sqrt
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from app.models.domain.poi import POI, ExternalResource
from app.models.domain.session import WalkSession
from app.models.domain.walk import ValidationStatus, Walk

router = APIRouter()


# --- Helpers ---
def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in meters between two points
    on the earth (specified in decimal degrees)
    """
    R = 6371000  # Radius of earth in meters
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )
    c = 2 * asin(sqrt(a))
    return R * c


class UnlockRequest(BaseModel):
    lat: float
    lng: float


class SessionCompleteRequest(BaseModel):
    rating: int
    review_text: Optional[str] = None


class UnlockResponse(BaseModel):
    success: bool
    message: str
    hidden_description: Optional[str] = None
    hidden_media: List[ExternalResource] = []


# --- Endpoints ---


@router.get("/walks", response_model=List[Walk])
async def get_explorer_walks(
    date: Optional[datetime] = Query(
        None, description="Filter for feasibility on this date"
    ),
    is_latest: bool = True,
):
    """
    Discover published walks.
    """
    # 1. Base Query
    query = {"status": ValidationStatus.PUBLISHED, "is_latest": is_latest}

    walks = await Walk.find(query).to_list()

    # 2. Dynamic Feasibility Filter
    if date:
        # TODO: Implement granular checking.
        # For MVP, we pass the date to the Validation Engine for each walk
        # and filter out those that are impossible.
        # This is N+1 query pattern if checking DB again.
        # ValidationEngine currently checks vs "Next 7 days" or generic.
        # We need a `check_feasibility(walk, specific_date)` method.
        # For now, return all, assuming client filters or we iterate.
        # filtered = []
        for walk in walks:
            # Create ephemeral report for the specific date
            # (This logic would move to ValidationEngine for production)
            # Assumption: If Status is PUBLISHED/GREEN, it's generally good,
            # but we want to know if it's open on *That specific date*.
            pass
            # For this step, we'll just return the walks.

    return walks


@router.get("/walks/{id}", response_model=Walk)
async def get_walk_detail(id: str):
    """
    Get generic walk details (Safe View - Secrets Stripped).
    """
    walk = await Walk.get(id)
    if not walk:
        raise HTTPException(404, "Walk not found")

    # Security: Strip hidden content from stops.
    # Beanie fetches links on demand or if linked.
    # If we return the Walk model, Pydantic serialization happens.
    # We need to manually ensure we don't leak secrets.
    # Option 1: Use a Response Model that excludes 'hidden_description' on POIs.
    # Option 2: Manually fetch and clear.

    # We'll rely on the ResponseModel of the endpoint BUT Walk contains `stops: List[Link[POI]]`.
    # Pydantic serialization of Link might be tricky if it fetches.
    # Usually `Link` serializes to ID.
    # If the user wants full details including POI data, they might need a populated view.
    # Let's assume the frontend fetches POIs separately via `/pois/{id}` which safeguards secrets,
    # OR we return a populated walk here.

    # Ideally: Fetch stops, create a view with sanitized POIs.
    if walk.stops:
        sanitized_stops = []
        for link in walk.stops:
            poi = await link.fetch()
            if poi:
                # Manually clear secrets in memory before returning
                # Be careful not to save()!
                poi.hidden_description = None
                poi.hidden_media = []
                sanitized_stops.append(poi)

        # We can't easily replace the Links in the Walk object with solid POIs
        # unless the Model expects it.
        # Current Walk model has `stops: List[Link[POI]]`.
        # So the response will just contain IDs.
        # The frontend will call `GET /pois/{id}` for each stop,
        # and THAT endpoint (implemented in Step 2) excludes hidden fields.
        # Implemented in Step 2: `@router.get("/{id}", ... response_model_exclude={"hidden_description"...})`
        # So we are SAFE.
        pass

    return walk


@router.post(
    "/walks/{id}/start", response_model=WalkSession, status_code=status.HTTP_201_CREATED
)
async def start_walk_session(id: str):
    walk = await Walk.get(id)
    if not walk:
        raise HTTPException(404, "Walk not found")

    session = WalkSession(
        walk_id=walk,
        start_time=datetime.utcnow(),
        user_id="ADMIN",  # MVP
    )
    await session.insert()
    return session


@router.post("/stops/{poi_id}/unlock", response_model=UnlockResponse)
async def unlock_stop(poi_id: str, request: UnlockRequest):
    """
    Attempt to unlock a POI's secret content based on location.
    """
    poi = await POI.get(poi_id)
    if not poi:
        raise HTTPException(404, "POI not found")

    # Geofence Check
    poi_lat = poi.location.coordinates[1]  # GeoJSON is [Lon, Lat]
    poi_lng = poi.location.coordinates[0]

    dist = haversine_distance(request.lat, request.lng, poi_lat, poi_lng)

    if dist <= 75:  # 75m tolerance to be generous
        return UnlockResponse(
            success=True,
            message="Unlocked!",
            hidden_description=poi.hidden_description,
            hidden_media=poi.hidden_media,
        )
    else:
        return UnlockResponse(
            success=False,
            message=f"Too far away! ({int(dist)}m)",
            hidden_description=None,
            hidden_media=[],
        )


@router.post("/sessions/{id}/complete", response_model=WalkSession)
async def complete_session(id: str, request: SessionCompleteRequest):
    session = await WalkSession.get(id)
    if not session:
        raise HTTPException(404, "Session not found")

    session.end_time = datetime.utcnow()
    session.is_completed = True
    session.rating = request.rating
    session.review_text = request.review_text

    await session.save()
    return session
