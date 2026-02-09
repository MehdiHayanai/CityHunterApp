import math
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models.level import Level


class GamificationService:
    @staticmethod
    def calculate_xp_for_visit(
        visit_count: int, base_xp: int = 100, decay_factor: float = 0.5, min_xp: int = 5
    ) -> int:
        """
        Calculates XP for a visit based on how many times the user has visited.
        Uses an exponential decay model.

        Args:
            visit_count: 1-based index of the visit (1 for first visit, 2 for second...)
            base_xp: XP awarded for the first visit.
            decay_factor: Multiplier for each subsequent visit (0 < factor < 1).
            min_xp: The minimum XP amount to award.

        Returns:
            Integer XP amount.
        """
        if visit_count < 1:
            return 0

        # Formula: Base * (Decay ^ (N-1))
        # visit_count 1 -> power 0 -> 100%
        # visit_count 2 -> power 1 -> 50%

        calculated = base_xp * (decay_factor ** (visit_count - 1))
        return max(min_xp, math.floor(calculated))

    @staticmethod
    async def get_level_info(total_xp: int) -> "Level":
        """
        Determines the user's level based on total XP.
        Returns the Level object corresponding to the highest level achieved.
        """
        from app.models.level import Level

        # Fetch all levels from DB sorted by level descending
        # Optimization: In a real app, cache this.
        levels = await Level.find_all().sort("-level_number").to_list()

        if not levels:
            # Fallback if DB is empty
            from app.models.level import Reward

            return Level(
                level_number=1,
                xp_threshold=0,
                title="Tourist",
                rewards=[Reward(type="ACCESS", name="Basic Map Access")],
            )

        for level in levels:
            if total_xp >= level.xp_threshold:
                return level

        # Fallback to lowest level found
        return levels[-1]

    @staticmethod
    async def get_next_level(current_level: int) -> Optional["Level"]:
        """
        Returns the next level node, or None if max level.
        """
        from app.models.level import Level

        return await Level.find_one(Level.level_number == current_level + 1)
