from __future__ import annotations

import logging
import threading
from typing import Optional

import requests
from django.conf import settings
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Failure

logger = logging.getLogger(__name__)


def _serialize_dt(value: Optional[timezone.datetime]) -> Optional[str]:
    if not value:
        return None
    if timezone.is_naive(value):
        value = timezone.make_aware(value, timezone.get_current_timezone())
    return value.isoformat()


def _post_failure_created(payload: dict[str, object]) -> None:
    url = getattr(settings, "FAILURE_CREATE_URL", "")
    if not url:
        logger.info("[failures] create hook skipped: FAILURE_CREATE_URL not set")
        return

    try:
        resp = requests.post(
            url,
            json=payload,
            timeout=getattr(settings, "FAILURE_CREATE_TIMEOUT", 10),
        )
        resp.raise_for_status()
    except Exception as exc:  # pragma: no cover - network failure path
        logger.error("[failures] create hook failed", exc_info=exc)


def _post_failure_deleted(payload: dict[str, object]) -> None:
    url = getattr(settings, "FAILURE_DELETE_URL", "")
    if not url:
        logger.info("[failures] delete hook skipped: FAILURE_DELETE_URL not set")
        return

    try:
        resp = requests.post(
            url,
            json=payload,
            timeout=getattr(settings, "FAILURE_DELETE_TIMEOUT", 10),
        )
        resp.raise_for_status()
    except Exception as exc:  # pragma: no cover - network failure path
        logger.error("[failures] delete hook failed", exc_info=exc)


@receiver(post_save, sender=Failure)
def notify_failure_created(sender, instance: Failure, created: bool, **kwargs) -> None:
    if not created:
        return

    payload = {
        "secret": getattr(settings, "FAILURE_CREATE_SECRET", ""),
        "name": instance.name,
        "reward": int(instance.reward or 0),
        "start_time": _serialize_dt(instance.start_time),
        "end_time": _serialize_dt(instance.end_time),
    }

    worker = threading.Thread(target=_post_failure_created, args=(payload,))
    worker.daemon = True
    worker.start()


@receiver(post_delete, sender=Failure)
def notify_failure_deleted(sender, instance: Failure, **kwargs) -> None:
    payload = {
        "secret": getattr(settings, "FAILURE_DELETE_SECRET", ""),
        "name": instance.name,
    }

    worker = threading.Thread(target=_post_failure_deleted, args=(payload,))
    worker.daemon = True
    worker.start()
