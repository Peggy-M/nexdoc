from fastapi import APIRouter
from app.api.endpoints import contracts, auth, risks, team, archive, overview, knowledge, demo

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
api_router.include_router(demo.router, prefix="/demo", tags=["demo"])
api_router.include_router(risks.router, prefix="/risks", tags=["risks"])
api_router.include_router(team.router, prefix="/team", tags=["team"])
api_router.include_router(archive.router, prefix="/archive", tags=["archive"])
api_router.include_router(overview.router, prefix="/overview", tags=["overview"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])
