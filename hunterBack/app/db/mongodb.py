from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

# New Domain Models
from app.models.domain.poi import POI, Event, Monument
from app.models.domain.session import WalkSession
from app.models.domain.walk import Walk

# from app.models.content import Event, Monument, Walk  # Deprecated
from app.models.level import Level
from app.models.quest import QuestState
from app.models.quiz import Quiz
from app.models.social import ActivityFeedItem, Friendship
from app.models.user import User
from app.models.user_domain import ActivityLog, UserIdentity, UserProfile
from app.models.verification import VerificationToken


async def init_db():
    """
    Initialize Beanie with Motor client and document models.
    """
    client = AsyncIOMotorClient(
        settings.MONGO_URI,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=5000,
    )

    print("DEBUG: Init Beanie...")
    await init_beanie(
        database=client[settings.DB_NAME],
        document_models=[
            User,
            UserIdentity,
            UserProfile,
            ActivityLog,
            # Old models commented out to avoid conflict in collection naming if any,
            # though they mapped to 'monuments'/'events' and new ones map to 'pois'.
            # Ideally we migrate data, but for now we switch to new schema.
            # Monument,
            # Walk,
            # Event,
            POI,  # Logic: POI is root, so Monument/Event are covered if polymorphic?
            # Beanie requires subclasses to be listed if they are to be treated as Documents?
            # Actually for Single Table Inheritance, usually listing the Root is enough OR listing all.
            # Beanie docs say: "You have to add all the document classes to the list..."
            Monument,
            Event,
            Walk,
            WalkSession,
            QuestState,
            ActivityFeedItem,
            Friendship,
            Level,
            Quiz,
            VerificationToken,
        ],
    )
    print(f"DEBUG: Beanie ODM Initialized for DB: {settings.DB_NAME}")
    return client
