from fastapi import APIRouter
from app.api.endpoints import contracts, auth, risks, team, archive, overview

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
api_router.include_router(risks.router, prefix="/risks", tags=["risks"])
api_router.include_router(team.router, prefix="/team", tags=["team"])
api_router.include_router(archive.router, prefix="/archive", tags=["archive"])
api_router.include_router(overview.router, prefix="/overview", tags=["overview"])
# api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
# api_router.include_router(risk.router, prefix="/risk-library", tags=["risk-library"])
