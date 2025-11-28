# import hashlib
# import secrets
# from datetime import datetime, timedelta
# from statistics import mean
# from typing import List, Optional

# from fastapi import FastAPI, Depends, HTTPException, Header, status
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session
# from mangum import Mangum  # NEW: for AWS Lambda support

# from . import models, schemas
# from .database import SessionLocal, engine, Base
# from .smart_agri_forest import (
#     CropProfile,
#     SensorReadingSummary,
#     IrrigationPlanner,
#     ForestRiskAnalyser,
# )

# # Create tables (works locally and in container/EC2; on Lambda you usually
# # run migrations beforehand or let first cold start create them)
# Base.metadata.create_all(bind=engine)

# app = FastAPI(title="Smart Agriculture and Forestry API")

# # -------------------------------------------------------------------------
# # CORS
# # -------------------------------------------------------------------------
# # For local dev + S3 static website. You can restrict origins later if needed.
# origins = [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
#     "http://localhost:4173",
#     "http://127.0.0.1:4173",
#     "http://smart-agro-frontend-x24336653.s3-website-us-east-1.amazonaws.com",
# ]


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],          # allow all origins
#     allow_credentials=False,      # must be False when using "*"
#     allow_methods=["*"],          # allow all HTTP methods
#     allow_headers=["*"],          # allow all headers
# )

# # -------------------------------------------------------------------------
# # DB Dependency
# # -------------------------------------------------------------------------
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# # -------------------------------------------------------------------------
# # Helpers for simple auth (no external libs)
# # -------------------------------------------------------------------------
# TOKEN_LIFETIME_HOURS = 24


# def hash_password(password: str) -> str:
#     """Simple SHA-256 hash (demo / assignment only)."""
#     return hashlib.sha256(password.encode("utf-8")).hexdigest()


# def verify_password(password: str, password_hash: str) -> bool:
#     return hash_password(password) == password_hash


# def create_session_token(user: models.User, db: Session) -> str:
#     token = secrets.token_hex(32)
#     now = datetime.utcnow()
#     session = models.SessionToken(
#         user_id=user.id,
#         token=token,
#         created_at=now,
#         expires_at=now + timedelta(hours=TOKEN_LIFETIME_HOURS),
#     )
#     db.add(session)
#     db.commit()
#     db.refresh(session)
#     return token


# def get_current_user(
#     db: Session = Depends(get_db),
#     authorization: Optional[str] = Header(default=None),
# ) -> models.User:
#     if not authorization or not authorization.startswith("Bearer "):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Not authenticated",
#         )
#     token = authorization.split(" ", 1)[1]
#     session = (
#         db.query(models.SessionToken)
#         .filter(models.SessionToken.token == token)
#         .first()
#     )
#     if not session or session.expires_at < datetime.utcnow():
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid or expired token",
#         )
#     user = db.query(models.User).get(session.user_id)
#     if not user or not user.is_active:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="User not active",
#         )
#     return user


# # -------------------------------------------------------------------------
# # Public endpoints
# # -------------------------------------------------------------------------
# @app.get("/")
# def read_root():
#     return {
#         "message": "Smart Agriculture & Forestry API is running. Go to /docs for Swagger UI."
#     }


# # -------------------------------------------------------------------------
# # Auth endpoints
# # -------------------------------------------------------------------------
# @app.post("/auth/register", response_model=schemas.UserPublic)
# def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
#     existing = (
#         db.query(models.User)
#         .filter(models.User.email == user_data.email.lower())
#         .first()
#     )
#     if existing:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Email already registered",
#         )
#     user = models.User(
#         name=user_data.name,
#         email=user_data.email.lower(),
#         password_hash=hash_password(user_data.password),
#     )
#     db.add(user)
#     db.commit()
#     db.refresh(user)
#     return user


# @app.post("/auth/login", response_model=schemas.Token)
# def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
#     user = (
#         db.query(models.User)
#         .filter(models.User.email == credentials.email.lower())
#         .first()
#     )
#     if not user or not verify_password(credentials.password, user.password_hash):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid email or password",
#         )
#     token = create_session_token(user, db)
#     return schemas.Token(access_token=token)


# @app.post("/auth/logout")
# def logout(
#     db: Session = Depends(get_db),
#     authorization: Optional[str] = Header(default=None),
#     current_user: models.User = Depends(get_current_user),
# ):
#     # Remove the current token from DB
#     if authorization and authorization.startswith("Bearer "):
#         token = authorization.split(" ", 1)[1]
#         db.query(models.SessionToken).filter(
#             models.SessionToken.token == token
#         ).delete()
#         db.commit()
#     return {"detail": "Logged out"}


