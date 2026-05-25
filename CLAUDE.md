# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

SolveBridge is an **AI-Native Talent & Knowledge OS** — a platform that tracks work results as **Digital Artifacts**, builds a **Capability Graph** from evidence, validates mentorship via **Proof of Mentorship (PoM)**, and computes project quality via **360° scoring**.

The repo contains:
- `app/` — FastAPI async backend
- `frontend/` — React/TypeScript SPA (Vite + Tailwind + Zustand)
- `alembic/` — PostgreSQL migration history

## Backend commands

```bash
# Start database (pgvector/pg16, exposed on port 5433)
docker compose up -d

# Install Python dependencies
python -m pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start API (hot reload)
uvicorn app.main:app --reload

# Run all tests
pytest

# Run a single test
pytest tests/test_health.py::test_health
```

## Frontend commands

```bash
cd frontend

# Install dependencies
npm install

# Dev server
npm run dev

# Type check
npm run check

# Lint
npm run lint

# Production build
npm run build
```

## Architecture

### Backend layers

```
app/main.py          → creates FastAPI app, mounts /api router, /health
app/api/router.py    → aggregates all route modules under /api
app/api/routes/      → one file per domain (users, projects, artifacts, …)
app/api/deps.py      → SessionDep = Annotated[AsyncSession, Depends(get_session)]
app/models/          → SQLAlchemy 2.0 ORM models
app/schemas/         → Pydantic v2 schemas (request/response)
app/services/        → pure business logic (scoring.py, hashing.py)
app/core/            → config (pydantic-settings), JSON logging, OpenTelemetry
app/db/session.py    → async engine + sessionmaker
alembic/versions/    → migration history
```

All models compose `UUIDPrimaryKeyMixin` and `TimestampMixin` from `app/models/common.py`. Route handlers receive the async session via `SessionDep`.

**Exceptions to the mixin pattern:**
- `ComplianceProfile` uses `user_id` as its primary key (no `UUIDPrimaryKeyMixin`).
- `TimestampMixin` only adds `created_at`. Models that need `updated_at` (e.g., `Task`, `ComplianceProfile`) define it manually.

**JSONB column naming:** ORM models alias Python attributes to DB columns — e.g., `metadata_json` in Python maps to the `metadata` column. When writing raw SQL or migrations, use the DB column name.

### Route handler pattern

Every route file follows the same shape: a `_to_out()` mapper converts an ORM row to the response schema, and queries use `select()` + `scalar_one_or_none()`. Example:

```python
@router.get("/{id}", response_model=FooOut)
async def get_foo(id: uuid.UUID, session: SessionDep):
    row = (await session.execute(select(Foo).where(Foo.id == id))).scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Foo not found")
    return _to_out(row)
```

### Domain concepts

| Concept | Tables / Models |
|---|---|
| Digital Artifacts | `artifacts`, `artifact_types` — work evidence with `content_hash`, `reusability_index`, `mentorship_seal` |
| Capability Graph | `capability_graph` — evidence-backed skills: `(entity_type, entity_id, skill_id)` requires `evidence_artifact_id` |
| Proof of Mentorship | `mentor_activity_logs` — `action_type` / `duration_minutes` / `complexity_weight` |
| 360° Scoring | Computed in `app/services/scoring.py` with weights mentor 40 / client 30 / peer 20 / artifact 10 |
| Anti-disintermediation | `anti_disintermediation_rules` — requires `required_task_count` (default 3) platform tasks before direct hiring |
| Compliance | `compliance_profiles` — NPD status + PDN consent (Russian 152-FZ); keyed by `user_id` |
| BMC Marketplace | `tasks`, `task_applications`, `task_assignments`, `disputes` — task lifecycle with apply/assign/dispute flow |
| Student Verification | `student_verifications` — pending/approved/rejected flow; university reviews via `PATCH /verifications/{id}/review` |

### Frontend architecture

```
frontend/src/
  api/client.ts       → all API calls via apiFetch<T>(); types mirror backend schemas
  stores/authStore.ts → Zustand store; persists AuthUser to localStorage under 'tkos:user'
  components/auth/    → RequireAuth wraps protected routes
  components/layout/  → AppShell, Header, Sidebar, Page
  components/ui/      → Button, Card, Input, Badge, Alert, Textarea
  pages/              → one file per route
```

The frontend has **no backend auth**. Authentication is entirely client-side (localStorage). The backend exposes no login endpoint and performs no token validation.

User roles: `client | student | executor | mentor | admin | partner | company` (with Russian display labels via `labelForRole()`).

The frontend dev server proxies `/api` and `/health` to the backend (`BACKEND_URL` env var, defaults to `http://localhost:8000`). See `vite.config.ts`.

## Configuration

Copy `.env.example` to `.env`. Key variables:

| Variable | Default |
|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/solvebridge` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | (empty — disables tracing) |

The Docker Compose database runs on **port 5433** (host) → 5432 (container). Update `DATABASE_URL` to use port 5433 when connecting from host.

## Key patterns

- **New route**: create `app/api/routes/<domain>.py`, add router to `app/api/router.py`.
- **New model**: extend `Base` + `UUIDPrimaryKeyMixin` + `TimestampMixin`, create an Alembic migration.
- **Scoring changes**: edit `app/services/scoring.py` (`ScoreWeights` dataclass + `compute_success_rate`).
- **Tests** use `pytest-asyncio` with `asyncio_mode = auto`; test the ASGI app in-process via `httpx.AsyncClient`.
- **Smoke tests**: `scripts/smoke_bmc.py` exercises the BMC marketplace task lifecycle end-to-end against a running server.
