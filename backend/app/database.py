import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Detect if running in AWS Lambda
IN_LAMBDA = os.environ.get("AWS_LAMBDA_FUNCTION_NAME") is not None

if IN_LAMBDA:
    # Lambda: /tmp is the only writable folder
    db_path = "/tmp/smart_agro.db"
else:
    # Local / EC2 dev: keep DB in project folder
    db_path = "./smart_agro.db"

SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
