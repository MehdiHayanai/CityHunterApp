import asyncio
import json
import os
import sys

# Ensure the backend directory is in the python path
# Script is in scripts/data/google_places/, so we need to go up 3 levels to reach 'hunterBack'
from app.db.mongodb import init_db
from app.models.domain.geo import GeoObject
from app.models.domain.poi import Monument

# JSON File Path
JSON_FILE_PATH = os.path.join("loc_assets/paris_monuments_enriched.json")


async def insert_monuments():
    print("Initializing Database...")
    await init_db()

    if not os.path.exists(JSON_FILE_PATH):
        print(f"ERROR: JSON file not found at {JSON_FILE_PATH}")
        return

    print(f"Reading data from {JSON_FILE_PATH}...")
    with open(JSON_FILE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Found {len(data)} monuments to insert.")

    count = 0
    skipped = 0

    for item in data:
        # Check if monument already exists by name (simple deduplication)
        exists = await Monument.find_one(Monument.name == item["name"])
        if exists:
            print(f"Skipping {item['name']} (Already exists)")
            skipped += 1
            continue

        # Prepare Opening Rules (if any in JSON, mostly empty for now based on fetcher)
        # The fetcher currently sets opening_rules=[], so we leave it as/is.

        # Prepare Images
        # Internal model expects ImageMedia objects inside List
        # usage: images: List[ImageMedia]
        # fetcher output: "images": [{"url": "...", "description": "..."}]
        # This matches the structure but we should rely on Pydantic to validate.

        try:
            monument = Monument(
                name=item["name"],
                description=item["description"],
                short_description=item.get("short_description")
                or item["description"][:100],
                location=GeoObject(
                    type="Point", coordinates=item["location"]["coordinates"]
                ),
                images=item.get("images", []),
                tags=item.get("tags", []),
                architectural_style=item.get("architectural_style"),
                built_year=item.get("built_year"),
                # Store extra metadata if needed, possibly in description or new fields
                # For now, we stick to the model definition
            )

            await monument.insert()
            print(f"Inserted: {monument.name}")
            count += 1
        except Exception as e:
            print(f"Failed to insert {item.get('name')}: {e}")

    print(f"\nDone! Inserted: {count}, Skipped: {skipped}")


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(insert_monuments())
