from typing import Optional, Union
from beanie import PydanticObjectId
from app.models.domain.poi import POI, Monument, Event


async def get_poi_by_id(id: str) -> Optional[Union[Monument, Event, POI]]:
    """
    Retrieve a POI by ID, trying specific models if the generic POI.get() fails.
    This works around potential Beanie polymorphism configuration issues.
    """
    print(f"DEBUG: get_poi_by_id({id}) - Starting search")

    # Convert string to ObjectId if needed
    try:
        if isinstance(id, str):
            obj_id = PydanticObjectId(id)
        else:
            obj_id = id
    except Exception as e:
        print(f"ERROR: Invalid ObjectId format: {id} - {e}")
        return None

    # 1. Try generic (Root)
    print(f"DEBUG: get_poi_by_id({obj_id}) - Trying POI.get")
    poi = await POI.get(obj_id)
    if poi:
        print(f"DEBUG: Found via POI.get as {type(poi)}")
        return poi

    # 2. Try Monument
    print(f"DEBUG: get_poi_by_id({obj_id}) - Trying Monument.get")
    m = await Monument.get(obj_id)
    if m:
        print("DEBUG: Found via Monument.get")
        return m

    # 3. Try Event
    print(f"DEBUG: get_poi_by_id({obj_id}) - Trying Event.get")
    e = await Event.get(obj_id)
    if e:
        print("DEBUG: Found via Event.get")
        return e

    print(f"DEBUG: POI with ID {obj_id} not found in any model")
    return None
