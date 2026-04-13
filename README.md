# SolveBridge

## Quickstart

1) Start Postgres with pgvector

```bash
docker compose up -d
```

2) Create `.env` from `.env.example`

3) Install dependencies

```bash
python -m pip install -r requirements.txt
```

4) Run migrations

```bash
alembic upgrade head
```

5) Run API

```bash
uvicorn app.main:app --reload
```
