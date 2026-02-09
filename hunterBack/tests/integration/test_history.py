import pytest
import pytest_asyncio
from httpx import AsyncClient

from app.models.content import GeoPoint, Monument, Walk, WalkMetrics
from app.models.quiz import Quiz


@pytest_asyncio.fixture
async def history_data(db_client):
    # Monuments for walk
    m1 = Monument(
        name="M1", description="D1", location=GeoPoint(coordinates=[0, 0]), category="C"
    )
    await m1.insert()

    # Walk
    w1 = Walk(
        name="History Walk",
        description="Test Walk",
        difficulty="Easy",
        stops=[str(m1.id)],
        metrics=WalkMetrics(),
        estimated_time="1h",
        distance="1km",
    )
    await w1.insert()

    # Quiz
    q1 = Quiz(
        monument_id=str(m1.id),
        question="Q?",
        options=["A", "B"],
        correct_answer=0,
        xp_reward=100,
    )
    await q1.insert()

    return {"w1": w1, "q1": q1}


@pytest.mark.asyncio
async def test_walk_history_deduplication(
    client: AsyncClient, history_data, auth_headers, test_user
):
    w1 = history_data["w1"]
    user_id = test_user["id"]
    from unittest.mock import patch
    from uuid import UUID

    from app.handlers.gamification import handle_walk_xp
    from app.repositories.user_repo import UserRepository

    repo = UserRepository()

    # 1. Verify Endpoint Dispatches Event
    with patch("fastapi_events.dispatcher.dispatch") as mock_dispatch:
        resp = await client.post(
            f"/api/v1/gamification/walk/finish?walk_id={w1.id}", headers=auth_headers
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "processing_rewards"

        # Verify dispatch called
        assert mock_dispatch.called
        call_args = mock_dispatch.call_args
        assert call_args[0][0] == "WALK_FINISHED"
        payload = call_args[1]["payload"]
        assert payload["walk_id"] == str(w1.id)
        assert payload["user_id"] == UUID(user_id)

    # 2. Verify Handler Logic (Manual Execution)
    # Simulate first event
    event_payload = {
        "user_id": UUID(user_id),
        "walk_id": str(w1.id),
        "duration_seconds": 0,
        "timestamp_iso": "2025-01-01T00:00:00",
    }
    # Handler expects tuple-like event or just payload depending on usage.
    # Library passes (event_name, payload).
    await handle_walk_xp(("WALK_FINISHED", event_payload))

    # Verify DB - XP should be 500
    profile = await repo.get_profile(UUID(user_id))
    assert profile.xp == 500

    # Simulate second event (Duplicate)
    await handle_walk_xp(("WALK_FINISHED", event_payload))

    # Verify XP didn't increase
    profile = await repo.get_profile(UUID(user_id))
    assert profile.xp == 500


@pytest.mark.asyncio
async def test_quiz_history_deduplication(
    client: AsyncClient, history_data, auth_headers
):
    q1 = history_data["q1"]

    payload = [{"quiz_id": str(q1.id), "answer_index": 0}]  # Correct answer

    # First time
    resp = await client.post(
        "/api/v1/quizzes/validate", json=payload, headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_xp"] == 100

    # Second time
    resp = await client.post(
        "/api/v1/quizzes/validate", json=payload, headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_xp"] == 0
