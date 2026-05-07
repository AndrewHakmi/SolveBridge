# SolveBridge

## Quickstart

1) Create `.env` from `.env.example`

2) Install dependencies

```bash
python -m pip install -r requirements.txt
```

3) Run migrations

```bash
alembic upgrade head
```

4) Run API

```bash
uvicorn app.main:app --reload
```

