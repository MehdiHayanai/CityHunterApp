from typing import List, Optional, Union

from fastapi import APIRouter, HTTPException, Query, status

from app.models.domain.poi import (
    POI,
    Event,
    EventCreate,
    Monument,
    MonumentCreate,
)
from app.services.poi_access import get_poi_by_id

router = APIRouter()


@router.get(
    "/",
    response_model=List[POI],
    response_model_exclude={"hidden_description", "hidden_media"},
)
async def get_pois(
    type: Optional[str] = Query(
        None, description="Filter by type: 'monument' or 'event'"
    ),
    lat: Optional[float] = Query(None, description="Latitude for proximity search"),
    lng: Optional[float] = Query(None, description="Longitude for proximity search"),
    radius: float = Query(1000, description="Radius in meters (default 1km)"),
    limit: int = 20,
    offset: int = 0,
):
    """
    Get all POIs with optional filtering and geospatial search.
    """
    print(f"DEBUG: get_pois called. Type={type}, Lat={lat}, Lng={lng}")
    search_criteria = {}

    # Type filtering
    model_class = POI
    if type:
        if type.lower() == "monument":
            model_class = Monument
        elif type.lower() == "event":
            model_class = Event

    query = model_class.find(search_criteria)

    # Geospatial search
    # MongoDB $near requires a 2dsphere index and cannot be used with count() in some contexts
    # (requires sorting). Per error message, we use $geoWithin + $centerSphere which allows counting.
    if lat is not None and lng is not None:
        # radius is in meters, convert to radians
        # Earth radius ~ 6378.1 km = 6378100 m
        earth_radius_meters = 6378100.0
        radius_radians = radius / earth_radius_meters

        query = model_class.find(
            {
                "location": {
                    "$geoWithin": {"$centerSphere": [[lng, lat], radius_radians]}
                }
            }
        )

    # Apply pagination
    count = await query.count()
    print(f"DEBUG: Query matched {count} documents")
    pois = await query.limit(limit).skip(offset).to_list()
    print(f"INFO: Found {len(pois)} POIs")
    return pois


@router.get(
    "/{id}",
    response_model=POI,
    response_model_exclude={"hidden_description", "hidden_media"},
)
async def get_poi_detail(id: str):
    """
    Get a specific POI details.
    """
    print(f"DEBUG: Fetching POI {id} type(id)={type(id)}")
    poi = await POI.get(id)
    if not poi:
        print(f"DEBUG: POI.get({id}) failed. Trying concrete models...")
        m = await Monument.get(id)
        if m:
            print("DEBUG: FOUND via Monument.get()! Polymorphism issue?")
            return m
        e = await Event.get(id)
        if e:
            print("DEBUG: FOUND via Event.get()! Polymorphism issue?")
            return e

        # Check if it exists in DB raw? (Harder to do without motor client here easily)
        print("DEBUG: Not found in concrete models either.")
        raise HTTPException(status_code=404, detail="POI not found")
    print(f"DEBUG: Found POI: {poi.name} ({type(poi)})")
    return poi


@router.post("/monument", response_model=Monument, status_code=status.HTTP_201_CREATED)
async def create_monument(monument_in: MonumentCreate):
    """
    Create a new Monument.
    """
    print(f"DEBUG: create_monument called with {monument_in.name}")
    monument = Monument(**monument_in.model_dump())
    await monument.insert()
    print(f"DEBUG: Monument inserted. ID={monument.id}")
    return monument


@router.post("/event", response_model=Event, status_code=status.HTTP_201_CREATED)
async def create_event(event_in: EventCreate):
    """
    Create a new Event.
    """
    event = Event(**event_in.model_dump())
    # Potential side effect: Trigger validation check for existing walks (Not implemented yet)
    await event.insert()
    return event


@router.put("/{id}", response_model=POI)
async def update_poi(id: str, poi_in: Union[MonumentCreate, EventCreate]):
    """
    Update a POI.
    Note: Ideally we should use specific Update schemas (PATCH), putting full Create object for now.
    """
    poi = await get_poi_by_id(id)
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")

    # Update fields
    update_data = poi_in.model_dump(exclude_unset=True)

    # If trying to update specific subclass fields on a generic POI fetch,
    # we need to ensure the object is of the correct type.
    # Beanie should handle polymorphism on 'get', so 'poi' is likely a Monument or Event instance.

    for key, value in update_data.items():
        setattr(poi, key, value)

    await poi.save()
    return poi


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_poi(id: str):
    """
    Delete a POI.
    """
    print(f"DEBUG: Attempting to delete POI {id}")

    # Try to get the POI using the helper function for better polymorphism
    poi = await get_poi_by_id(id)
    if not poi:
        print(f"DEBUG: POI {id} not found")
        raise HTTPException(status_code=404, detail="POI not found")

    # Check if POI is referenced in any walks
    from app.models.domain.walk import Walk

    walks_using_poi = await Walk.find({"stops.$id": poi.id}).to_list()

    if walks_using_poi:
        walk_titles = [w.title for w in walks_using_poi[:3]]
        print(
            f"WARNING: POI {poi.name} is used in {len(walks_using_poi)} walk(s): {walk_titles}"
        )
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete POI '{poi.name}'. It is referenced in {len(walks_using_poi)} walk(s): {', '.join(walk_titles)}. Remove it from walks first.",
        )

    try:
        await poi.delete()
        print(f"INFO: Successfully deleted POI {poi.name} ({id})")
        return None
    except Exception as e:
        print(f"ERROR: Failed to delete POI {id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete POI: {str(e)}")
