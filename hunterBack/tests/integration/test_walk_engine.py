import pytest
from beanie import init_beanie
from mongomock_motor import AsyncMongoMockClient

from app.models.user import User
from app.models.content import Walk, Monument
from app.models.domain.session import WalkSession
from app.models.gamification import Level
from app.api.v1.endpoints.gamification import finish_walk


import pytest_asyncio


@pytest_asyncio.fixture
async def mock_db():
    client = AsyncMongoMockClient()
    await init_beanie(
        database=client.test_db,
        document_models=[User, Walk, WalkSession, Monument, Level],
    )
    # create default levels
    await Level(level=1, xp=0, title="Novice", reward="None").create()
    await Level(level=2, xp=500, title="Walker", reward="Bag").create()
    return client


@pytest.mark.asyncio
async def test_finish_walk_logic(mock_db):
    # 1. Setup Data
    user = await User(
        email="test@example.com",
        handle="testuser",
        hashed_password="...",
        role="user",
        xp=0,
        walks_history=[],
    ).create()

    monument1 = await Monument(
        name="Tour Eiffel",
        description="Eiffel Tower",
        location={"type": "Point", "coordinates": [2.2945, 48.8584]},
        category="landmark",
    ).create()

    walk = await Walk(
        name="Parisian Landmarks",
        description="Walk around Paris",
        stops=[str(monument1.id)],
        difficulty="Easy",
        estimated_time="30 min",
        distance="2 km",
    ).create()

    session = await WalkSession(
        user_id=str(user.id), walk_id=walk, accepted_stops=[]
    ).create()

    # 2. Try to finish walk without all stops accepted
    res = await finish_walk(str(session.id), current_user=user)
    assert res["status"] == "partial_completion"

    # 3. Mark stop as accepted and finish
    session.accepted_stops = [str(monument1.id)]
    await session.save()

    res = await finish_walk(str(session.id), current_user=user)
    assert res["status"] == "completed"
    assert res["xp_earned"] == 500

    # 4. Verify User state
    updated_user = await User.get(user.id)
    assert updated_user.xp == 500
    assert str(walk.id) in updated_user.walks_history

    # 5. Idempotency Check: Re-finishing a NEW session for the same walk should award 0 XP
    session2 = await WalkSession(
        user_id=str(user.id), walk_id=walk, accepted_stops=[str(monument1.id)]
    ).create()

    res2 = await finish_walk(str(session2.id), current_user=updated_user)
    assert res2["status"] == "completed"
    assert res2["xp_earned"] == 0
    assert "anti-grind" in res2["message"]
