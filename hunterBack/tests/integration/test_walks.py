import pytest
from httpx import AsyncClient


# Mark all tests to use the async fixture (requires pytest-asyncio)
pytestmark = pytest.mark.asyncio


async def test_poi_creation_and_retrieval(client: AsyncClient):
    # 1. Create a Monument
    payload = {
        "name": "Test Monument",
        "description": "Test Description",
        "location": {"type": "Point", "coordinates": [2.35, 48.85]},
        "architectural_style": "Gothic",
        "opening_rules": [
            {"days": ["Monday"], "open_time": "09:00", "close_time": "18:00"}
        ],
    }
    response = await client.post("/api/v1/pois/monument", json=payload)
    assert response.status_code == 201
    monument_id = response.json()["_id"]

    # 2. Retrieve it
    response = await client.get(f"/api/v1/pois/{monument_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Test Monument"


async def test_walk_lifecycle(client: AsyncClient):
    # 1. Create 2 POIs
    m1 = await client.post(
        "/api/v1/pois/monument",
        json={
            "name": "M1",
            "description": "D1",
            "location": {"coordinates": [0, 0]},
            "opening_rules": [
                {"days": ["Monday"], "open_time": "09:00", "close_time": "17:00"}
            ],
        },
    )
    m2 = await client.post(
        "/api/v1/pois/monument",
        json={
            "name": "M2",
            "description": "D2",
            "location": {"coordinates": [0.01, 0.01]},  # Close enough
            "opening_rules": [
                {"days": ["Monday"], "open_time": "10:00", "close_time": "18:00"}
            ],
        },
    )
    m1_id = m1.json()["_id"]
    m2_id = m2.json()["_id"]

    # 2. Create Draft Walk
    walk_payload = {
        "title": "Integration Walk",
        "description": "Testing flow",
        "stops": [m1_id, m2_id],
    }
    walk_res = await client.post("/api/v1/walks/", json=walk_payload)
    assert walk_res.status_code == 201
    walk_id = walk_res.json()["_id"]
    assert walk_res.json()["status"] == "DRAFT"

    # 3. Validate Walk
    # Overlap M1 (9-17) & M2 (10-18) is 10-17. Should be GREEN.
    val_res = await client.post(f"/api/v1/walks/{walk_id}/validate")
    assert val_res.status_code == 200
    assert val_res.json()["status"] == "GREEN"

    # 4. Publish Walk
    pub_res = await client.post(f"/api/v1/walks/{walk_id}/publish")
    assert pub_res.status_code == 200
    # Based on our implementation decision, we added PUBLISHED to Enum or kept GREEN.
    # Assuming user applied the edit to add PUBLISHED.
    assert pub_res.json()["status"] == "PUBLISHED"

    # 5. Explorer Discovery
    explore_res = await client.get("/api/v1/explorer/walks")
    assert explore_res.status_code == 200
    walks = explore_res.json()
    assert any(w["_id"] == walk_id for w in walks)


async def test_geofence_unlock(client: AsyncClient):
    # 1. Create POI with Secret
    poi_res = await client.post(
        "/api/v1/pois/monument",
        json={
            "name": "Secret Spot",
            "description": "Public",
            "location": {"coordinates": [2.0, 48.0]},  # Lon, Lat
            "hidden_description": "Super Secret",
        },
    )
    poi_id = poi_res.json()["_id"]

    # 2. Try unlock from far away (Lat 48.1 is > 10km away)
    unlock_fail = await client.post(
        f"/api/v1/explorer/stops/{poi_id}/unlock", json={"lat": 48.1, "lng": 2.0}
    )
    assert unlock_fail.json()["success"] is False

    # 3. Try unlock from close (Lat 48.000001 is very close)
    unlock_success = await client.post(
        f"/api/v1/explorer/stops/{poi_id}/unlock", json={"lat": 48.0, "lng": 2.0}
    )
    assert unlock_success.json()["success"] is True
    assert unlock_success.json()["hidden_description"] == "Super Secret"
