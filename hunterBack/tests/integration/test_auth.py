import pytest
from httpx import AsyncClient

from app.core import email
from app.models.user_domain import UserIdentity
from app.models.verification import VerificationToken


@pytest.fixture
def mock_email_service(monkeypatch):
    async def mock_send(email_to, verification_code):
        return {"id": "mock_id"}

    monkeypatch.setattr(email, "send_verification_email", mock_send)
    return mock_send


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, clear_db, mock_email_service):
    user_data = {
        "handle": "NewHunter",
        "email": "new@example.com",
        "password": "newpassword",
    }
    response = await client.post(
        "/api/v1/auth/register",
        json=user_data,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "new@example.com"
    assert "id" in data

    # Check that user is NOT verified initially
    identity = await UserIdentity.find_one(UserIdentity.email == "new@example.com")
    assert identity is not None
    assert identity.is_verified is False

    # Check that a verification token was created
    token_doc = await VerificationToken.find_one(
        VerificationToken.email == "new@example.com"
    )
    assert token_doc is not None
    assert len(token_doc.token) == 6


@pytest.mark.asyncio
async def test_login_user(client: AsyncClient, test_user_data):
    # Register first
    await client.post("/api/v1/auth/register", json=test_user_data)

    # Login
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": test_user_data["email"], "password": test_user_data["password"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
