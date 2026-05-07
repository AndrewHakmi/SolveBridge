# Talent & Knowledge OS — Page Design (desktop-first)

## Global Styles (Design Tokens)
- Layout: 12-колоночная сетка (max-width 1200–1320px), контент-колонка + опциональный правый aside.
- Spacing: 8px base (8/16/24/32/48).
- Colors: background #0B1220, surface #111A2E, border #1E2A44, text #EAF0FF, muted #9FB0D0, accent #6C8CFF, success #3DDC97, danger #FF5A6A.
- Typography: 14/16/20/24/32; заголовки semibold, основной текст regular.
- Buttons: primary (accent), secondary (surface+border), ghost; hover — повышение контраста, focus — outline 2px accent.
- Links: accent, underline on hover.
- Motion: 120–180ms ease-out, скролл-шейдинг хедера, skeleton на загрузках.

## App Shell (общая структура)
- Header (sticky): логотип, глобальный поиск, быстрые действия ("Создать материал"), аватар.
- Left Sidebar: Workspace / База знаний / Таланты / Обучение / (Админ).
- Main: контент страницы.
- Right Aside (опционально): подсказки, контекстные фильтры, “Недавно”.

---

## Page: Вход (/login)
- Meta: title "Вход — Talent & Knowledge OS"; description "Доступ к корпоративным знаниям и развитию".
- Layout: центрированный card (480–520px), фон с мягким градиентом.
- Sections:
  - Logo + короткий value copy.
  - Auth form: email/SSO, пароль (если применимо), CTA "Войти".
  - Secondary: "Забыли доступ?".
- States: loading, error banner, disabled CTA.

## Page: Главная (Workspace) (/)
- Meta: title "Workspace".
- Layout: 2 колонки (main 8/12, aside 4/12).
- Main sections:
  - "Быстрые действия": создать материал, обновить навыки, открыть обучение.
  - "Моё": tabs (Недавнее / Закреплённое / Черновики).
  - "Рекомендации": блоки-карточки (материалы/обучения) с причиной (тег/навык).
- Aside:
  - "Активные обучения" (progress bar).
  - "Мои навыки" (top-5 + ссылка "Открыть матрицу").

## Page: База знаний (/knowledge)
- Meta: title "База знаний"; OG: title + краткое описание.
- Layout: list + фильтры.
- Components:
  - Search bar (общий поиск синхронизирован) + фильтры chips (категории/теги/автор).
  - List: карточки материалов (title, summary 2 строки, теги, author, updated_at).
  - Empty state: CTA "Создать первый материал".

## Page: Карточка материала (/knowledge/:id)
- Meta: title = название материала; OG image (генерируемый cover, опционально).
- Layout: main + aside.
- Main:
  - Title + метаданные (автор, обновлено, теги).
  - Content renderer (markdown/rich-text), оглавление (если длинный текст).
- Aside:
  - "Связанные материалы" и "Связанные навыки/обучения" (link list).
- Actions: редактировать (если автор/роль), копировать ссылку.

## Page: Таланты и навыки (/talent)
- Meta: title "Таланты и навыки".
- Layout: таблица/карточная сетка + фильтры.
- Components:
  - Filters: команда, роль, навыки (multi-select), уровень.
  - People list: avatar, имя, должность, топ-навыки.
  - Quick view drawer: краткий профиль + CTA "Открыть профиль".

## Page: Профиль сотрудника (/talent/:id) и Мой профиль (/profile)
- Meta: title "Профиль — {Имя}".
- Layout: header profile + tabs.
- Sections:
  - Profile header: avatar, имя, должность, команда, контакты (по настройкам видимости).
  - Tabs: "Навыки" (матрица/список), "Материалы", "Обучение".
  - Edit mode (только для себя): обновить поля профиля, уровень навыков.

## Page: Обучение (/learning, /learning/:id)
- Meta: title "Обучение".
- Layout: каталог + карточка.
- Components:
  - Каталог: фильтры (тема/уровень/теги), карточки.
  - Карточка: описание, длительность/провайдер (если есть), CTA "Записаться", статус/прогресс.

## Page: Админ-панель (/admin)
- Meta: title "Админ".
- Layout: left sub-nav (Пользователи / Таксономия / Контент) + рабочая область.
- Components:
  - Users: таблица, приглашение, роль, deactivate.
  - Taxonomy: список навыков/категорий, merge/archive.
  - Content: таблица материалов, статусы, действия скрыть/восстановить.

## Responsive behavior (кратко)
- <1024px: sidebar сворачивается в drawer; aside уходит вниз; таблицы → карточки.
- Поиск всегда доступен в header; первичные CTA остаются видимыми.