# @app.get("/auth/me", response_model=schemas.UserPublic)
# def read_me(current_user: models.User = Depends(get_current_user)):
#     return current_user


# # -------------------------------------------------------------------------
# # FARMS CRUD
# # -------------------------------------------------------------------------
# @app.post("/farms/", response_model=schemas.Farm)
# def create_farm(
#     farm: schemas.FarmCreate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_farm = models.Farm(**farm.dict())
#     db.add(db_farm)
#     db.commit()
#     db.refresh(db_farm)
#     return db_farm


# @app.get("/farms/", response_model=List[schemas.Farm])
# def list_farms(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     return db.query(models.Farm).all()


# @app.get("/farms/{farm_id}", response_model=schemas.Farm)
# def get_farm(
#     farm_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     farm = db.query(models.Farm).get(farm_id)
#     if not farm:
#         raise HTTPException(status_code=404, detail="Farm not found")
#     return farm


# @app.put("/farms/{farm_id}", response_model=schemas.Farm)
# def update_farm(
#     farm_id: int,
#     farm: schemas.FarmUpdate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_farm = db.query(models.Farm).get(farm_id)
#     if not db_farm:
#         raise HTTPException(status_code=404, detail="Farm not found")
#     for k, v in farm.dict().items():
#         setattr(db_farm, k, v)
#     db.commit()
#     db.refresh(db_farm)
#     return db_farm


# @app.delete("/farms/{farm_id}")
# def delete_farm(
#     farm_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_farm = db.query(models.Farm).get(farm_id)
#     if not db_farm:
#         raise HTTPException(status_code=404, detail="Farm not found")
#     db.delete(db_farm)
#     db.commit()
#     return {"detail": "Farm deleted"}


# # -------------------------------------------------------------------------
# # PLOTS CRUD
# # -------------------------------------------------------------------------
# @app.post("/plots/", response_model=schemas.Plot)
# def create_plot(
#     plot: schemas.PlotCreate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_plot = models.Plot(**plot.dict())
#     db.add(db_plot)
#     db.commit()
#     db.refresh(db_plot)
#     return db_plot


# @app.get("/plots/", response_model=List[schemas.Plot])
# def list_plots(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     return db.query(models.Plot).all()


# @app.get("/plots/{plot_id}", response_model=schemas.Plot)
# def get_plot(
#     plot_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     plot = db.query(models.Plot).get(plot_id)
#     if not plot:
#         raise HTTPException(status_code=404, detail="Plot not found")
#     return plot


# @app.put("/plots/{plot_id}", response_model=schemas.Plot)
# def update_plot(
#     plot_id: int,
#     plot: schemas.PlotUpdate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_plot = db.query(models.Plot).get(plot_id)
#     if not db_plot:
#         raise HTTPException(status_code=404, detail="Plot not found")
#     for k, v in plot.dict().items():
#         setattr(db_plot, k, v)
#     db.commit()
#     db.refresh(db_plot)
#     return db_plot


# @app.delete("/plots/{plot_id}")
# def delete_plot(
#     plot_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_plot = db.query(models.Plot).get(plot_id)
#     if not db_plot:
#         raise HTTPException(status_code=404, detail="Plot not found")
#     db.delete(db_plot)
#     db.commit()
#     return {"detail": "Plot deleted"}


# # -------------------------------------------------------------------------
# # SENSORS CRUD
# # -------------------------------------------------------------------------
# @app.post("/sensors/", response_model=schemas.Sensor)
# def create_sensor(
#     sensor: schemas.SensorCreate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_sensor = models.Sensor(**sensor.dict())
#     db.add(db_sensor)
#     db.commit()
#     db.refresh(db_sensor)
#     return db_sensor


# @app.get("/sensors/", response_model=List[schemas.Sensor])
# def list_sensors(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     return db.query(models.Sensor).all()


# @app.get("/sensors/{sensor_id}", response_model=schemas.Sensor)
# def get_sensor(
#     sensor_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     sensor = db.query(models.Sensor).get(sensor_id)
#     if not sensor:
#         raise HTTPException(status_code=404, detail="Sensor not found")
#     return sensor


