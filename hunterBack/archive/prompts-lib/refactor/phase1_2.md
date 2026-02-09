CityHunter Vibe: Implementation Roadmap (Phases 1 & 2)

Version: 1.0
Focus: Foundations, Decoupling, and Event Architecture

📅 Phase 1: Foundation & Data Layer Decoupling

Objective: Remove the "God Object" dependency and abstract database interactions to improve testability and maintainability.

1.1 Step 1: Schema Normalization (Splitting the User)

We need to separate authentication credentials from gameplay profile data.

Action Items:

Create New Models in app/models/user_domain.py:

UserIdentity: Stores secure auth data.

UserProfile: Stores public game stats.

ActivityLog: Stores historical events (replacing large lists).

Code Specification:

# app/models/user_domain.py
from beanie import Document
from pydantic import Field
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime

class UserIdentity(Document):
    id: UUID = Field(default_factory=uuid4)
    email: str
    hashed_password: str
    is_active: bool = True
    
    class Settings:
        name = "user_identities"

class UserProfile(Document):
    user_id: UUID  # Links to UserIdentity.id
    handle: str
    level: int = 1
    xp: int = 0
    avatar_url: Optional[str] = None

    class Settings:
        name = "user_profiles"

class ActivityLog(Document):
    user_id: UUID
    action: str  # e.g., "WALK_COMPLETED", "QUIZ_ANSWERED"
    target_id: str # ID of the walk or monument
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: dict = {} # Stores XP earned, time taken, etc.

    class Settings:
        name = "activity_logs"


1.2 Step 2: The Repository Pattern

Abstract all Beanie/MongoDB calls into dedicated classes.

Action Items:

Create app/repositories/base.py (Abstract Base Class).

Create app/repositories/user_repo.py.

Code Specification:

# app/repositories/user_repo.py
from app.models.user_domain import UserProfile, UserIdentity, ActivityLog
from typing import Optional
from uuid import UUID
from beanie.operators import Inc

class UserRepository:
    async def get_profile(self, user_id: UUID) -> Optional[UserProfile]:
        return await UserProfile.find_one(UserProfile.user_id == user_id)

    async def get_identity_by_email(self, email: str) -> Optional[UserIdentity]:
        return await UserIdentity.find_one(UserIdentity.email == email)

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


📅 Phase 2: Event-Driven Architecture (Observer Pattern)

Objective: Decouple the "Action" (finishing a walk) from the "Reaction" (awarding XP, Social Feed, Badges).

2.1 Step 1: Event Bus Setup

We will use fastapi-events to handle internal dispatching.

Action Items:

Install dependency: pip install fastapi-events

Configure middleware in main.py.

Code Specification:

# app/core/events.py
from pydantic import BaseModel
from uuid import UUID

class BaseEvent(BaseModel):
    pass

class WalkFinishedEvent(BaseEvent):
    user_id: UUID
    walk_id: str
    duration_seconds: int
    timestamp_iso: str


2.2 Step 2: Event Handlers (Subscribers)

Create isolated functions that react to events.

Action Items:

Create app/handlers/gamification.py.

Create app/handlers/social.py.

Code Specification:

# app/handlers/gamification.py
from fastapi_events.typing import Event
from fastapi_events.handlers.local import local_handler
from app.repositories.user_repo import UserRepository
from app.core.events import WalkFinishedEvent

@local_handler.register(event_name="WALK_FINISHED")
async def handle_walk_xp(event: Event):
    event_data = WalkFinishedEvent(**event[1])
    repo = UserRepository()
    
    # 1. Calculate XP (Simple version for Phase 2)
    xp_reward = 500 
    
    # 2. Update User Profile Atomically
    await repo.add_xp(event_data.user_id, xp_reward)
    
    # 3. Log the activity
    await repo.log_activity(ActivityLog(
        user_id=event_data.user_id,
        action="WALK_COMPLETED",
        target_id=event_data.walk_id,
        metadata={"xp": xp_reward}
    ))
    print(f"✅ Awarded {xp_reward} XP to {event_data.user_id}")


2.3 Step 3: Triggering Events (Publishers)

Update the API route to simply "Fire and Forget."

Code Specification:

# app/api/walks.py
from fastapi_events.dispatcher import dispatch

@router.post("/walks/{walk_id}/finish")
async def finish_walk(walk_id: str, current_user: UserIdentity = Depends(get_current_user)):
    # ... logic to verify walk is actually done ...

    # Dispatch Event
    dispatch(
        "WALK_FINISHED",
        payload={
            "user_id": current_user.id,
            "walk_id": walk_id,
            "duration_seconds": 3600,
            "timestamp_iso": datetime.utcnow().isoformat()
        }
    )
    
    return {"status": "processing_rewards"}
