import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_read_users_me(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/users/profile/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "stats" in data
    assert "collection" in data


@pytest.mark.asyncio
async def test_read_users_me_unauthorized(client: AsyncClient):
    response = await client.get("/api/v1/users/profile/me")
    assert response.status_code == 401
