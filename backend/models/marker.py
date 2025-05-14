from pydantic import BaseModel
from typing import Literal

class Marker(BaseModel):
    lat: float
    lon: float
    label: Literal["graffiti", "pothole"]
    timestamp: str  
    city: str
