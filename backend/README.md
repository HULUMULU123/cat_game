# Cat Game Backend

Django REST backend that powers the Cat Game frontend. It provides Telegram-based authentication, user balances, tasks, quiz questions, leaderboard data and gift information.

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Available API endpoints

- `POST /api/auth/telegram/` — регистрация/вход по данным из Telegram Web App.
- `GET /api/auth/me/` — профиль текущего пользователя.
- `GET /api/tasks/` — задания для инфо-узлов.
- `GET /api/gift/` — активный подарок на главной странице.
- `GET /api/quiz/` — текущий вопрос викторины.
- `GET /api/leaderboard/` — турнирная таблица и позиция пользователя.
- `GET /api/simulation/` — конфигурация симуляции.
- `POST /api/simulation/start/` — запуск симуляции, списывает монеты при успехе.

Все эндпоинты, кроме регистрации, требуют JWT-токен, полученный от `simple_jwt`.
