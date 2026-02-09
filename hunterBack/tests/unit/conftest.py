import pytest


@pytest.fixture(scope="function", autouse=True)
def db_client():
    """Override db_client to do nothing for unit tests."""
    yield


@pytest.fixture(scope="session", autouse=True)
def settings_override():
    """Override settings_override to do nothing or minimal setup."""
    yield
