from dataclasses import dataclass
from typing import Optional

@dataclass
class CropProfile:
    name: str
    ideal_moisture_min: float
    ideal_moisture_max: float
    ideal_temp_min: float
    ideal_temp_max: float
    crop_type: str = "generic"

@dataclass
class SensorReadingSummary:
    avg_moisture: Optional[float]
    avg_temperature: Optional[float]
    avg_humidity: Optional[float]
