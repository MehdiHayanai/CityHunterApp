from typing import List

from pydantic import BaseModel


class GeoObject(BaseModel):
    type: str = "Point"
    coordinates: List[float]


class GeoLineString(BaseModel):
    type: str = "LineString"
    coordinates: List[List[float]]
