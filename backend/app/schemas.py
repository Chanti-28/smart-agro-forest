from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# --- Auth / User ---

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserPublic(ORMBase):
    id: int
    name: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# --- Farms ---

class FarmBase(BaseModel):
    name: str
    location: Optional[str] = None
    description: Optional[str] = None

class FarmCreate(FarmBase):
    pass

class FarmUpdate(FarmBase):
    pass

class Farm(FarmBase, ORMBase):
    id: int

# --- Plots ---

class PlotBase(BaseModel):
    name: str
    farm_id: int
    crop_type: Optional[str] = None
    tree_species: Optional[str] = None

class PlotCreate(PlotBase):
    pass

class PlotUpdate(PlotBase):
    pass

class Plot(PlotBase, ORMBase):
    id: int

# --- Sensors ---

class SensorBase(BaseModel):
    name: str
    plot_id: int
    sensor_type: str
    status: str = "active"

class SensorCreate(SensorBase):
    pass

class SensorUpdate(SensorBase):
    pass

class Sensor(SensorBase, ORMBase):
    id: int

# --- Readings ---

class ReadingBase(BaseModel):
    sensor_id: int
    moisture: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None

class ReadingCreate(ReadingBase):
    pass

class ReadingUpdate(ReadingBase):
    pass

class Reading(ReadingBase, ORMBase):
    id: int
    timestamp: datetime

# --- Alerts ---

class AlertBase(BaseModel):
    plot_id: int
    message: str
    severity: str = "info"

class AlertCreate(AlertBase):
    pass

class AlertUpdate(AlertBase):
    pass

class Alert(AlertBase, ORMBase):
    id: int
    created_at: datetime

# --- Analytics ---

class PlotStatus(BaseModel):
    plot_id: int
    avg_moisture: Optional[float] = None
    avg_temperature: Optional[float] = None
    avg_humidity: Optional[float] = None
    irrigation_recommendation: Optional[str] = None
    fire_risk: Optional[str] = None


