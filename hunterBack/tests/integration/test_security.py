import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_api_key_valid(client: AsyncClient):
    """
    Test that a request with a valid API Key returns 200.
    The client fixture already provides the valid key.
    """
    # Using a public endpoint to test access
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to CityHunter API"}


@pytest.mark.asyncio
async def test_api_key_missing():
    """
    Test that a request without an API Key returns 403.
    We create a fresh client to ensure no default headers are set.
    """
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/")
        assert response.status_code == 403
        assert response.json() == {"detail": "Not authenticated"}


@pytest.mark.asyncio
async def test_api_key_invalid():
    """
    Test that a request with an invalid API Key returns 403.
    """
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        headers={"X-API-Key": "invalid-key"},
    ) as ac:
        response = await ac.get("/")
        assert response.status_code == 403
        assert response.json() == {"detail": "Could not validate credentials"}
