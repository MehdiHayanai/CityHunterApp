import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.mongodb import init_db
from app.models.domain.poi import Monument


async def list_monuments():
    await init_db()
    monuments = await Monument.find_all().to_list()
    print(f"Total Monuments: {len(monuments)}")
    for m in monuments:
        print(f"ID: {m.id} | Name: {m.name}")


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(list_monuments())
