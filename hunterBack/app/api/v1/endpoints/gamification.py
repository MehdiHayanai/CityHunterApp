from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.api import deps
from app.models.quest import QuestState, QuestStateBase
from app.models.user import User
from app.models.user_domain import UserProfile

router = APIRouter()


@router.get("/levels")
async def get_levels() -> Any:
    """
    Get all available levels in the system, sorted by level order.
    """
    from app.models.level import Level as DbLevel

    # Fetch levels using the registered Beanie model
    db_levels = await DbLevel.find_all().sort("+level_number").to_list()

    # Map to frontend expected format
    return [
        {
            "level": lvl.level_number,
            "xp": lvl.xp_threshold,
            "title": lvl.title,
            "reward": lvl.rewards[0].name if lvl.rewards else "None",
        }
        for lvl in db_levels
    ]


@router.post("/quest/sync")
async def sync_quest_state(
    state: QuestStateBase,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    # Update user's current quest state
    # We ignore the user_id in the body if any, and use current_user.id

    existing_state = await QuestState.find_one(
        QuestState.user_id == str(current_user.id)
    )

    if existing_state:
        await existing_state.set(state.model_dump())
    else:
        new_state = QuestState(user_id=str(current_user.id), **state.model_dump())
        await new_state.create()

    return {"status": "synced"}


@router.post("/walk/finish")
async def finish_walk(
    session_id: str,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Mark a walk as completed.
    Verifies all stops are accepted and awards XP only if first time.
    """
    from datetime import datetime, timezone
    from app.models.domain.session import WalkSession

    session = await WalkSession.get(session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    walk = await session.walk_id.fetch()
    if not walk:
        raise HTTPException(404, "Walk not found")

    # 1. Validation Logic: Check if all stops are accepted
    # Assuming walk.stops contains IDs as strings
    all_stops = walk.stops
    accepted = session.accepted_stops

    if not all(stop_id in accepted for stop_id in all_stops):
        return {
            "status": "partial_completion",
            "message": f"Only {len(accepted)}/{len(all_stops)} monuments accepted.",
            "remaining": [s for s in all_stops if s not in accepted],
        }

    # 2. XP Idempotency: Anti-Grind Mechanism
    xp_reward = 500  # Default XP for walk
    if str(walk.id) in current_user.walks_history:
        xp_reward = 0
        message = "Walk already completed. 0 XP awarded (anti-grind)."
    else:
        current_user.walks_history.append(str(walk.id))
        current_user.xp += xp_reward
        message = f"First-time completion! {xp_reward} XP awarded."

        # Check for level up
        from app.services.gamification_service import GamificationService

        new_level_info = await GamificationService.get_level_info(current_user.xp)
        if new_level_info.level > current_user.level:
            current_user.level = new_level_info.level
            message += f" Level Up! reached level {current_user.level}."

    # 3. Finalize Session
    session.end_time = datetime.now(timezone.utc)
    session.is_completed = True

    await session.save()
    await current_user.save()

    return {
        "status": "completed",
        "message": message,
        "xp_earned": xp_reward,
        "new_xp": current_user.xp,
        "new_level": current_user.level,
    }


@router.post("/visit")
async def register_visit(
    poi_id: str,
    current_user: UserProfile = Depends(deps.get_current_user),
) -> Any:
    """
    Register a visit to a POI, calculate XP with decay, update user state.
    """
    import logging

    from app.models.gamification import Activity
    from app.services.gamification_service import GamificationService

    logger = logging.getLogger(__name__)

    # 1. Get or Create QuestState
    q_state = await QuestState.find_one(QuestState.user_id == current_user.user_id)
    if not q_state:
        q_state = QuestState(user_id=current_user.user_id)

    # 2. Check previous visits in activity_log
    # Count how many times this target_id appears in activities of type 'visit'
    previous_visits = [
        a for a in q_state.activity_log if a.type == "visit" and a.target_id == poi_id
    ]
    visit_count = len(previous_visits) + 1  # This is the nth visit

    # 3. Calculate XP
    xp_to_award = GamificationService.calculate_xp_for_visit(visit_count)

    # 4. Create Activity Record
    new_activity = Activity(
        type="visit", target_id=poi_id, xp_awarded=xp_to_award, count=visit_count
    )

    # 5. Update State
    q_state.activity_log.append(new_activity)
    q_state.accumulated_xp += xp_to_award

    # Check for level up
    old_level = await GamificationService.get_level_info(
        q_state.accumulated_xp - xp_to_award
    )
    new_level = await GamificationService.get_level_info(q_state.accumulated_xp)
    leveled_up = new_level.level > old_level.level

    await q_state.save()

    logger.info(
        f"User {current_user.user_id} visited {poi_id}. XP: {xp_to_award}. Total: {q_state.accumulated_xp}"
    )

    return {
        "success": True,
        "xp_awarded": xp_to_award,
        "total_xp": q_state.accumulated_xp,
        "visit_count": visit_count,
        "level_info": new_level,
        "leveled_up": leveled_up,
    }
