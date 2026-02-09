from typing import Optional
from uuid import UUID

from beanie.operators import Inc

from app.models.user_domain import ActivityLog, UserIdentity, UserProfile


class UserRepository:
    async def get_profile(self, user_id: UUID) -> Optional[UserProfile]:
        return await UserProfile.find_one(UserProfile.user_id == user_id)

    async def get_identity_by_email(self, email: str) -> Optional[UserIdentity]:
        return await UserIdentity.find_one(UserIdentity.email == email)

    async def get_identity_by_id(self, user_id: UUID) -> Optional[UserIdentity]:
        return await UserIdentity.find_one(UserIdentity.id == user_id)

    async def create_user(self, identity: UserIdentity, profile: UserProfile):
        # In a real app, consider using a transaction here
        await identity.insert()
        await profile.insert()

    async def add_xp(self, user_id: UUID, amount: int):
        """Atomic update to prevent race conditions"""
        await UserProfile.find_one(UserProfile.user_id == user_id).update(
            Inc({UserProfile.xp: amount})
        )

    async def log_activity(self, entry: ActivityLog):
        await entry.insert()
