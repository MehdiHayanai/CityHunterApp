from enum import Enum
from typing import List

from beanie import Document
from pydantic import ConfigDict


class QuizDifficulty(str, Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class Quiz(Document):
    monument_id: str  # Reference to Monument ID
    question: str
    options: List[str]
    correct_answer: int  # Index of the correct option (0-based)
    xp_reward: int
    difficulty: QuizDifficulty = QuizDifficulty.MEDIUM

    class Settings:
        name = "quizzes"
        indexes = [
            "monument_id",  # Optimize lookups by monument
        ]

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "monument_id": "monument_123",
                "question": "When was this monument built?",
                "options": ["1889", "1900", "1850", "1920"],
                "correct_answer": 0,
                "xp_reward": 100,
                "difficulty": "MEDIUM",
            }
        },
    )
