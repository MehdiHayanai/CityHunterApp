from typing import Any, List, Dict
from fastapi import APIRouter
from app.models.content import Monument
from app.services.spatial import get_h3_index, get_neighboring_cells

router = APIRouter()

# In-memory cache for H3 cell results
# {h3_index: [monuments]}
H3_CACHE: Dict[str, List[Monument]] = {}


@router.get("/dashboard/items", response_model=List[Monument])
async def get_dashboard_items(lat: float, lng: float, radius: float = 5000) -> Any:
    """
    Get monuments near a location using H3 hexagonal indexing and caching.
    """
    current_h3 = get_h3_index(lat, lng)

    # If hit current cell, return immediately
    if current_h3 in H3_CACHE:
        return H3_CACHE[current_h3]

    # hit = False
    # If miss, query DB using $near (broadcast search)
    # This radius should ideally cover the current cell and neighbors
    monuments = await Monument.find(
        {
            "location": {
                "$near": {
                    "$geometry": {"type": "Point", "coordinates": [lng, lat]},
                    "$maxDistance": radius,
                }
            }
        }
    ).to_list()

    # Map results to their respective H3 cells and update cache
    # Also set h3_index on monuments if missing (for future DB queries)
    active_cells = [current_h3] + get_neighboring_cells(current_h3)

    # Initialize cache for active cells to avoid repeat DB hits for empty cells
    for cell in active_cells:
        if cell not in H3_CACHE:
            H3_CACHE[cell] = []

    for m in monuments:
        m_lat, m_lng = m.location.coordinates[1], m.location.coordinates[0]
        m_h3 = get_h3_index(m_lat, m_lng)

        # Ensure monument has its h3_index set
        if not m.h3_index:
            m.h3_index = m_h3

        if m_h3 in active_cells:
            H3_CACHE[m_h3].append(m)
        else:
            # Also cache other cells found in this broad query
            if m_h3 not in H3_CACHE:
                H3_CACHE[m_h3] = []
            H3_CACHE[m_h3].append(m)

    return H3_CACHE.get(current_h3, [])
