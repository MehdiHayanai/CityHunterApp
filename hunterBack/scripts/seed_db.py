import asyncio
import random

from app.db.mongodb import init_db
from app.models.content import GeoPoint, Monument, Walk, WalkMetrics
from app.models.level import Level, Reward
from app.models.quiz import Quiz

MONUMENTS_DATA = [
    {
        "name": "Eiffel Tower",
        "description": "The Iron Lady, symbol of Paris.",
        "location": {"lat": 48.8584, "lng": 2.2945},
        "category": "Landmark",
        "image_url": "https://images.unsplash.com/photo-1511739001486-da283B4e7.jpg",
    },
    {
        "name": "Louvre Museum",
        "description": "World's largest art museum.",
        "location": {"lat": 48.8606, "lng": 2.3376},
        "category": "Museum",
        "image_url": "https://images.unsplash.com/photo-1499856870642-47b31d7cb176.jpg",
    },
    {
        "name": "Notre-Dame Cathedral",
        "description": "Medieval Catholic cathedral.",
        "location": {"lat": 48.8529, "lng": 2.3500},
        "category": "Religious",
        "image_url": "https://images.unsplash.com/photo-1478391679964-b7d9b316d9ea.jpg",
    },
    {
        "name": "Arc de Triomphe",
        "description": "Honors those who fought and died for France.",
        "location": {"lat": 48.8738, "lng": 2.2950},
        "category": "Landmark",
        "image_url": "https://images.unsplash.com/photo-1509439581779-6298f75bf6e5.jpg",
    },
    {
        "name": "Sacré-Cœur",
        "description": "Basilica of the Sacred Heart of Paris.",
        "location": {"lat": 48.8867, "lng": 2.3431},
        "category": "Religious",
        "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34.jpg",
    },
]


async def seed():
    print("Connecting to database...")
    client = await init_db()

    print("Clearing existing content...")
    await Monument.delete_all()
    await Walk.delete_all()

    print(f"Creating {len(MONUMENTS_DATA)} monuments...")
    created_monuments = []
    for m_data in MONUMENTS_DATA:
        lat = m_data["location"]["lat"]
        lng = m_data["location"]["lng"]

        monument = Monument(
            name=m_data["name"],
            description=m_data["description"],
            location=GeoPoint(coordinates=[lng, lat]),  # GeoJSON: [lng, lat]
            category=m_data["category"],
            image_url=m_data["image_url"],
            swagg_reward_id=f"swagg_{random.randint(1000, 9999)}",
        )
        await monument.insert()
        created_monuments.append(monument)
        print(f"   - Created: {monument.name} ({monument.id})")

    print("Creating Walks...")

    # Walk 1: The Classics
    stops_1 = [
        str(m.id)
        for m in [created_monuments[0], created_monuments[3], created_monuments[1]]
    ]  # Eiffel -> Arc -> Louvre
    walk1 = Walk(
        name="Parisian Classics",
        description="A journey through the most iconic landmarks of Paris.",
        difficulty="Medium",
        stops=stops_1,
        metrics=WalkMetrics(rating=4.8, visitors=1250),
        estimated_time="2h 30m",
        distance="4.5km",
        image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34.jpg",
        is_official=True,
    )
    await walk1.insert()
    print(f"   - Created Walk: {walk1.name} with {len(walk1.stops)} stops")

    # Walk 2: Spiritual Journey
    stops_2 = [
        str(m.id) for m in [created_monuments[2], created_monuments[4]]
    ]  # Notre Dame -> Sacre Coeur
    walk2 = Walk(
        name="Spiritual Heights",
        description="Visit the sacred hills and islands of Paris.",
        difficulty="Hard",
        stops=stops_2,
        metrics=WalkMetrics(rating=4.6, visitors=850),
        estimated_time="1h 45m",
        distance="3.2km",
        image_url="https://images.unsplash.com/photo-1478391679964-b7d9b316d9ea.jpg",
        is_official=True,
    )
    await walk2.insert()
    print(f"   - Created Walk: {walk2.name} with {len(walk2.stops)} stops")

    print("Creating Levels...")
    await Level.delete_all()

    levels_data = []
    # XP thresholds usually follow a curve.
    # Example: 0, 1000, 2500, 4500, 7000...
    xp = 0
    for i in range(1, 11):
        if i == 1:
            xp = 0
            title = "Rookie"
        else:
            xp += (i - 1) * 1000
            title = f"Hunter Level {i}"

        rewards = []
        if i % 3 == 0:
            rewards.append(Reward(type="ITEM", name=f"Level {i} Key", image_url="none"))

        level = Level(level_number=i, xp_threshold=xp, title=title, rewards=rewards)
        await level.insert()
        levels_data.append(level)
        print(f"   - Created Level {i}: {title} (XP: {xp})")

    print("Creating Quizzes...")
    await Quiz.delete_all()

    # Eiffel Tower Quizzes (using seeded ID from created_monuments[0])
    eiffel_id = str(created_monuments[0].id)

    q1 = Quiz(
        monument_id=eiffel_id,
        question="When was the Eiffel Tower completed?",
        options=["1887", "1889", "1900", "1923"],
        correct_answer=1,  # 1889
        xp_reward=100,
        difficulty="EASY",
    )
    await q1.insert()

    q2 = Quiz(
        monument_id=eiffel_id,
        question="Who was the primary architect?",
        options=[
            "Gustave Eiffel",
            "Stephen Sauvestre",
            "Maurice Koechlin",
            "Emile Nouguier",
        ],
        correct_answer=0,
        xp_reward=150,
        difficulty="MEDIUM",
    )
    await q2.insert()

    # Louvre Quizzes (created_monuments[1])
    louvre_id = str(created_monuments[1].id)

    q3 = Quiz(
        monument_id=louvre_id,
        question="Which king originally built the Louvre as a fortress?",
        options=["Louis XIV", "Francis I", "Philip II", "Napoleon"],
        correct_answer=2,  # Philip II
        xp_reward=200,
        difficulty="HARD",
    )
    await q3.insert()

    print("Seeding complete!")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
