import os

import pytest
from httpx import AsyncClient

# Mock the email sending function to avoid actual API calls
from app.core import email
from app.core.config import settings
from app.models.user_domain import UserIdentity
from app.models.verification import VerificationToken


@pytest.fixture
def mock_email_service(monkeypatch):
    async def mock_send(email_to, verification_code):
        print(f"MOCK EMAIL SENT TO {email_to} WITH CODE {verification_code}")
        return {"id": "mock_id"}

    monkeypatch.setattr(email, "send_verification_email", mock_send)
    return mock_send


@pytest.mark.asyncio
async def test_verification_flow(client: AsyncClient, mock_email_service):
    # 1. Register a new user
    user_data = {
        "handle": "VerifyTest",
        "email": "verify@test.com",
        "password": "password123",
    }
    response = await client.post(f"{settings.API_V1_STR}/auth/register", json=user_data)
    assert response.status_code == 200

    # Check that user is NOT verified initially
    identity = await UserIdentity.find_one(UserIdentity.email == "verify@test.com")
    assert identity is not None
    assert identity.is_verified is False

    # Check that a verification token was created
    token_doc = await VerificationToken.find_one(
        VerificationToken.email == "verify@test.com"
    )
    assert token_doc is not None
    code = token_doc.token
    assert len(code) == 6

    # 2. Verify with incorrect code
    response = await client.post(
        f"{settings.API_V1_STR}/auth/verify-email", json={"token": "000000"}
    )
    assert response.status_code == 400

    # 3. Verify with correct code
    response = await client.post(
        f"{settings.API_V1_STR}/auth/verify-email", json={"token": code}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Email verified successfully"

    # Check that user IS verified now
    identity = await UserIdentity.find_one(UserIdentity.email == "verify@test.com")
    assert identity.is_verified is True

    # Check that token is deleted
    token_doc = await VerificationToken.find_one(
        VerificationToken.email == "verify@test.com"
    )
    assert token_doc is None


@pytest.mark.asyncio
async def test_request_verification(client: AsyncClient, mock_email_service):
    # Create unverified user
    user_data = {
        "handle": "RequestTest",
        "email": "request@test.com",
        "password": "password123",
    }
    await client.post(f"{settings.API_V1_STR}/auth/register", json=user_data)

    # Request new verification
    response = await client.post(
        f"{settings.API_V1_STR}/auth/request-verification",
        json={"email": "request@test.com"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Verification email sent"

    # Check token exists
    token_doc = await VerificationToken.find_one(
        VerificationToken.email == "request@test.com"
    )
    assert token_doc is not None


@pytest.mark.asyncio
@pytest.mark.real_email
async def test_send_real_verification_email(client: AsyncClient):
    real_email = os.getenv("SECRET_EMAIL_TEST")
    print(f"Testing real email sending to: {real_email}")

    user_data = {
        "handle": "RealEmailTest",
        "email": real_email,
        "password": "password123",
    }

    # Register triggers email
    response = await client.post(f"{settings.API_V1_STR}/auth/register", json=user_data)

    if response.status_code == 400 and "Email already registered" in response.text:
        # Clean up if user already exists from previous run (optional, or just accept it)
        # For now, let's just allow it to fail or skip.
        # Better: Cleanup first in this test or assume clean DB due to `clear_db` fixture if used.
        # The `client` fixture uses a test DB, so it should be clean.
        pass

    assert response.status_code == 200

    # Check token was created (implies email logic ran)
    token_doc = await VerificationToken.find_one(VerificationToken.email == real_email)
    assert token_doc is not None
    assert len(token_doc.token) == 6
