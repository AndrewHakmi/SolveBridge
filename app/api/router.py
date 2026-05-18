from __future__ import annotations

from fastapi import APIRouter

from app.api.routes.artifacts import router as artifacts_router
from app.api.routes.capability import router as capability_router
from app.api.routes.compliance import router as compliance_router
from app.api.routes.integrations_git import router as integrations_git_router
from app.api.routes.mentor_activity import router as mentor_activity_router
from app.api.routes.organizations import router as organizations_router
from app.api.routes.payments import router as payments_router
from app.api.routes.plans import router as plans_router
from app.api.routes.projects import router as projects_router
from app.api.routes.ratings import router as ratings_router
from app.api.routes.scoring import router as scoring_router
from app.api.routes.subscriptions import router as subscriptions_router
from app.api.routes.tasks import router as tasks_router
from app.api.routes.users import router as users_router
from app.api.routes.teams import router as teams_router
from app.api.routes.verifications import router as verifications_router


api_router = APIRouter()

api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(teams_router, prefix="/teams", tags=["teams"])
api_router.include_router(projects_router, prefix="/projects", tags=["projects"])
api_router.include_router(artifacts_router, prefix="/artifacts", tags=["artifacts"])
api_router.include_router(capability_router, prefix="/capability", tags=["capability"])
api_router.include_router(mentor_activity_router, prefix="/mentor-activity", tags=["mentor-activity"])
api_router.include_router(scoring_router, prefix="/scoring", tags=["scoring"])
api_router.include_router(integrations_git_router, prefix="/integrations/git", tags=["integrations"])
api_router.include_router(compliance_router, prefix="/compliance", tags=["compliance"])
api_router.include_router(plans_router, prefix="/plans", tags=["plans"])
api_router.include_router(organizations_router, prefix="/organizations", tags=["organizations"])
api_router.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
api_router.include_router(payments_router, prefix="/payments", tags=["payments"])
api_router.include_router(verifications_router, prefix="/verifications", tags=["verifications"])
api_router.include_router(subscriptions_router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(ratings_router, prefix="/ratings", tags=["ratings"])

