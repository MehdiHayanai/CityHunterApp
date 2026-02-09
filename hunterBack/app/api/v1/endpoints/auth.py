from datetime import timedelta
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.core import security
from app.core.config import settings
from app.core.email import send_verification_email
from app.models.user import UserCreate, UserLogin, UserResponse
from app.models.user_domain import UserIdentity, UserProfile
from app.models.verification import VerificationToken
from app.repositories.user_repo import UserRepository

router = APIRouter()


async def generate_verification_token(email: str) -> str:
    # Generate 6-digit code
    import random

    code = "".join([str(random.randint(0, 9)) for _ in range(6)])

    token = VerificationToken(email=email, token=code)
    await token.insert()
    return code


@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, background_tasks: BackgroundTasks) -> Any:
    repo = UserRepository()

    # Check if user exists
    existing_user = await repo.get_identity_by_email(user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = security.get_password_hash(user_in.password)

    # Create Identity
    identity = UserIdentity(email=user_in.email, hashed_password=hashed_password)

    # Create Profile
    profile = UserProfile(user_id=identity.id, handle=user_in.handle)

    await repo.create_user(identity, profile)

    # Trigger Verification
    code = await generate_verification_token(user_in.email)
    background_tasks.add_task(send_verification_email, user_in.email, code)

    # Construct response manually or verify UserResponse compatibility
    from datetime import datetime, timezone

    return UserResponse(
        id=identity.id,
        handle=profile.handle,
        role=profile.role,
        email=identity.email,
        level=profile.level,
        xp=profile.xp,
        stats={"distance": "0km", "cities": 0, "secrets": 0},  # Defaul for now
        collection=[],
        joined_date=datetime.now(timezone.utc),
    )


@router.post("/verify-email")
async def verify_email(token: str = Body(..., embed=True)) -> Any:
    """
    Verify email with the 6-digit code.
    """
    verification = await VerificationToken.find_one(VerificationToken.token == token)
    if not verification:
        raise HTTPException(
            status_code=400, detail="Invalid or expired verification code"
        )

    repo = UserRepository()
    identity = await repo.get_identity_by_email(verification.email)
    if not identity:
        raise HTTPException(status_code=404, detail="User not found")

    if identity.is_verified:
        # User is already verified, so just clean up token and return success/message
        await verification.delete()
        return {"message": "Email already verified"}

    identity.is_verified = True
    await identity.save()

    # Delete used token
    await verification.delete()

    return {"message": "Email verified successfully"}


@router.post("/request-verification")
async def request_verification(
    email: str = Body(..., embed=True), background_tasks: BackgroundTasks = None
) -> Any:
    """
    Request a new verification email.
    """
    repo = UserRepository()
    identity = await repo.get_identity_by_email(email)
    if not identity:
        raise HTTPException(status_code=404, detail="User not found")

    if identity.is_verified:
        return {"message": "Email already verified"}

    # Generate new token
    code = await generate_verification_token(email)

    # Send email (using background task if available, else await)
    if background_tasks:
        background_tasks.add_task(send_verification_email, email, code)
    else:
        send_verification_email(email, code)

    return {"message": "Verification email sent"}


@router.post("/login")
async def login(login_data: UserLogin) -> Any:
    repo = UserRepository()
    user = await repo.get_identity_by_email(login_data.email)

    if not user or not security.verify_password(
        login_data.password, user.hashed_password
    ):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = security.create_access_token(
        str(user.id), expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.id),
        # Ideally we return is_verified here too if frontend needs it
        "is_verified": user.is_verified,
    }


@router.post("/access-token")
async def login_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    repo = UserRepository()
    user = await repo.get_identity_by_email(form_data.username)
    if not user or not security.verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        str(user.id), expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }
