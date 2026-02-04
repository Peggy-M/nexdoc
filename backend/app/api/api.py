from fastapi import APIRouter
from app.api.endpoints import contracts

api_router = APIRouter()

api_router.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
# api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
# api_router.include_router(risk.router, prefix="/risk-library", tags=["risk-library"])
