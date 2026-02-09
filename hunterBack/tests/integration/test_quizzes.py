import pytest
import pytest_asyncio
from httpx import AsyncClient

from app.models.content import GeoPoint, Monument
from app.models.quiz import Quiz


@pytest_asyncio.fixture
async def quiz_data(db_client):
    # Create Monument
    m1 = Monument(
        name="Quiz Monument",
        description="Test",
        location=GeoPoint(coordinates=[0, 0]),
        category="Landmark",
    )
    await m1.insert()

    # Create Quizzes
    q1 = Quiz(
        monument_id=str(m1.id),
        question="Q1",
        options=["A", "B", "C"],
        correct_answer=0,  # A
        xp_reward=100,
        difficulty="EASY",
    )
    await q1.insert()

    q2 = Quiz(
        monument_id=str(m1.id),
        question="Q2",
        options=["X", "Y", "Z"],
        correct_answer=2,  # Z
        xp_reward=200,
        difficulty="HARD",
    )
    await q2.insert()

    return {"m1": m1, "q1": q1, "q2": q2}


@pytest.mark.asyncio
async def test_get_quizzes(client: AsyncClient, quiz_data):
    m1 = quiz_data["m1"]

    response = await client.get(f"/api/v1/quizzes/monument/{m1.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # Ensure correct_answer is NOT exposed
    assert "correct_answer" not in data[0]


@pytest.mark.asyncio
async def test_validate_quiz_correct(client: AsyncClient, quiz_data, auth_headers):
    # We need an authenticated user for this
    q1 = quiz_data["q1"]

    payload = [
        {"quiz_id": str(q1.id), "answer_index": 0}  # Correct
    ]

    response = await client.post(
        "/api/v1/quizzes/validate", json=payload, headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_xp"] == 100
    assert data["results"][0]["correct"]

    # Check if user XP updated
    # Depends on test user initial state (fixture sets 0 usually)
    # But let's check profile via API
    profile_resp = await client.get("/api/v1/users/profile/me", headers=auth_headers)
    assert profile_resp.json()["xp"] >= 100


@pytest.mark.asyncio
async def test_validate_quiz_incorrect(client: AsyncClient, quiz_data, auth_headers):
    q2 = quiz_data["q2"]

    payload = [
        {"quiz_id": str(q2.id), "answer_index": 0}  # Incorrect (Correct is 2)
    ]

    response = await client.post(
        "/api/v1/quizzes/validate", json=payload, headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_xp"] == 0
    assert not data["results"][0]["correct"]
