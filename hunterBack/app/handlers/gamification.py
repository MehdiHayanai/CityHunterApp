from fastapi_events.handlers.local import local_handler
from fastapi_events.typing import Event

from app.core.events import WalkFinishedEvent
from app.models.user_domain import ActivityLog
from app.repositories.user_repo import UserRepository


@local_handler.register(event_name="WALK_FINISHED")
async def handle_walk_xp(event: Event):
    event_data = WalkFinishedEvent(**event[1])
    repo = UserRepository()

    # Check if activity already exists
    existing_log = await ActivityLog.find_one(
        ActivityLog.user_id == event_data.user_id,
        ActivityLog.action == "WALK_COMPLETED",
        ActivityLog.target_id == event_data.walk_id,
    )
    if existing_log:
        print(
            f"⚠️ Walk {event_data.walk_id} already completed by {event_data.user_id}. Skipping XP."
        )
        return

    # 1. Calculate XP (Simple version for Phase 2)
    xp_reward = 500

    # 2. Update User Profile Atomically
    await repo.add_xp(event_data.user_id, xp_reward)

    # 3. Log the activity
    await repo.log_activity(
        ActivityLog(
            user_id=event_data.user_id,
            action="WALK_COMPLETED",
            target_id=event_data.walk_id,
            metadata={"xp": xp_reward},
        )
    )
    print(f"✅ Awarded {xp_reward} XP to {event_data.user_id}")
