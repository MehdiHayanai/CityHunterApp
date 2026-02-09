from app.services.spatial import get_h3_index, get_neighboring_cells, is_within_cells


def test_get_h3_index():
    # Paris coordinates
    lat, lng = 48.8566, 2.3522
    index = get_h3_index(lat, lng, resolution=9)
    assert isinstance(index, str)
    assert len(index) == 15

    # Verify same coordinates yield same index
    index2 = get_h3_index(lat, lng, resolution=9)
    assert index == index2


def test_get_neighboring_cells():
    lat, lng = 48.8566, 2.3522
    index = get_h3_index(lat, lng)
    neighbors = get_neighboring_cells(index)

    # Should be 7 cells (center + 6 neighbors)
    assert len(neighbors) == 7
    assert index in neighbors


def test_is_within_cells():
    lat, lng = 48.8566, 2.3522
    index = get_h3_index(lat, lng)
    active_cells = [index]

    assert is_within_cells(lat, lng, active_cells) is True

    # Slightly different location but likely in same cell or neighbors
    assert is_within_cells(lat + 0.0001, lng, active_cells) is True

    # Very different location
    assert is_within_cells(51.5074, -0.1278, active_cells) is False  # London
