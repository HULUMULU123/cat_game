# Cat Game Backend

Django REST API для фронтенда Cat Game. Обрабатывает авторизацию через Telegram Web App, балансы, задания, викторины, лидерборды и промокоды.

## Быстрый старт

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Админ-панель доступна по `http://localhost:8000/admin/`.

## Переменные окружения

### Django

- `DJANGO_SECRET_KEY` — секретный ключ Django.
- `DJANGO_DEBUG` — `1` или `0` для включения/выключения debug-режима.

### Adsgram

- `ADSGRAM_API_BASE_URL`
- `ADSGRAM_API_TOKEN`
- `ADSGRAM_APP_ID`
- `ADSGRAM_DEFAULT_PLACEMENT_ID`
- `ADSGRAM_REQUEST_PATH` (по умолчанию `/v1/tasks/request`)
- `ADSGRAM_COMPLETE_PATH` (по умолчанию `/v1/tasks/complete`)
- `ADSGRAM_TIMEOUT` (по умолчанию `10`)

### Проверка подписки Telegram

- `TELEGRAM_CHECK_URL` (по умолчанию `https://stakanonline.ru/check-sub`)
- `TELEGRAM_CHECK_SECRET`
- `TELEGRAM_CHECK_DELAY_SECONDS` (по умолчанию `30`)

## Авторизация

Используется JWT через `rest_framework_simplejwt`. Все эндпоинты, кроме входа/регистрации, требуют `Authorization: Bearer <token>`.

## Доступные API эндпоинты

- `POST /api/auth/telegram/` — регистрация/вход по данным Telegram Web App.
- `GET /api/auth/me/` — профиль текущего пользователя.
- `GET /api/tasks/` — задания для инфо-узлов.
- `GET /api/gift/` — активный подарок на главной странице.
- `GET /api/quiz/` — текущий вопрос викторины.
- `GET /api/leaderboard/` — турнирная таблица и позиция пользователя.
- `GET /api/simulation/` — конфигурация симуляции.
- `POST /api/simulation/start/` — запуск симуляции, списывает монеты при успехе.

