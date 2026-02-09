from datetime import datetime, time, timedelta
from typing import List

from pydantic import BaseModel

from app.models.domain.poi import POI, Event, Monument
from app.models.domain.walk import ValidationStatus, Walk


class TimeWindow(BaseModel):
    start: datetime
    end: datetime


class ValidationReport(BaseModel):
    status: ValidationStatus
    messages: List[str]
    common_windows: List[TimeWindow] = []


class ValidationEngine:
    """
    Service to calculate walk feasibility.
    """

    @staticmethod
    def parse_time(t_str: str) -> time:
        return datetime.strptime(t_str, "%H:%M").time()

    @staticmethod
    def get_poi_weekly_schedule(poi: POI, base_date: datetime) -> List[TimeWindow]:
        """
        Returns a list of open windows for the next 7 days starting from base_date.
        """
        windows = []

        # If it's an Event, it has absolute start/end.
        # Check if it overlaps with the next 7 days.
        if isinstance(poi, Event):
            # Simplify: If event is in the past, return empty.
            # If event is in future, return its single window clipped to the analysis week?
            # actually logic is simpler: an Event IS a single window (mostly).
            return [TimeWindow(start=poi.start_time, end=poi.end_time)]

        # If it's a Monument, iterate through next 7 days and check rules
        if isinstance(poi, Monument):
            for i in range(7):
                current_day = base_date.date() + timedelta(days=i)
                day_name = current_day.strftime("%A")  # e.g., 'Monday'

                # Check rules
                for rule in poi.opening_rules:
                    # DayOfWeek enum is "Monday", "Tuesday"...
                    if day_name in [d.value for d in rule.days]:
                        open_dt = datetime.combine(
                            current_day, ValidationEngine.parse_time(rule.open_time)
                        )
                        close_dt = datetime.combine(
                            current_day, ValidationEngine.parse_time(rule.close_time)
                        )
                        windows.append(TimeWindow(start=open_dt, end=close_dt))

        return windows

    @staticmethod
    def intersect_windows(
        set_a: List[TimeWindow], set_b: List[TimeWindow]
    ) -> List[TimeWindow]:
        """
        Finds the intersection of two sets of time windows.
        """
        intersections = []
        for wa in set_a:
            for wb in set_b:
                latest_start = max(wa.start, wb.start)
                earliest_end = min(wa.end, wb.end)
                if latest_start < earliest_end:
                    intersections.append(
                        TimeWindow(start=latest_start, end=earliest_end)
                    )
        return intersections

    @classmethod
    async def validate_walk(cls, walk: Walk) -> ValidationReport:
        if not walk.stops:
            return ValidationReport(
                status=ValidationStatus.DRAFT, messages=["No stops in walk."]
            )

        # Fetch all POIs (walk.stops are Links, need to fetch if not populated)
        # Beanie Links usually need .fetch() if not fetched.
        # But assuming we gathered them or they are fetched.
        # Let's assume passed walk has joined stops or we fetch them here.
        # NOTE: Beanie fetch is async.

        pois: List[POI] = []
        for link in walk.stops:
            if isinstance(link, POI):  # Already fetched/embedded
                pois.append(link)
            else:
                # Iterate and fetch
                p = await link.fetch()
                if p:
                    pois.append(p)

        if not pois:
            return ValidationReport(
                status=ValidationStatus.DRAFT, messages=["Could not fetch stops."]
            )

        # 1. Calculate Common Open Window for next 30 days (simplified to 7 for now)
        base_date = datetime.now()

        # Initialize common windows with the first POI's schedule
        common_windows = cls.get_poi_weekly_schedule(pois[0], base_date)

        for i in range(1, len(pois)):
            next_windows = cls.get_poi_weekly_schedule(pois[i], base_date)
            common_windows = cls.intersect_windows(common_windows, next_windows)

            if not common_windows:
                return ValidationReport(
                    status=ValidationStatus.RED,
                    messages=[
                        f"No overlap found between stops at index {i - 1} and {i}."
                    ],
                )

        # 2. Check Duration
        # If common window is smaller than estimated duration -> Yellow
        estimated_min = walk.estimated_duration_minutes or 60  # Default 1h
        viable_windows = []

        for w in common_windows:
            duration = (w.end - w.start).total_seconds() / 60
            if duration >= estimated_min:
                viable_windows.append(w)

        if not viable_windows:
            return ValidationReport(
                status=ValidationStatus.YELLOW,
                messages=[
                    "Common opening hours exist, but are shorter than the estimated walk duration."
                ],
            )

        return ValidationReport(
            status=ValidationStatus.GREEN,
            messages=["Walk is feasible!"],
            common_windows=viable_windows,
        )
