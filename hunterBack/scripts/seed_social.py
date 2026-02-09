import asyncio
import random
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.db.mongodb import init_db
from app.core.security import get_password_hash
from app.models.social import ActivityFeedItem, Friendship
from app.models.user_domain import UserIdentity, UserProfile


async def seed_social():
    print("Connecting to database...")
    await init_db()

    print("Clearing social data...")
    await Friendship.delete_all()
    await ActivityFeedItem.delete_all()

    usernames = ["AliceHunter", "BobExplorer", "CharlieWalker", "DaveDash", "EveSaint"]
    users = []

    print("Ensuring users exist...")
    for name in usernames:
        email = f"{name.lower()}@example.com"

        # Check Identity
        identity = await UserIdentity.find_one(UserIdentity.email == email)

        if not identity:
            hashed = get_password_hash("password123")
            identity = UserIdentity(
                id=uuid4(),
                email=email,
                hashed_password=hashed,
                is_active=True,
                is_verified=True,
            )
            await identity.create()

            # Create Profile linked to Identity
            profile = UserProfile(
                user_id=identity.id,
                handle=name,
                level=random.randint(1, 10),
                xp=random.randint(100, 5000),
                avatar_url=None,
            )
            await profile.create()
            print(f"   - Created User: {name}")
            users.append(profile)  # We track profiles now
        else:
            print(f"   - Found User: {name}")
            profile = await UserProfile.find_one(UserProfile.user_id == identity.id)
            if not profile:
                profile = UserProfile(
                    user_id=identity.id,
                    handle=name,
                    level=random.randint(1, 10),
                    xp=random.randint(100, 5000),
                    avatar_url=None,
                )
                await profile.create()
            users.append(profile)

    if len(users) < 5:
        print("Error: Not enough users found or created.")
        return

    alice, bob, charlie, dave, eve = users

    print("Creating Friendships...")
    # Friendships map User IDs (which are Identity IDs = Profile User IDs)
    # Alice follows Bob and Charlie
    await Friendship(follower_id=alice.user_id, followed_id=bob.user_id).create()
    await Friendship(follower_id=alice.user_id, followed_id=charlie.user_id).create()

    # Bob follows Alice and Eve
    await Friendship(follower_id=bob.user_id, followed_id=alice.user_id).create()
    await Friendship(follower_id=bob.user_id, followed_id=eve.user_id).create()

    # Charlie follows Alice
    await Friendship(follower_id=charlie.user_id, followed_id=alice.user_id).create()

    print("   - Friendships established.")

    print("Creating Activity Feed...")
    activities = [
        (
            bob,
            "walk_completed",
            "Parisian Classics",
            {"walk_name": "Parisian Classics", "score": 95},
        ),
        (
            charlie,
            "badge_earned",
            "Rookie",
            {"badge_name": "Rookie", "icon": "fa-medal"},
        ),
        (
            eve,
            "walk_completed",
            "Spiritual Heights",
            {"walk_name": "Spiritual Heights", "score": 100},
        ),
        (bob, "level_up", "5", {"level": 5}),
    ]

    for user_profile, type_, target, meta in activities:
        item = ActivityFeedItem(
            user_id=user_profile.user_id,
            type=type_,
            target_id=target,
            metadata=meta,
            created_at=datetime.now(timezone.utc)
            - timedelta(hours=random.randint(1, 48)),
        )
        await item.create()
        print(f"   - Activity: {user_profile.handle} {type_}")

    print("Social Seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed_social())
