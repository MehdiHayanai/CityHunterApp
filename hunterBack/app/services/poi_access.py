from typing import Optional, Union
from app.models.domain.poi import POI, Monument, Event


async def get_poi_by_id(id: str) -> Optional[Union[Monument, Event, POI]]:
    """
    Retrieve a POI by ID, trying specific models if the generic POI.get() fails.
    This works around potential Beanie polymorphism configuration issues.
    """
    # 1. Try generic (Root)
    print(f"DEBUG: get_poi_by_id({id}) - Trying POI.get")
    poi = await POI.get(id)
    if poi:
        print(f"DEBUG: Found via POI.get as {type(poi)}")
        return poi

    # 2. Try Monument
    print(f"DEBUG: get_poi_by_id({id}) - Trying Monument.get")
    m = await Monument.get(id)
    if m:
        print("DEBUG: Found via Monument.get")
        return m

    # 3. Try Event
    print(f"DEBUG: get_poi_by_id({id}) - Trying Event.get")
    e = await Event.get(id)
    if e:
        print("DEBUG: Found via Event.get")
        return e

    print("DEBUG: Not found in any model")
    return None
