from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.brands import router as brands_router
from app.api.identity import router as identity_router
from app.api.validation import router as validation_router
from app.api.optimization import router as optimization_router
from app.api.trends import router as trends_router
from app.api.memory import router as memory_router
from app.api.campaigns import router as campaigns_router
from app.api.dashboard import router as dashboard_router
from app.api.jobs import router as jobs_router
from app.api.settings import router as settings_router
from app.api.copilot import router as copilot_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(brands_router)
api_router.include_router(identity_router)
api_router.include_router(validation_router)
api_router.include_router(optimization_router)
api_router.include_router(trends_router)
api_router.include_router(memory_router)
api_router.include_router(campaigns_router)
api_router.include_router(dashboard_router)
api_router.include_router(jobs_router)
api_router.include_router(settings_router)
api_router.include_router(copilot_router)