# @app.put("/sensors/{sensor_id}", response_model=schemas.Sensor)
# def update_sensor(
#     sensor_id: int,
#     sensor: schemas.SensorUpdate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_sensor = db.query(models.Sensor).get(sensor_id)
#     if not db_sensor:
#         raise HTTPException(status_code=404, detail="Sensor not found")
#     for k, v in sensor.dict().items():
#         setattr(db_sensor, k, v)
#     db.commit()
#     db.refresh(db_sensor)
#     return db_sensor


# @app.delete("/sensors/{sensor_id}")
# def delete_sensor(
#     sensor_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_sensor = db.query(models.Sensor).get(sensor_id)
#     if not db_sensor:
#         raise HTTPException(status_code=404, detail="Sensor not found")
#     db.delete(db_sensor)
#     db.commit()
#     return {"detail": "Sensor deleted"}


# # -------------------------------------------------------------------------
# # READINGS CRUD
# # -------------------------------------------------------------------------
# @app.post("/readings/", response_model=schemas.Reading)
# def create_reading(
#     reading: schemas.ReadingCreate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_reading = models.Reading(**reading.dict())
#     db.add(db_reading)
#     db.commit()
#     db.refresh(db_reading)
#     return db_reading


# @app.get("/readings/", response_model=List[schemas.Reading])
# def list_readings(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     return db.query(models.Reading).all()


# @app.get("/readings/{reading_id}", response_model=schemas.Reading)
# def get_reading(
#     reading_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     reading = db.query(models.Reading).get(reading_id)
#     if not reading:
#         raise HTTPException(status_code=404, detail="Reading not found")
#     return reading


# @app.put("/readings/{reading_id}", response_model=schemas.Reading)
# def update_reading(
#     reading_id: int,
#     reading: schemas.ReadingUpdate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_reading = db.query(models.Reading).get(reading_id)
#     if not db_reading:
#         raise HTTPException(status_code=404, detail="Reading not found")
#     for k, v in reading.dict().items():
#         setattr(db_reading, k, v)
#     db.commit()
#     db.refresh(db_reading)
#     return db_reading


# @app.delete("/readings/{reading_id}")
# def delete_reading(
#     reading_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_reading = db.query(models.Reading).get(reading_id)
#     if not db_reading:
#         raise HTTPException(status_code=404, detail="Reading not found")
#     db.delete(db_reading)
#     db.commit()
#     return {"detail": "Reading deleted"}


# # -------------------------------------------------------------------------
# # ALERTS CRUD
# # -------------------------------------------------------------------------
# @app.post("/alerts/", response_model=schemas.Alert)
# def create_alert(
#     alert: schemas.AlertCreate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_alert = models.Alert(**alert.dict())
#     db.add(db_alert)
#     db.commit()
#     db.refresh(db_alert)
#     return db_alert


# @app.get("/alerts/", response_model=List[schemas.Alert])
# def list_alerts(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     return db.query(models.Alert).all()


# @app.get("/alerts/{alert_id}", response_model=schemas.Alert)
# def get_alert(
#     alert_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     alert = db.query(models.Alert).get(alert_id)
#     if not alert:
#         raise HTTPException(status_code=404, detail="Alert not found")
#     return alert


# @app.put("/alerts/{alert_id}", response_model=schemas.Alert)
# def update_alert(
#     alert_id: int,
#     alert: schemas.AlertUpdate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_alert = db.query(models.Alert).get(alert_id)
#     if not db_alert:
#         raise HTTPException(status_code=404, detail="Alert not found")
#     for k, v in alert.dict().items():
#         setattr(db_alert, k, v)
#     db.commit()
#     db.refresh(db_alert)
#     return db_alert


# @app.delete("/alerts/{alert_id}")
# def delete_alert(
#     alert_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     db_alert = db.query(models.Alert).get(alert_id)
#     if not db_alert:
#         raise HTTPException(status_code=404, detail="Alert not found")
#     db.delete(db_alert)
#     db.commit()
#     return {"detail": "Alert deleted"}


# # -------------------------------------------------------------------------
# # Analytics / Non-CRUD
# # -------------------------------------------------------------------------
# @app.get("/analytics/plots/{plot_id}/status", response_model=schemas.PlotStatus)
# def get_plot_status(
#     plot_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user),
# ):
#     plot = db.query(models.Plot).get(plot_id)
#     if not plot:
#         raise HTTPException(status_code=404, detail="Plot not found")

#     readings = (
#         db.query(models.Reading)
#         .join(models.Sensor)
#         .filter(models.Sensor.plot_id == plot_id)
#         .all()
#     )

