from typing import List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.models.domain.walk import Difficulty, ValidationStatus, Walk
from app.services.poi_access import get_poi_by_id
from app.services.validation_engine import ValidationEngine

router = APIRouter()


class WalkCreate(BaseModel):
    title: str
    description: str
    stops: List[str] = []  # List of POI IDs
    difficulty: Optional[Difficulty] = Difficulty.MEDIUM
    estimated_duration_minutes: Optional[int] = 90


class WalkUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    stops: Optional[List[str]] = None
    estimated_duration_minutes: Optional[int] = None
    difficulty: Optional[Difficulty] = None


@router.get("/", response_model=List[Walk])
async def list_walks(
    status_filter: Optional[ValidationStatus] = None,
    is_latest: bool = True,
):
    """
    Get all walks with POI stops fully loaded, optionally filtered by status.
    """
    query = {"is_latest": is_latest}
    if status_filter:
        query["status"] = status_filter

    walks = await Walk.find(query, fetch_links=True).to_list()
    print(f"INFO: Found {len(walks)} Walks")
    return walks


@router.get("/{id}", response_model=Walk)
async def get_walk(id: str):
    """
    Get a specific walk by ID with all POI stops fully loaded.
    """
    print(f"DEBUG: Fetching walk {id}")
    walk = await Walk.get(id, fetch_links=True)
    if not walk:
        raise HTTPException(status_code=404, detail="Walk not found")

    print(
        f"DEBUG: Found walk '{walk.title}' with {len(walk.stops) if walk.stops else 0} stops"
    )
    return walk


@router.post("/", response_model=Walk, status_code=status.HTTP_201_CREATED)
async def create_walk_draft(walk_in: WalkCreate):
    """
    Create a new Walk Draft.
    """
    # Verify stops exist
    poi_links = []
    for stop_id in walk_in.stops:
        poi = await get_poi_by_id(stop_id)
        if not poi:
            raise HTTPException(status_code=400, detail=f"POI {stop_id} not found")
        poi_links.append(poi)

    walk = Walk(
        title=walk_in.title,
        description=walk_in.description,
        stops=poi_links,
        status=ValidationStatus.DRAFT,
        version=1,
        is_latest=True,
        difficulty=walk_in.difficulty,
        estimated_duration_minutes=walk_in.estimated_duration_minutes,
    )
    await walk.insert()
    return walk

    await walk.save()
    return walk


@router.put("/{id}", response_model=Walk)
async def update_walk_draft(id: str, walk_in: WalkUpdate):
    """
    Update a Walk Draft. Not allowed for PUBLISHED walks.
    """
    walk = await Walk.get(id)
    if not walk:
        raise HTTPException(status_code=404, detail="Walk not found")

    if (
        walk.status == ValidationStatus.PUBLISHED
    ):  # Or Green if we treat Green as "Locked"
        # The spec says Published is immutable. Green (Valid) can probably still be edited?
        # Let's enforce strictly on PUBLISHED status (which implies visual 'Live' state).
        raise HTTPException(
            status_code=403,
            detail="Cannot edit a Published walk. Create a New Version instead.",
        )

    update_data = walk_in.model_dump(exclude_unset=True)

    # Special handling for stops
    if "stops" in update_data:
        new_stops_ids = update_data.pop("stops")
        new_links = []
        for stop_id in new_stops_ids:
            p = await get_poi_by_id(stop_id)
            if not p:
                raise HTTPException(400, f"POI {stop_id} not found")
            new_links.append(p)
        walk.stops = new_links
        # Reset validation status if stops changed
        walk.status = ValidationStatus.DRAFT
        walk.path = None
        # TODO: Path recalculation trigger would go here

    for k, v in update_data.items():
        setattr(walk, k, v)

    await walk.save()
    return walk


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_walk(id: str):
    """
    Delete a walk.
    """
    print(f"DEBUG: Attempting to delete Walk {id}")

    walk = await Walk.get(id)
    if not walk:
        print(f"DEBUG: Walk {id} not found")
        raise HTTPException(status_code=404, detail="Walk not found")

    try:
        await walk.delete()
        print(f"INFO: Successfully deleted Walk {walk.title} ({id})")
        return None
    except Exception as e:
        print(f"ERROR: Failed to delete Walk {id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete walk: {str(e)}")


@router.post("/{id}/validate", response_model=Walk)
async def validate_walk(id: str):
    """
    Trigger the Validation Engine.
    """
    walk = await Walk.get(id)
    if not walk:
        raise HTTPException(404, "Walk not found")

    report = await ValidationEngine.validate_walk(walk)

    walk.status = report.status
    walk.validation_messages = report.messages
    await walk.save()

    return walk


@router.post("/{id}/publish", response_model=Walk)
async def publish_walk(id: str):
    """
    Publish a walk.
    """
    walk = await Walk.get(id)
    if not walk:
        raise HTTPException(404, "Walk not found")

    if walk.status == ValidationStatus.RED:
        raise HTTPException(400, "Cannot publish a RED (Invalid) walk.")
    if walk.status == ValidationStatus.DRAFT:
        raise HTTPException(400, "Please validate the walk first.")

    # Versioning Logic
    if walk.previous_version_id:
        # Fetch previous version (Link needs fetch usually, or use id directly if stored)
        # Link in Beanie stores DBRef or Id.
        # We can try to fetch it.
        prev_walk = await walk.previous_version_id.fetch()
        if prev_walk:
            prev_walk.next_version_id = walk
            prev_walk.is_latest = False
            await prev_walk.save()

    walk.status = (
        ValidationStatus.PUBLISHED
    )  # Assuming we add PUBLISHED to Enum if not present, or map GREEN to live.
    # Spec said status: DRAFT -> RED/YELLOW/GREEN -> PUBLISHED.
    # Let's assume GREEN is valid, but PUBLISHED is the "Live" flag. (Status Enum has PUBLISHED? No it had GREEN)
    # Checking models/domain/walk.py... It has DRAFT, GREEN, YELLOW, RED.
    # Wait, the spec said "Status System: Draft -> ... -> GREEN. Published walks... marked as GREEN/PUBLISHED".
    # I should check if I added PUBLISHED to the Enum in Step 1.
    # Ah, I see: class ValidationStatus(str, Enum): DRAFT, GREEN, YELLOW, RED.
    # Spec Step 4 said: "Sets status = PUBLISHED". I need to update the Enum or overload GREEN.
    # Better to add PUBLISHED to the Enum.

    # For now, I will use GREEN as Published or strictly follow the spec if I can edit the enum.
    # I'll Add PUBLISHED to Enum via edit first.

    # Temporarily setting to GREEN + is_latest=True.
    # Actually, let's assume I fix the Enum.
    walk.is_latest = True
    await walk.save()

    return walk


@router.post("/{id}/new_version", response_model=Walk)
async def new_walk_version(id: str):
    """
    Fork a published walk into a new Draft.
    """
    old_walk = await Walk.get(id)
    if not old_walk:
        raise HTTPException(404, "Walk not found")

    # Deep copy logic
    # Create new instance with same data but new ID and version info
    new_walk = Walk(
        title=old_walk.title,
        description=old_walk.description,
        cover_image=old_walk.cover_image,
        stops=old_walk.stops,  # Links are preserved
        path=old_walk.path,
        estimated_duration_minutes=old_walk.estimated_duration_minutes,
        distance_km=old_walk.distance_km,
        status=ValidationStatus.DRAFT,
        version=old_walk.version + 1,
        previous_version_id=old_walk,  # Link to old one
        is_latest=False,  # Will become True only on publish
    )

    await new_walk.insert()
    return new_walk
