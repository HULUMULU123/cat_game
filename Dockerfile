FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/cat_game/backend

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ВАЖНО: bind 0.0.0.0, иначе порт не пробросится наружу контейнера
CMD ["python", "-m", "gunicorn", "--chdir", "/var/www/cat_game/backend", "cat_game_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2", "--log-level", "info"]