#     if not readings:
#         summary = SensorReadingSummary(None, None, None)
#     else:
#         moistures = [r.moisture for r in readings if r.moisture is not None]
#         temps = [r.temperature for r in readings if r.temperature is not None]
#         hums = [r.humidity for r in readings if r.humidity is not None]

#         summary = SensorReadingSummary(
#             avg_moisture=mean(moistures) if moistures else None,
#             avg_temperature=mean(temps) if temps else None,
#             avg_humidity=mean(hums) if hums else None,
#         )

#     crop_name = plot.crop_type or "Generic Crop"
#     crop_profile = CropProfile(
#         name=crop_name,
#         ideal_moisture_min=20.0,
#         ideal_moisture_max=40.0,
#         ideal_temp_min=10.0,
#         ideal_temp_max=30.0,
#         crop_type="crop" if plot.crop_type else "forest",
#     )

#     irrigation_planner = IrrigationPlanner()
#     irrigation_rec = irrigation_planner.get_recommendation(crop_profile, summary)

#     fire_risk = None
#     if plot.tree_species:
#         analyser = ForestRiskAnalyser()
#         fire_risk = analyser.compute_fire_risk(plot.tree_species, summary)

#     return schemas.PlotStatus(
#         plot_id=plot.id,
#         avg_moisture=summary.avg_moisture,
#         avg_temperature=summary.avg_temperature,
#         avg_humidity=summary.avg_humidity,
#         irrigation_recommendation=irrigation_rec,
#         fire_risk=fire_risk,
#     )


# # -------------------------------------------------------------------------
# # AWS Lambda handler
# # -------------------------------------------------------------------------
# # This allows the same FastAPI app to run inside AWS Lambda via API Gateway.
# # Locally you still use: uvicorn app.main:app --reload
# handler = Mangum(app)
import hashlib
import secrets
from datetime import datetime, timedelta
from statistics import mean
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from mangum import Mangum  # for AWS Lambda support

from . import models, schemas
from .database import SessionLocal, engine, Base
from .smart_agri_forest import (
    CropProfile,
    SensorReadingSummary,
    IrrigationPlanner,
    ForestRiskAnalyser,
)

# Create tables (works locally and in container/EC2; on Lambda you usually
# run migrations beforehand or let first cold start create them)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Agriculture and Forestry API")

# -------------------------------------------------------------------------
# CORS
# -------------------------------------------------------------------------
# For local dev + S3 static website. You can restrict origins later if needed.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://smart-agro-frontend-x24336653.s3-website-us-east-1.amazonaws.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow all origins
    allow_credentials=False,      # must be False when using "*"
    allow_methods=["*"],          # allow all HTTP methods
    allow_headers=["*"],          # allow all headers
)

# -------------------------------------------------------------------------
# DB Dependency
# -------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------------------------------------------------
# Helpers for simple auth (no external libs)
# -------------------------------------------------------------------------
TOKEN_LIFETIME_HOURS = 24


