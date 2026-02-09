import pytest
import pytest_asyncio
from beanie import init_beanie
from mongomock_motor import AsyncMongoMockClient

from app.models.gamification import Level
from app.services.gamification_service import GamificationService

# Define test levels locally for the test if we remove the global constant later
TEST_LEVELS_DATA = [
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


@pytest_asyncio.fixture
async def init_db():
    client = AsyncMongoMockClient()
    await init_beanie(database=client.test_db, document_models=[Level])
    # Populate
    for level in TEST_LEVELS_DATA:
        await Level(**level).create()


def test_xp_decay_logic():
    # Test Standard Decay - Pure Math (Sync)
    assert (
        GamificationService.calculate_xp_for_visit(1, base_xp=100, decay_factor=0.5)
        == 100
    )
    assert (
        GamificationService.calculate_xp_for_visit(2, base_xp=100, decay_factor=0.5)
        == 50
    )
    assert (
        GamificationService.calculate_xp_for_visit(3, base_xp=100, decay_factor=0.5)
        == 25
    )
    assert (
        GamificationService.calculate_xp_for_visit(4, base_xp=100, decay_factor=0.5)
        == 12
    )


def test_min_xp_floor():
    # Sync test
    xp = GamificationService.calculate_xp_for_visit(
        10, base_xp=100, decay_factor=0.5, min_xp=5
    )
    assert xp == 5


@pytest.mark.asyncio
async def test_level_lookup_basic(init_db):
    # 0 XP -> Level 1
    lvl = await GamificationService.get_level_info(0)
    assert lvl.level == 1
    assert lvl.title == "Tourist"


@pytest.mark.asyncio
async def test_level_lookup_mid(init_db):
    # 600 XP -> Level 2 (starts at 500)
    lvl = await GamificationService.get_level_info(600)
    assert lvl.level == 2
    assert lvl.title == "Wanderer"


@pytest.mark.asyncio
async def test_level_lookup_exact(init_db):
    # 1500 XP -> Level 3 (starts at 1500)
    lvl = await GamificationService.get_level_info(1500)
    assert lvl.level == 3


@pytest.mark.asyncio
async def test_level_lookup_high(init_db):
    # 100000 XP -> Level 12 (starts at 75000)
    lvl = await GamificationService.get_level_info(100000)
    assert lvl.level == 12
    assert lvl.title == "Omniscient"


@pytest.mark.asyncio
async def test_get_next_level(init_db):
    next_lvl = await GamificationService.get_next_level(1)
    assert next_lvl is not None
    assert next_lvl.level == 2

    next_lvl_max = await GamificationService.get_next_level(12)
    assert next_lvl_max is None
