from typing import AsyncGenerator

import pytest
import pytest_asyncio
from dotenv import load_dotenv
from httpx import ASGITransport, AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.db.mongodb import init_db
from app.main import app


def pytest_addoption(parser):
    parser.addoption(
        "--email-send",
        action="store_true",
        default=False,
        help="run tests that send real emails",
    )


def pytest_configure(config):
    config.addinivalue_line("markers", "real_email: mark test as sending real email")
    if config.getoption("--email-send"):
        load_dotenv()


def pytest_collection_modifyitems(config, items):
    if config.getoption("--email-send"):
        # --email-send given in cli: do not skip real email tests
        return
    skip_real_email = pytest.mark.skip(reason="need --email-send option to run")
    for item in items:
        if "real_email" in item.keywords:
            item.add_marker(skip_real_email)


# Override settings for testing
@pytest.fixture(scope="session", autouse=True)
def settings_override():
    original_db_name = settings.DB_NAME
    # Use a test database
    settings.DB_NAME = f"{original_db_name}_test"
    settings.API_KEY = "test-api-key"
    yield
    # Restore original setting (though session scope ends anyway)
    settings.DB_NAME = original_db_name


@pytest_asyncio.fixture(scope="function", autouse=True)
async def db_client() -> AsyncGenerator[AsyncIOMotorClient, None]:
    # Initialize Beanie and get client
    client = await init_db()

    yield client

    # Clean up the test database after the function
    await client.drop_database(settings.DB_NAME)
    # Closing client ensures we don't leak connections across tests in function scope
    client.close()


@pytest_asyncio.fixture(scope="function")
async def clear_db(db_client):
    # Logic moved to db_client fixture teardown for cleaner isolation
    yield


@pytest_asyncio.fixture(scope="function")
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        headers={"X-API-Key": "test-api-key"},
    ) as ac:
        yield ac


@pytest.fixture
def test_user_data():
    return {
        "handle": "Testhunter",
        "email": "test@example.com",
        "password": "testpassword123",
    }


@pytest_asyncio.fixture(scope="function")
async def test_user(client: AsyncClient, test_user_data: dict, clear_db):
    response = await client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == 200
    return response.json()


@pytest_asyncio.fixture(scope="function")
async def auth_headers(client: AsyncClient, test_user_data: dict, test_user):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": test_user_data["email"], "password": test_user_data["password"]},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
