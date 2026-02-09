import asyncio
import os
import sys

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.mongodb import init_db
from app.models.level import Level


async def seed_levels():
    print("Initializing Database connection...")
    await init_db()

    print("Clearing existing levels...")
    await Level.delete_all()

    levels_data = [
        {
            "level_number": 1,
            "xp_threshold": 0,
            "title": "Rookie Walker",
            "rewards": [
                {
                    "type": "BADGE",
                    "name": "Rookie Badge",
                    "image_url": "/assets/badges/rookie.png",
                }
            ],
        },
        {
            "level_number": 2,
            "xp_threshold": 1000,
            "title": "Street Explorer",
            "rewards": [
                {
                    "type": "ITEM",
                    "name": "Basic Compass",
                    "image_url": "/assets/items/compass.png",
                }
            ],
        },
        {
            "level_number": 3,
            "xp_threshold": 2500,
            "title": "Urban Nomad",
            "rewards": [
                {
                    "type": "ACCESS",
                    "name": "Night Mode",
                    "image_url": "/assets/ui/night_mode.png",
                }
            ],
        },
        {
            "level_number": 4,
            "xp_threshold": 5000,
            "title": "District Scout",
            "rewards": [
                {
                    "type": "ITEM",
                    "name": "Running Shoes",
                    "image_url": "/assets/items/shoes.png",
                }
            ],
        },
        {
            "level_number": 5,
            "xp_threshold": 8000,
            "title": "City Hunter",
            "rewards": [
                {
                    "type": "BADGE",
                    "name": "Hunter Badge",
                    "image_url": "/assets/badges/hunter.png",
                }
            ],
        },
        {
            "level_number": 6,
            "xp_threshold": 12000,
            "title": "Vibe Master",
            "rewards": [
                {
                    "type": "ACCESS",
                    "name": "Secret Routes",
                    "image_url": "/assets/ui/secret.png",
                }
            ],
        },
        {
            "level_number": 7,
            "xp_threshold": 17000,
            "title": "Street Savant",
            "rewards": [
                {
                    "type": "ITEM",
                    "name": "Rare Swagg",
                    "image_url": "/assets/items/rare_swagg.png",
                }
            ],
        },
        {
            "level_number": 8,
            "xp_threshold": 23000,
            "title": "Metropolis Legend",
            "rewards": [
                {
                    "type": "BADGE",
                    "name": "Legend Badge",
                    "image_url": "/assets/badges/legend.png",
                }
            ],
        },
        {
            "level_number": 9,
            "xp_threshold": 30000,
            "title": "Urban Myth",
            "rewards": [
                {
                    "type": "ACCESS",
                    "name": "Beta Features",
                    "image_url": "/assets/ui/beta.png",
                }
            ],
        },
        {
            "level_number": 10,
            "xp_threshold": 40000,
            "title": "City God",
            "rewards": [
                {
                    "type": "ITEM",
                    "name": "Golden Keys",
                    "image_url": "/assets/items/keys.png",
                }
            ],
        },
    ]

    print(f"Seeding {len(levels_data)} levels...")
    for lvl in levels_data:
        await Level(**lvl).create()
        print(f"Created Level {lvl['level_number']}: {lvl['title']}")

    print("✅ Level seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed_levels())
