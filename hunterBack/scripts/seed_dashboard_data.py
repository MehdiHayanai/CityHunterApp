import asyncio
import os
import sys
from datetime import datetime, timedelta

# Ensure the backend directory is in the python path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.db.mongodb import init_db
from app.models.domain.geo import GeoObject
from app.models.domain.poi import (
    Event,
    Monument,
    ImageMedia,
)
from app.models.domain.walk import ValidationStatus, Walk

# --- RAW DATA FROM DASHBOARD CONSTANTS ---

MONUMENTS_DATA = [
    {
        "id": 201,
        "name": "Iron Lady (Eiffel Tower)",
        "type": "Landmark",
        "address": "Champ de Mars, 5 Av. Anatole France, Paris",
        "description": "The Iron Lady, symbol of Paris. A wrought-iron lattice tower on the Champ de Mars.",
        "xp": 1500,
        "img": "https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg?width=800",
        "lat": 48.8584,
        "lng": 2.2945,
        "tags": ["landmark", "tower", "iconic"],
    },
    {
        "id": 202,
        "name": "Louvre Pyramid",
        "type": "Art Hub",
        "address": "Rue de Rivoli, 75001 Paris",
        "description": "The world's largest art museum and a historic monument in Paris.",
        "xp": 1200,
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/2560px-Louvre_Museum_Wikimedia_Commons.jpg?20161126115921",
        "lat": 48.8606,
        "lng": 2.3376,
        "tags": ["museum", "art", "glass"],
    },
    {
        "id": 203,
        "name": "Notre-Dame Ruins",
        "type": "Legacy",
        "address": "6 Parvis Notre-Dame - Pl. Jean-Paul II, Paris",
        "description": "Medieval Catholic cathedral on the Île de la Cité.",
        "xp": 2000,
        "img": "https://commons.wikimedia.org/wiki/Special:FilePath/Notre-Dame_de_Paris_2013-07-24.jpg?width=800",
        "lat": 48.8529,
        "lng": 2.3500,
        "tags": ["cathedral", "history", "religion"],
    },
    {
        "id": 204,
        "name": "Arc de Triomphe",
        "type": "Structure",
        "address": "Pl. Charles de Gaulle, 75008 Paris",
        "description": "Honors those who fought and died for France in the French Revolutionary and Napoleonic Wars.",
        "xp": 800,
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Arc_de_Triomphe_de_l%27%C3%89toile_in_July_2011.jpg/640px-Arc_de_Triomphe_de_l%27%C3%89toile_in_July_2011.jpg",
        "lat": 48.8738,
        "lng": 2.2950,
        "tags": ["monument", "war", "history"],
    },
    {
        "id": 205,
        "name": "Sacré-Cœur Basilica",
        "type": "Religious",
        "address": "35 Rue du Chevalier de la Barre, 75018 Paris",
        "description": "The Basilica of the Sacred Heart of Paris, dedicated to the Sacred Heart of Jesus.",
        "xp": 1100,
        "img": "https://commons.wikimedia.org/wiki/Special:FilePath/Sacre_Coeur_Paris.jpg?width=800",
        "lat": 48.8867,
        "lng": 2.3431,
        "tags": ["basilica", "view", "religion"],
    },
]

