from __future__ import annotations

from fastapi import FastAPI

from app.api.router import api_router
from app.core.logging import configure_logging
from app.core.otel import configure_tracing
from app.db.session import engine


def create_app() -> FastAPI:
    configure_logging()
    app = FastAPI(title="SolveBridge")
    app.include_router(api_router, prefix="/api")

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    configure_tracing(app, engine)
    return app


app = create_app()

