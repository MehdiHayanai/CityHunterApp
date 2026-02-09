from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.core import security
from app.core.config import settings
from app.models.user_domain import UserProfile

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/access-token"
)

API_KEY_HEADER = "X-API-Key"
x_api_key = APIKeyHeader(name=API_KEY_HEADER, auto_error=False)


async def get_api_key(
    api_key: str = Depends(x_api_key),
):
    if api_key == settings.API_KEY:
        return api_key
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Could not validate credentials",
    )


class TokenData(BaseModel):
    user_id: Optional[str] = None


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserProfile:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception

    try:
        user_uuid = UUID(token_data.user_id)
    except (ValueError, TypeError):
        raise credentials_exception

    from app.repositories.user_repo import UserRepository

    repo = UserRepository()

    # We return UserProfile here as it contains the game state
    # If endpoints need Identity (auth info), they should request it separately or we can attach it
    user = await repo.get_profile(user_uuid)
    if user is None:
        raise credentials_exception

    return user
