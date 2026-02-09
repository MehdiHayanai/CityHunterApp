import h3

# Constants for H3 resolution
# Resolution 9: ~0.1 km2 area, ~174m edge length
# Resolution 10: ~0.015 km2 area, ~66m edge length
H3_RESOLUTION = 9


def get_h3_index(lat: float, lng: float, resolution: int = H3_RESOLUTION) -> str:
    """
    Convert latitude and longitude to an H3 index.
    """
    return h3.latlng_to_cell(lat, lng, resolution)


def get_neighboring_cells(h3_index: str) -> list[str]:
    """
    Get the neighbor cells (k=1) for a given H3 index.
    """
    return list(h3.grid_disk(h3_index, 1))


def is_within_cells(lat: float, lng: float, active_cells: list[str]) -> bool:
    """
    Check if a given coordinate falls within the active H3 cells.
    """
    current_cell = get_h3_index(lat, lng)
    return current_cell in active_cells
