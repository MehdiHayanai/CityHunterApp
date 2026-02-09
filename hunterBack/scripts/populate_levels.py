import asyncio
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.models.gamification import Level

TEST_LEVELS = [
    {"level": 1, "xp": 0, "title": "Tourist", "reward": "Basic Map Access"},
    {"level": 2, "xp": 500, "title": "Wanderer", "reward": "Custom Avatar Frame"},
    {"level": 3, "xp": 1500, "title": "Explorer", "reward": "Create Public Routes"},
    {"level": 4, "xp": 3000, "title": "Pathfinder", "reward": "Night Mode Maps"},
    {
        "level": 5,
        "xp": 5000,
        "title": "Navigator",
        "reward": "Exclusive 'Undercity' Quests",
    },
    {"level": 6, "xp": 8000, "title": "Cartographer", "reward": "Custom Map Themes"},
    {"level": 7, "xp": 12000, "title": "Street Savant", "reward": "AR Vision (Beta)"},
    {"level": 8, "xp": 17000, "title": "Urban Legend", "reward": "Create Guilds"},
    {"level": 9, "xp": 25000, "title": "City Hunter", "reward": "Developer Badge"},
    {
        "level": 10,
        "xp": 35000,
        "title": "Master Architect",
        "reward": "The Key to the City",
    },
    {
        "level": 11,
        "xp": 50000,
        "title": "Ethereal Guide",
        "reward": "Global Custom Landmarks",
    },
    {"level": 12, "xp": 75000, "title": "Omniscient", "reward": "Game Master Controls"},
]


async def init_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    await init_beanie(database=client[settings.DB_NAME], document_models=[Level])


async def populate_levels():
    print("Initializing Database...")
    await init_db()

    print("Checking existing levels...")
    count = await Level.count()
    if count > 0:
        print(
            f"Found {count} levels. Clearing existing levels to ensure freshness (optional)..."
        )
        # Optional: Clear levels or just update. For this script, let's clear and re-populate.
        await Level.delete_all()

    print("Populating levels...")
    for level_data in TEST_LEVELS:
        level = Level(**level_data)
        await level.create()
        print(f"Created Level {level.level}: {level.title}")

    print("Done!")


if __name__ == "__main__":
    asyncio.run(populate_levels())
