from fastapi import APIRouter
from app.api.endpoints import contracts, auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
# api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
# api_router.include_router(risk.router, prefix="/risk-library", tags=["risk-library"])
