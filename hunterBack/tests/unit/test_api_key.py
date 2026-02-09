import pytest
from fastapi import HTTPException

from app.api.deps import get_api_key
from app.core.config import settings


@pytest.mark.asyncio
async def test_get_api_key_valid():
    """
    Test that get_api_key returns the key when valid.
    """
    # Setup
    valid_key = "test-secret-key"
    settings.API_KEY = valid_key

    # Execution
    result = await get_api_key(api_key=valid_key)

    # Verification
    assert result == valid_key


@pytest.mark.asyncio
async def test_get_api_key_invalid():
    """
    Test that get_api_key raises HTTPException when invalid.
    """
    # Setup
    settings.API_KEY = "test-secret-key"
    invalid_key = "wrong-key"

    # Execution & Verification
    with pytest.raises(HTTPException) as exc_info:
        await get_api_key(api_key=invalid_key)

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Could not validate credentials"


@pytest.mark.asyncio
async def test_get_api_key_check_settings():
    """
    Ensure we are checking against settings.API_KEY
    """
    settings.API_KEY = "another-key"
    result = await get_api_key(api_key="another-key")
    assert result == "another-key"


@pytest.mark.asyncio
async def test_get_api_key_missing():
    """
    Test that get_api_key raises HTTPException when the header is missing (api_key is None).
    """
    # Setup
    settings.API_KEY = "test-secret-key"

    # Execution & Verification
    with pytest.raises(HTTPException) as exc_info:
        await get_api_key(api_key=None)

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Could not validate credentials"
