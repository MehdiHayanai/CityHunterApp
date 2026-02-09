import pytest
from httpx import AsyncClient

from app.models.domain.geo import GeoObject
from app.models.domain.poi import Monument
from app.models.quiz import Quiz, QuizDifficulty


@pytest.mark.asyncio
async def test_quiz_flow(client: AsyncClient, auth_headers: dict, test_user: dict):
    # 1. Setup: Create Monument and Quiz
    paris_loc = [2.2945, 48.8584]
    monument = Monument(
        name="Test Monument",
        description="Testing",
        location=GeoObject(coordinates=paris_loc),
    )
    await monument.insert()

    quiz = Quiz(
        monument_id=str(monument.id),
        question="What is this?",
        options=["A", "B", "C", "D"],
        correct_answer=1,  # "B"
        xp_reward=100,
        difficulty=QuizDifficulty.EASY,
    )
    await quiz.insert()

    # 2. Get Next Quiz
    resp = await client.get(
        f"/api/v1/quizzes/monument/{monument.id}/next", headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == str(quiz.id)
    assert "correct_answer" not in data
    assert data["question"] == "What is this?"

    # 3. Submit Wrong Answer
    resp = await client.post(
        f"/api/v1/quizzes/{quiz.id}/answer",
        json={"answer_index": 0},  # Wrong (A)
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is False
    assert data["xp_earned"] == 0
    assert data["correct_answer"] == 1

    # 4. Submit Correct Answer
    resp = await client.post(
        f"/api/v1/quizzes/{quiz.id}/answer",
        json={"answer_index": 1},  # Correct (B)
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["xp_earned"] == 100

    # Verify User XP (optional, but good)
    # Fetch user profile? Or assume the endpoint response is truthful (it returns new_total_xp)
    # The user started with 0 xp (from clear_db context ideally, but let's check response)
    # Note: test_user fixture creates a fresh user.
    assert data["new_total_xp"] >= 100

    # 5. Re-Submit Correct Answer (Should yield 0 XP)
    resp = await client.post(
        f"/api/v1/quizzes/{quiz.id}/answer",
        json={"answer_index": 1},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["xp_earned"] == 0  # Key check
    assert (
        data["new_total_xp"] >= 100
    )  # Total should remain same (or at least not increase by 100)

    # 6. Get Next Quiz (Should be None as we answered the only one)
    resp = await client.get(
        f"/api/v1/quizzes/monument/{monument.id}/next", headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json() is None