EVENTS_DATA = [
    {
        "id": 301,
        "name": "La Défense Cyber-Hack",
        "type": "Cyberpunk",
        "address": "La Défense, Puteaux",
        "description": "A gathering of elite netrunners in the business district.",
        "swagg": "Corporate Keycard",
        "img": "https://commons.wikimedia.org/wiki/Special:FilePath/La_Defense_Paris.jpg?width=800",
        "lat": 48.8922,
        "lng": 2.2370,
        "tags": ["tech", "hackathon", "future"],
    },
    {
        "id": 302,
        "name": "Catacombs Rave",
        "type": "Underground",
        "address": "1 Av. du Colonel Henri Rol-Tanguy",
        "description": "Secret party deep underground.",
        "swagg": "Bone Token",
        "img": "https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?width=800",
        "lat": 48.8338,
        "lng": 2.3324,
        "tags": ["music", "underground", "secret"],
    },
    {
        "id": 303,
        "name": "Seine Holo-Show",
        "type": "Art Ops",
        "address": "Pont Alexandre III, Paris",
        "description": "Holographic art installation over the river Seine.",
        "swagg": "River Glitch Pin",
        "img": "https://images.pexels.com/photos/35415047/pexels-photo-35415047.jpeg?width=800",
        "lat": 48.8639,
        "lng": 2.3135,
        "tags": ["art", "light", "river"],
    },
    {
        "id": 304,
        "name": "Le Marais Vintage Expo",
        "type": "Rations",
        "address": "Le Marais, 4th Arr.",
        "description": "Vintage fashion and food market.",
        "swagg": "Retro Macaron",
        "img": "https://images.pexels.com/photos/2607308/pexels-photo-2607308.jpeg?width=800",
        "lat": 48.8575,
        "lng": 2.3592,
        "tags": ["market", "food", "fashion"],
    },
    {
        "id": 305,
        "name": "Montmartre AI Canvas",
        "type": "Art Ops",
        "address": "Place du Tertre, 75018 Paris",
        "description": "AI robots painting portraits in the artist's square.",
        "swagg": "Digital Brush",
        "img": "https://images.pexels.com/photos/3073666/pexels-photo-3073666.jpeg?width=800",
        "lat": 48.8865,
        "lng": 2.3408,
        "tags": ["art", "ai", "painting"],
    },
]

WALKS_DATA = [
    {
        "id": 401,
        "name": "The Iron Circuit",
        "description": "A high-altitude tour starting at the Iron Lady and ending at the Arch.",
        "difficulty": "Medium",
        "estTime": 90,  # 1h 30m
        "stopIds": [201, 303, 204],
    },
    {
        "id": 402,
        "name": "Gothic Shadows",
        "description": "Explore the darker side of Paris history, from ruins to the underground.",
        "difficulty": "Hard",
        "estTime": 165,  # 2h 45m
        "stopIds": [203, 304, 302],
    },
    {
        "id": 403,
        "name": "Art & Glitch Path",
        "description": "A creative run through the city's most inspiring art hubs.",
        "difficulty": "Easy",
        "estTime": 180,  # 3h 00m
        "stopIds": [202, 305, 205],
    },
]


async def seed_dashboard():
    print("Initializing Database...")
    await init_db()

    print("Clearing collection data to avoid duplicates...")
    await Monument.delete_all()
    await Event.delete_all()
    await Walk.delete_all()

    # Dictionary to map frontend IDs (int) to backend Objects
    id_map = {}

    print(f"Creating {len(MONUMENTS_DATA)} Monuments...")
    for m in MONUMENTS_DATA:
        monument = Monument(
            name=m["name"],
            description=m["description"],
            location=GeoObject(coordinates=[m["lng"], m["lat"]]),
            images=[ImageMedia(url=m["img"], description="Cover Image")],
            tags=m["tags"],
            hidden_description=f"Unlocked info about {m['name']}.",
        )
        await monument.insert()
        id_map[m["id"]] = monument
        print(f"  + {m['name']}")

    print(f"Creating {len(EVENTS_DATA)} Events...")
    base_time = datetime.now()
    for e in EVENTS_DATA:
        event = Event(
            name=e["name"],
            description=e["description"],
            location=GeoObject(coordinates=[e["lng"], e["lat"]]),
            images=[ImageMedia(url=e["img"], description="Event Cover")],
            tags=e["tags"],
            hidden_description=f"Unlocked info about {e['name']}.",
            start_time=base_time + timedelta(days=1, hours=10),
            end_time=base_time + timedelta(days=1, hours=14),
        )
        await event.insert()
        id_map[e["id"]] = event
        print(f"  + {e['name']}")

    print(f"Creating {len(WALKS_DATA)} Walks...")
    for w in WALKS_DATA:
        stops_objects = []
        for stop_id in w["stopIds"]:
            if stop_id in id_map:
                stops_objects.append(id_map[stop_id])
            else:
                print(f"  ! Warning: Stop ID {stop_id} not found in map.")

        walk = Walk(
            title=w["name"],
            description=w["description"],
            stops=stops_objects,
            estimated_duration_minutes=w["estTime"],
            status=ValidationStatus.PUBLISHED,
            is_latest=True,
            version=1,
        )
        await walk.insert()
        print(f"  + Walk: {w['name']} ({len(walk.stops)} stops)")

    print("✅ Dashboard Data Seeded Successfully!")


if __name__ == "__main__":
    asyncio.run(seed_dashboard())
