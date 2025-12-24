from __future__ import annotations

import os
from datetime import timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "django-insecure-cat-game")

DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"

ALLOWED_HOSTS: list[str] = [
    "*",
]

INSTALLED_APPS = [
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "accounts",
    "game",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "cat_game_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]
CSRF_TRUSTED_ORIGINS = [
    "https://stakanonline.ru",
    "https://www.stakanonline.ru",
]

WSGI_APPLICATION = "cat_game_backend.wsgi.application"
ASGI_APPLICATION = "cat_game_backend.asgi.application"

# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.sqlite3",
#         "NAME": BASE_DIR / "db.sqlite3",
#     }
# }




DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "app"),
        "USER": os.getenv("POSTGRES_USER", "app"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", ""),
        "HOST": os.getenv("POSTGRES_HOST", "db"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
        "CONN_MAX_AGE": int(os.getenv("DB_CONN_MAX_AGE", "60")),
    }
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "ru-ru"

TIME_ZONE = "Europe/Moscow"

USE_I18N = True

USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

BASE_DIR = Path(__file__).resolve().parent.parent

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

CORS_ALLOW_ALL_ORIGINS = True

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {"accounts": {"level": "DEBUG"}},
}

JAZZMIN_SETTINGS = {
    "site_title": "STAKAN Admin",
    "site_header": "STAKAN",
    "site_brand": "STAKAN",
    "welcome_sign": "Добро пожаловать в панель управления STAKAN",
    "copyright": "STAKAN",
    "icons": {
        "game.UserProfile": "fas fa-users",
        "game.Task": "fas fa-tasks",
        "game.TaskCompletion": "fas fa-check-double",
        "game.AdsgramAssignment": "fas fa-ad",
        "game.AdsgramBlock": "fas fa-th-large",
        "game.SimulationConfig": "fas fa-sliders-h",
        "game.SimulationRewardClaim": "fas fa-gift",
        "game.AdvertisementButton": "fas fa-bullhorn",
        "game.AdvertisementButtonRewardClaim": "fas fa-coins",
        "game.FrontendConfig": "fas fa-tv",
        "game.RuleCategory": "fas fa-book",
        "game.DailyReward": "fas fa-calendar-check",
        "game.DailyRewardClaim": "fas fa-hand-holding-usd",
        "game.Failure": "fas fa-exclamation-triangle",
        "game.FailureBonusPurchase": "fas fa-shopping-cart",
        "game.QuizQuestion": "fas fa-question-circle",
        "game.ScoreEntry": "fas fa-chart-line",
        "game.QuizAttempt": "fas fa-clipboard-list",
        "game.PromoCode": "fas fa-ticket-alt",
        "game.PromoCodeRedemption": "fas fa-check-circle",
        "game.ReferralProgramConfig": "fas fa-share-alt",
    },
}

ADSGRAM_API_BASE_URL = os.environ.get("ADSGRAM_API_BASE_URL", "")
ADSGRAM_API_TOKEN = os.environ.get("ADSGRAM_API_TOKEN", "")
ADSGRAM_APP_ID = os.environ.get("ADSGRAM_APP_ID", "")
ADSGRAM_DEFAULT_PLACEMENT_ID = os.environ.get("ADSGRAM_DEFAULT_PLACEMENT_ID", "")
ADSGRAM_REQUEST_PATH = os.environ.get("ADSGRAM_REQUEST_PATH", "/v1/tasks/request")
ADSGRAM_COMPLETE_PATH = os.environ.get("ADSGRAM_COMPLETE_PATH", "/v1/tasks/complete")
ADSGRAM_TIMEOUT = int(os.environ.get("ADSGRAM_TIMEOUT", "10"))

TELEGRAM_CHECK_URL = os.environ.get("TELEGRAM_CHECK_URL", "https://stakanonline.ru/check-sub")
TELEGRAM_CHECK_SECRET = os.environ.get("TELEGRAM_CHECK_SECRET", "super_secret_key")
TELEGRAM_CHECK_DELAY_SECONDS = int(os.environ.get("TELEGRAM_CHECK_DELAY_SECONDS", "30"))

FAILURE_CREATE_URL = os.environ.get("FAILURE_CREATE_URL", "https://stakanonline.ru/outages")
FAILURE_CREATE_SECRET = os.environ.get("FAILURE_CREATE_SECRET", TELEGRAM_CHECK_SECRET)
FAILURE_CREATE_TIMEOUT = int(os.environ.get("FAILURE_CREATE_TIMEOUT", "10"))

LEGAL_CHECK_URL = os.environ.get("LEGAL_CHECK_URL", "https://stakanonline.ru/check-legal")
LEGAL_CHECK_SECRET = os.environ.get("LEGAL_CHECK_SECRET", TELEGRAM_CHECK_SECRET)
LEGAL_CHECK_TIMEOUT = int(os.environ.get("LEGAL_CHECK_TIMEOUT", "10"))
