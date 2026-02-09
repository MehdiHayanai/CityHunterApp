import asyncio
import os
import sys
from datetime import datetime, timedelta

# Ensure the backend directory is in the python path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.db.mongodb import init_db
from app.models.domain.geo import GeoObject
from app.models.domain.poi import (
    DayOfWeek,
    Event,
    Monument,
    ScheduleRule,
)
from app.models.domain.walk import ValidationStatus, Walk


async def populate():
    print("Initializing Database...")
    await init_db()

    print("Clearing old data (optional)...")
    # specific collection clearing if needed, or just append
    # await Monument.find_all().delete()
    # await Event.find_all().delete()
    # await Walk.find_all().delete()

    print("Creating Monuments...")
    m1 = Monument(
        name="The Iron Lady",
        description="A wrought-iron lattice tower on the Champ de Mars in Paris.",
        location=GeoObject(coordinates=[2.2945, 48.8584]),  # Lon, Lat
        architectural_style="Industrial",
        built_year=1889,
        opening_rules=[
            ScheduleRule(
                days=[
                    DayOfWeek.MONDAY,
                    DayOfWeek.TUESDAY,
                    DayOfWeek.WEDNESDAY,
                    DayOfWeek.THURSDAY,
                    DayOfWeek.FRIDAY,
                    DayOfWeek.SATURDAY,
                    DayOfWeek.SUNDAY,
                ],
                open_time="09:00",
                close_time="23:45",
            )
        ],
        hidden_description="SECRET: There is a secret apartment at the top!",
        tags=["landmark", "tower", "paris"],
    )
    await m1.insert()

    m2 = Monument(
        name="Louvre Museum",
        description="The world's largest art museum and a historic monument in Paris.",
        location=GeoObject(coordinates=[2.3376, 48.8606]),
        architectural_style="Renaissance/Modern",
        opening_rules=[
            ScheduleRule(
                days=[
                    DayOfWeek.MONDAY,
                    DayOfWeek.WEDNESDAY,
                    DayOfWeek.THURSDAY,
                    DayOfWeek.SATURDAY,
                    DayOfWeek.SUNDAY,
                ],
                open_time="09:00",
                close_time="18:00",
            ),
            ScheduleRule(
                days=[DayOfWeek.FRIDAY], open_time="09:00", close_time="21:45"
            ),
        ],
        hidden_description="SECRET: The Mona Lisa has no eyebrows.",
        tags=["museum", "art", "history"],
    )
    await m2.insert()

    print("Creating Events...")
    base_time = datetime.now()
    e1 = Event(
        name="Jazz Under the Stars",
        description="Open air jazz concert near the tower.",
        location=GeoObject(coordinates=[2.2945, 48.8584]),
        start_time=base_time + timedelta(days=2, hours=19),  # 2 days from now, 7 PM
        end_time=base_time + timedelta(days=2, hours=23),  # 11 PM
        ticket_link="https://example.com/tickets",
        tags=["music", "jazz", "outdoor"],
    )
    await e1.insert()

    print("Creating Walk...")
    walk = Walk(
        title="Parisian Classics",
        description="A tour of the most iconic landmarks.",
        stops=[m1, m2, e1],  # Beanie handles Links
        estimated_duration_minutes=120,
        distance_km=3.5,
        status=ValidationStatus.PUBLISHED,
        is_latest=True,
        version=1,
    )
    await walk.insert()

    print(f"Database Populated! Walk ID: {walk.id}")


if __name__ == "__main__":
    asyncio.run(populate())