def hash_password(password: str) -> str:
    """Simple SHA-256 hash (demo / assignment only)."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash


def create_session_token(user: models.User, db: Session) -> str:
    token = secrets.token_hex(32)
    now = datetime.utcnow()
    session = models.SessionToken(
        user_id=user.id,
        token=token,
        created_at=now,
        expires_at=now + timedelta(hours=TOKEN_LIFETIME_HOURS),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return token


def get_current_user(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
) -> models.User:
    """
    RELAXED DEMO AUTH FOR LAMBDA:

    1. Try normal token-based authentication using the SessionToken table.
    2. If that fails (missing/expired token or new /tmp DB in Lambda),
       fall back to a demo user so that the API still works for the UI.
    """

    # -------------------------------
    # 1) Try real token-based auth
    # -------------------------------
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        session = (
            db.query(models.SessionToken)
            .filter(models.SessionToken.token == token)
            .first()
        )
        if session and session.expires_at >= datetime.utcnow():
            user = db.query(models.User).get(session.user_id)
            if user and user.is_active:
                return user

    # -------------------------------
    # 2) Fallback to demo user
    # -------------------------------
    demo_email = "demo@smartagro.local"
    user = db.query(models.User).filter(models.User.email == demo_email).first()

    if not user:
        user = models.User(
            name="Demo User",
            email=demo_email,
            password_hash=hash_password("demo123"),  # not really used
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


# -------------------------------------------------------------------------
# Public endpoints
# -------------------------------------------------------------------------
@app.get("/")
def read_root():
    return {
        "message": "Smart Agriculture & Forestry API is running. Go to /docs for Swagger UI."
    }


# -------------------------------------------------------------------------
# Auth endpoints
# -------------------------------------------------------------------------
@app.post("/auth/register", response_model=schemas.UserPublic)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(models.User)
        .filter(models.User.email == user_data.email.lower())
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = models.User(
        name=user_data.name,
        email=user_data.email.lower(),
        password_hash=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(models.User.email == credentials.email.lower())
        .first()
    )
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_session_token(user, db)
    return schemas.Token(access_token=token)


@app.post("/auth/logout")
def logout(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
    current_user: models.User = Depends(get_current_user),
):
    # Remove the current token from DB (if present)
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        db.query(models.SessionToken).filter(
            models.SessionToken.token == token
        ).delete()
        db.commit()
    return {"detail": "Logged out"}


@app.get("/auth/me", response_model=schemas.UserPublic)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# -------------------------------------------------------------------------
# FARMS CRUD
# -------------------------------------------------------------------------
@app.post("/farms/", response_model=schemas.Farm)
def create_farm(
    farm: schemas.FarmCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_farm = models.Farm(**farm.dict())
    db.add(db_farm)
    db.commit()
    db.refresh(db_farm)
    return db_farm


@app.get("/farms/", response_model=List[schemas.Farm])
def list_farms(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Farm).all()


@app.get("/farms/{farm_id}", response_model=schemas.Farm)
def get_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    farm = db.query(models.Farm).get(farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm


@app.put("/farms/{farm_id}", response_model=schemas.Farm)
def update_farm(
    farm_id: int,
    farm: schemas.FarmUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_farm = db.query(models.Farm).get(farm_id)
    if not db_farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    for k, v in farm.dict().items():
        setattr(db_farm, k, v)
    db.commit()
    db.refresh(db_farm)
    return db_farm


@app.delete("/farms/{farm_id}")
def delete_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_farm = db.query(models.Farm).get(farm_id)
    if not db_farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    db.delete(db_farm)
    db.commit()
    return {"detail": "Farm deleted"}


# -------------------------------------------------------------------------
# PLOTS CRUD
# -------------------------------------------------------------------------
@app.post("/plots/", response_model=schemas.Plot)
def create_plot(
    plot: schemas.PlotCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_plot = models.Plot(**plot.dict())
    db.add(db_plot)
    db.commit()
    db.refresh(db_plot)
    return db_plot


@app.get("/plots/", response_model=List[schemas.Plot])
def list_plots(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Plot).all()


@app.get("/plots/{plot_id}", response_model=schemas.Plot)
def get_plot(
    plot_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    plot = db.query(models.Plot).get(plot_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
    return plot


@app.put("/plots/{plot_id}", response_model=schemas.Plot)
def update_plot(
    plot_id: int,
    plot: schemas.PlotUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_plot = db.query(models.Plot).get(plot_id)
    if not db_plot:
        raise HTTPException(status_code=404, detail="Plot not found")
    for k, v in plot.dict().items():
        setattr(db_plot, k, v)
    db.commit()
    db.refresh(db_plot)
    return db_plot


@app.delete("/plots/{plot_id}")
def delete_plot(
    plot_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_plot = db.query(models.Plot).get(plot_id)
    if not db_plot:
        raise HTTPException(status_code=404, detail="Plot not found")
    db.delete(db_plot)
    db.commit()
    return {"detail": "Plot deleted"}


# -------------------------------------------------------------------------
# SENSORS CRUD
# -------------------------------------------------------------------------
@app.post("/sensors/", response_model=schemas.Sensor)
def create_sensor(
    sensor: schemas.SensorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_sensor = models.Sensor(**sensor.dict())
    db.add(db_sensor)
    db.commit()
    db.refresh(db_sensor)
    return db_sensor


@app.get("/sensors/", response_model=List[schemas.Sensor])
def list_sensors(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Sensor).all()


@app.get("/sensors/{sensor_id}", response_model=schemas.Sensor)
def get_sensor(
    sensor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    sensor = db.query(models.Sensor).get(sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor


@app.put("/sensors/{sensor_id}", response_model=schemas.Sensor)
def update_sensor(
    sensor_id: int,
    sensor: schemas.SensorUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_sensor = db.query(models.Sensor).get(sensor_id)
    if not db_sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    for k, v in sensor.dict().items():
        setattr(db_sensor, k, v)
    db.commit()
    db.refresh(db_sensor)
    return db_sensor


@app.delete("/sensors/{sensor_id}")
def delete_sensor(
    sensor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_sensor = db.query(models.Sensor).get(sensor_id)
    if not db_sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    db.delete(db_sensor)
    db.commit()
    return {"detail": "Sensor deleted"}


# -------------------------------------------------------------------------
# READINGS CRUD
# -------------------------------------------------------------------------
@app.post("/readings/", response_model=schemas.Reading)
def create_reading(
    reading: schemas.ReadingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_reading = models.Reading(**reading.dict())
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    return db_reading


@app.get("/readings/", response_model=List[schemas.Reading])
def list_readings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Reading).all()


@app.get("/readings/{reading_id}", response_model=schemas.Reading)
def get_reading(
    reading_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    reading = db.query(models.Reading).get(reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")
    return reading


@app.put("/readings/{reading_id}", response_model=schemas.Reading)
def update_reading(
    reading_id: int,
    reading: schemas.ReadingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_reading = db.query(models.Reading).get(reading_id)
    if not db_reading:
        raise HTTPException(status_code=404, detail="Reading not found")
    for k, v in reading.dict().items():
        setattr(db_reading, k, v)
    db.commit()
    db.refresh(db_reading)
    return db_reading


@app.delete("/readings/{reading_id}")
def delete_reading(
    reading_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_reading = db.query(models.Reading).get(reading_id)
    if not db_reading:
        raise HTTPException(status_code=404, detail="Reading not found")
    db.delete(db_reading)
    db.commit()
    return {"detail": "Reading deleted"}


# -------------------------------------------------------------------------
# ALERTS CRUD
# -------------------------------------------------------------------------
@app.post("/alerts/", response_model=schemas.Alert)
def create_alert(
    alert: schemas.AlertCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_alert = models.Alert(**alert.dict())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


@app.get("/alerts/", response_model=List[schemas.Alert])
def list_alerts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Alert).all()


@app.get("/alerts/{alert_id}", response_model=schemas.Alert)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    alert = db.query(models.Alert).get(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@app.put("/alerts/{alert_id}", response_model=schemas.Alert)
def update_alert(
    alert_id: int,
    alert: schemas.AlertUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_alert = db.query(models.Alert).get(alert_id)
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    for k, v in alert.dict().items():
        setattr(db_alert, k, v)
    db.commit()
    db.refresh(db_alert)
    return db_alert


@app.delete("/alerts/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_alert = db.query(models.Alert).get(alert_id)
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(db_alert)
    db.commit()
    return {"detail": "Alert deleted"}


# -------------------------------------------------------------------------
# Analytics / Non-CRUD
# -------------------------------------------------------------------------
@app.get("/analytics/plots/{plot_id}/status", response_model=schemas.PlotStatus)
def get_plot_status(
    plot_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    plot = db.query(models.Plot).get(plot_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")

    readings = (
        db.query(models.Reading)
        .join(models.Sensor)
        .filter(models.Sensor.plot_id == plot_id)
        .all()
    )

    if not readings:
        summary = SensorReadingSummary(None, None, None)
    else:
        moistures = [r.moisture for r in readings if r.moisture is not None]
        temps = [r.temperature for r in readings if r.temperature is not None]
        hums = [r.humidity for r in readings if r.humidity is not None]

        summary = SensorReadingSummary(
            avg_moisture=mean(moistures) if moistures else None,
            avg_temperature=mean(temps) if temps else None,
            avg_humidity=mean(hums) if hums else None,
        )

    crop_name = plot.crop_type or "Generic Crop"
    crop_profile = CropProfile(
        name=crop_name,
        ideal_moisture_min=20.0,
        ideal_moisture_max=40.0,
        ideal_temp_min=10.0,
        ideal_temp_max=30.0,
        crop_type="crop" if plot.crop_type else "forest",
    )

    irrigation_planner = IrrigationPlanner()
    irrigation_rec = irrigation_planner.get_recommendation(crop_profile, summary)

    fire_risk = None
    if plot.tree_species:
        analyser = ForestRiskAnalyser()
        fire_risk = analyser.compute_fire_risk(plot.tree_species, summary)

    return schemas.PlotStatus(
        plot_id=plot.id,
        avg_moisture=summary.avg_moisture,
        avg_temperature=summary.avg_temperature,
        avg_humidity=summary.avg_humidity,
        irrigation_recommendation=irrigation_rec,
        fire_risk=fire_risk,
    )


# -------------------------------------------------------------------------
# AWS Lambda handler
# -------------------------------------------------------------------------
# This allows the same FastAPI app to run inside AWS Lambda via API Gateway.
# Locally you still use: uvicorn app.main:app --reload
handler = Mangum(app)
