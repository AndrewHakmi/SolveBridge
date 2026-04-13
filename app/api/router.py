from __future__ import annotations

from fastapi import APIRouter

from app.api.routes.artifacts import router as artifacts_router
from app.api.routes.capability import router as capability_router
from app.api.routes.integrations_git import router as integrations_git_router
from app.api.routes.mentor_activity import router as mentor_activity_router
from app.api.routes.projects import router as projects_router
from app.api.routes.scoring import router as scoring_router


api_router = APIRouter()

api_router.include_router(projects_router, prefix="/projects", tags=["projects"])
api_router.include_router(artifacts_router, prefix="/artifacts", tags=["artifacts"])
api_router.include_router(capability_router, prefix="/capability", tags=["capability"])
api_router.include_router(mentor_activity_router, prefix="/mentor-activity", tags=["mentor-activity"])
api_router.include_router(scoring_router, prefix="/scoring", tags=["scoring"])
api_router.include_router(integrations_git_router, prefix="/integrations/git", tags=["integrations"])

