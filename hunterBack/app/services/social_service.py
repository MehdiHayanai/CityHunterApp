from uuid import UUID

from app.models.social import ActivityFeedItem, Friendship
from app.models.user_domain import UserProfile


class SocialService:
    async def follow_user(self, follower_id: UUID, followed_id: UUID) -> Friendship:
        # Check if already following
        existing = await Friendship.find_one(
            Friendship.follower_id == follower_id, Friendship.followed_id == followed_id
        )
        if existing:
            return existing

        friendship = Friendship(follower_id=follower_id, followed_id=followed_id)
        await friendship.create()

        # Create notification/feed item? (Optional for now)
        return friendship

    async def unfollow_user(self, follower_id: UUID, followed_id: UUID) -> bool:
        friendship = await Friendship.find_one(
            Friendship.follower_id == follower_id, Friendship.followed_id == followed_id
        )
        if friendship:
            await friendship.delete()
            return True
        return False

    async def get_activity_feed(
        self, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[ActivityFeedItem]:
        # Get list of users I follow
        friendships = await Friendship.find(Friendship.follower_id == user_id).to_list()
        followed_ids = [f.followed_id for f in friendships]

        # Include self in feed? Maybe. For now, just friends.
        # followed_ids.append(user_id)

        if not followed_ids:
            return []

        # Query feed items where user_id is in followed_ids
        feed = (
            await ActivityFeedItem.find(ActivityFeedItem.user_id.__in == followed_ids)
            .sort(-ActivityFeedItem.created_at)
            .skip(offset)
            .limit(limit)
            .to_list()
        )

        return feed

    async def get_friends(self, user_id: UUID) -> list[UserProfile]:
        friendships = await Friendship.find(Friendship.follower_id == user_id).to_list()
        followed_ids = [f.followed_id for f in friendships]

        users = await UserProfile.find(
            UserProfile.user_id.__in == followed_ids
        ).to_list()
        return users


social_service = SocialService()
