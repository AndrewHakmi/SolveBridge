# Резюме проекта (SolveBridge)

## Что это

`SolveBridge` — фундаментальный backend-скелет под концепцию **AI-Native Talent & Knowledge OS**: платформа фиксирует результаты работы в виде **Digital Artifacts**, строит **Capability Graph** на основе доказательств (evidence), валидирует наставничество через **Proof of Mentorship (PoM)** и считает качество/успешность проектов через **360° scoring**.

Цель ядра: система не просто мэтчит людей, а аккумулирует технологические знания и повышает предсказуемость успеха команд за счет переиспользуемых артефактов.

## Что реализовано в текущей версии

### Backend

- FastAPI приложение: `app.main:app`
- Конфигурация через `.env` (есть `.env.example`)
- JSON-логирование
- Подключение OpenTelemetry (активируется при заданном `OTEL_EXPORTER_OTLP_ENDPOINT`)

### База данных и миграции

- Alembic миграция `initial_schema`
- PostgreSQL с расширением `pgvector` (`CREATE EXTENSION IF NOT EXISTS vector`)
- Таблицы:
  - `artifacts` + `artifact_types` (тип артефакта, `content_hash`, `reusability_index`, `mentorship_seal`, `metadata` как JSONB)
  - `capability_graph` (evidence-based навыки: `entity_type`, `entity_id`, `skill_id`, `proficiency_level`, `evidence_artifact_id`)
  - `mentor_activity_logs` (PoM сигналы: `action_type`, `duration_minutes`, `complexity_weight`)
  - базовые: `projects`, `teams`, `users`
  - задел под вектора: `project_vectors` (поле `embedding_v` Vector(1536))

### API (MVP)

- `GET /health`
- Проекты:
  - `POST /api/projects`
  - `GET /api/projects/{project_id}`
- Артефакты:
  - `POST /api/artifacts`
  - `GET /api/artifacts/{artifact_id}`
- Capability Graph:
  - `PUT /api/capability` (upsert ребра навыка по `(entity_type, entity_id, skill)`)
- PoM / активность ментора:
  - `POST /api/mentor-activity`
  - `GET /api/mentor-activity/mentor/{mentor_id}`
- Scoring:
  - `POST /api/scoring/projects` (пересчет `success_rate` из `mentor_score`, `client_score`, `peer_score`, `artifact_score`)
- Интеграции:
  - `POST /api/integrations/git/webhook` (создает `code`-артефакт на основе `repo_url` + `commit_sha`)

### Тесты

- Базовый тест `GET /health` проходит (`pytest`).

## Как запустить локально

1) Поднять Postgres с pgvector

```bash
docker compose up -d
```

2) Создать `.env` из `.env.example`

3) Установить зависимости

```bash
python -m pip install -r requirements.txt
```

4) Применить миграции

```bash
alembic upgrade head
```

5) Запустить API

```bash
uvicorn app.main:app --reload
```

## Ключевые идеи домена (в терминах реализации)

- **Проект “закрыт” только когда есть Артефакт**: MVP пока фиксирует артефакты и статусы, а автоматизацию “закрытия” можно развить следующей итерацией.
- **Capability Graph обновляется только из evidence**: `capability_graph.evidence_artifact_id` обязательный.
- **PoM фиксируется логами действий ментора**: `mentor_activity_logs` хранит базовые события (review/meeting/approval).
- **Scoring отделен как вычисление**: `compute_success_rate()` считает итог с весами 40/30/20/10 на доступных данных.

## Ближайшие расширения (логичное продолжение)

- Пороговые правила для `mentorship_seal` (зависимость от PoM-целостности и Artifact Score)
- Автоматический пересчет `artifact_score` (coverage/docs/quality) из CI артефактов / webhook payload
- Контракты событий (event bus) и state machine статусов проекта/артефакта
- Реальные эмбеддинги (генерация + хранение `pgvector` + поиск) и Match Probability Score

