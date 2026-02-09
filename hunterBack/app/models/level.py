from typing import List, Optional

from beanie import Document, Indexed
from pydantic import BaseModel, ConfigDict


class Reward(BaseModel):
    type: str  # e.g., "ITEM", "BADGE", "ACCESS"
    name: str
    image_url: Optional[str] = None
    item_id: Optional[str] = None  # data payload


class Level(Document):
    level_number: Indexed(int, unique=True)
    xp_threshold: int
    title: str  # e.g. "Rookie Hunter"
    rewards: List[Reward] = []

    @property
    def level(self) -> int:
        return self.level_number

    @property
    def xp(self) -> int:
        return self.xp_threshold

    @property
    def reward(self) -> str:
        return self.rewards[0].name if self.rewards else "None"

    class Settings:
        name = "levels"
        indexes = [
            # Ensure unique level number
            "level_number",
        ]

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "level_number": 2,
                "xp_threshold": 1000,
                "title": "Street Walker",
                "rewards": [
                    {
                        "type": "ITEM",
                        "name": "Neon Sneakers",
                        "image_url": "http://example.com/sneakers.png",
                    }
                ],
            }
        },
    )
