import pytest
import pytest_asyncio
from httpx import AsyncClient

from app.models.content import GeoPoint, Monument, Walk, WalkMetrics


@pytest_asyncio.fixture
async def content_data(db_client):
    # Insert Monuments
    paris_loc = [2.2945, 48.8584]  # Eiffel
    m1 = Monument(
        name="Eiffel Tower",
        description="Iron Lady",
        location=GeoPoint(coordinates=paris_loc),
        category="Landmark",
    )
    await m1.insert()

    far_loc = [0.0, 0.0]
    m2 = Monument(
        name="Null Island",
        description="Far away",
        location=GeoPoint(coordinates=far_loc),
        category="Landmark",
    )
    await m2.insert()

    # Insert Walk
    w1 = Walk(
        name="Paris Walk",
        description="Short walk",
        difficulty="Easy",
        stops=[str(m1.id)],
        metrics=WalkMetrics(),
        estimated_time="1h",
        distance="1km",
    )
    await w1.insert()

    return {"m1": m1, "m2": m2, "w1": w1}


@pytest.mark.asyncio
async def test_get_dashboard_items(client: AsyncClient, content_data):
    # Query near Eiffel Tower
    response = await client.get(
        "/api/v1/content/dashboard/items?lat=48.8584&lng=2.2945&radius=1000"
    )
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    names = [i["name"] for i in items]
    assert "Eiffel Tower" in names
    assert "Null Island" not in names


@pytest.mark.asyncio
async def test_get_walks(client: AsyncClient, content_data):
    response = await client.get("/api/v1/content/walks")
    assert response.status_code == 200
    walks = response.json()
    assert len(walks) >= 1
    assert walks[0]["name"] == "Paris Walk"


@pytest.mark.asyncio
async def test_get_walk_detail(client: AsyncClient, content_data):
    w1 = content_data["w1"]
    m1 = content_data["m1"]

    response = await client.get(f"/api/v1/content/walks/{w1.id}")
    assert response.status_code == 200
    detail = response.json()
    assert detail["name"] == "Paris Walk"
    assert "expanded_stops" in detail
    assert len(detail["expanded_stops"]) == 1
    item = detail["expanded_stops"][0]
    # Beanie Documents often serialize as _id by default
    if "_id" in item:
        assert item["_id"] == str(m1.id)
    else:
        assert item["id"] == str(m1.id)
