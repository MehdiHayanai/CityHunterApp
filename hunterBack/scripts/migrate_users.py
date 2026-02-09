import asyncio
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.mongodb import init_db
from app.models.user import User
from app.models.user_domain import UserIdentity, UserProfile
from app.repositories.user_repo import UserRepository


async def migrate_users():
    print("🚀 Starting User Migration...")
    await init_db()

    repo = UserRepository()
    count = 0
    errors = 0

    async for old_user in User.find_all():
        try:
            print(f"Processing user: {old_user.email} ({old_user.id})")

            # Check if already migrated (idempotency)
            if await repo.get_identity_by_email(old_user.email):
                print(" - Already migrated. Skipping.")
                continue

            # Create Identity
            identity = UserIdentity(
                id=old_user.id,  # Preserve ID
                email=old_user.email,
                hashed_password=old_user.hashed_password,
                is_active=True,
            )

            # Create Profile
            profile = UserProfile(
                user_id=old_user.id,
                handle=old_user.handle,
                level=old_user.level,
                xp=old_user.xp,
                avatar_url=None,  # Old model didn't have this explicitly
            )

            # Save using Repo (or direct insert)
            await repo.create_user(identity, profile)
            count += 1
            print(" - ✅ Migrated successfully.")

        except Exception as e:
            print(f" - ❌ Error migrating {old_user.email}: {e}")
            errors += 1

    print("\nMigration Complete.")
    print(f"Success: {count}")
    print(f"Errors: {errors}")


if __name__ == "__main__":
    asyncio.run(migrate_users())
