import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from contextlib import asynccontextmanager
from sqlalchemy import text

# Load environment variables
load_dotenv()

from app.api.api import api_router
from app.core.database import engine, Base, SessionLocal
from app.models import user, contract, activity  # Import models to register them
from app.core import security

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Warmup tasks
    logging.info("--- Startup: Warming up resources ---")
    
    # 1. Create tables (if not exist)
    try:
        logging.info("Ensuring database tables exist...")
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logging.info(f"Error creating tables: {e}")

    # 2. Warmup Database Connection
    try:
        logging.info("Warming up database connection...")
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            logging.info("Database connection established.")
        except Exception as e:
            logging.info(f"Database warmup failed: {e}")
        finally:
            db.close()
    except Exception as e:
        logging.info(f"Database session creation failed: {e}")

    # 3. Warmup Password Hashing (bcrypt)
    try:
        logging.info("Warming up security module (bcrypt)...")
        # Perform a dummy hash and verify to load libraries
        h = security.get_password_hash("warmup")
        security.verify_password("warmup", h)
        logging.info("Security module ready.")
    except Exception as e:
        logging.info(f"Security warmup failed: {e}")

    logging.info("--- Startup: Complete ---")
    
    yield
    
    # Shutdown logic (if any)
    logging.info("--- Shutdown ---")

app = FastAPI(
    title="NexDoc AI API",
    description="Backend API for NexDoc AI - Legal Contract Review Platform",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",
    "*" # For development convenience
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to NexDoc AI API", "status": "running"}

