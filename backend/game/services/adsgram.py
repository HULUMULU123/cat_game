from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass
from typing import Any, Protocol, runtime_checkable
from urllib.parse import urljoin

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

AdsgramAssignmentPayload = dict[str, Any]


class AdsgramIntegrationError(RuntimeError):
    """Raised when communication with Adsgram fails."""


@runtime_checkable
class AdsgramClientProtocol(Protocol):
    def request_assignment(
        self,
        *,
        user_id: str | int,
        placement_id: str | None = None,
    ) -> AdsgramAssignmentPayload:
        ...

    def confirm_assignment(
        self,
        *,
        assignment_id: str,
        user_id: str | int | None = None,
    ) -> AdsgramAssignmentPayload:
        ...


@dataclass
class HttpAdsgramClient:
    base_url: str
    token: str
    app_id: str
    timeout: int = 10
    request_path: str = "/v1/tasks/request"
    complete_path: str = "/v1/tasks/complete"

    def __post_init__(self) -> None:
        self.base_url = self.base_url.rstrip("/")
        if not self.base_url:
            raise AdsgramIntegrationError("Adsgram base URL is not configured")
        if not self.token:
            raise AdsgramIntegrationError("Adsgram API token is not configured")
        if not self.app_id:
            raise AdsgramIntegrationError("Adsgram app ID is not configured")

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "X-App-Id": self.app_id,
        }

    def _post(self, path: str, payload: AdsgramAssignmentPayload) -> AdsgramAssignmentPayload:
        url = urljoin(f"{self.base_url}/", path.lstrip("/"))
        logger.debug("Adsgram POST %s payload=%s", url, payload)
        try:
            response = requests.post(url, json=payload, headers=self._headers(), timeout=self.timeout)
        except requests.RequestException as exc:  # pragma: no cover - network errors
            logger.exception("Adsgram request failed: %s", exc)
            raise AdsgramIntegrationError("Adsgram network request failed") from exc

        if response.status_code >= 400:
            logger.error(
                "Adsgram returned %s: %s", response.status_code, response.text
            )
            raise AdsgramIntegrationError(
                f"Adsgram error {response.status_code}: {response.text.strip()}"
            )

        try:
            data = response.json()
        except ValueError as exc:
            logger.exception("Adsgram response is not JSON")
            raise AdsgramIntegrationError("Adsgram returned invalid JSON") from exc

        logger.debug("Adsgram response %s", data)
        return data

    def request_assignment(
        self,
        *,
        user_id: str | int,
        placement_id: str | None = None,
    ) -> AdsgramAssignmentPayload:
        payload: AdsgramAssignmentPayload = {
            "app_id": self.app_id,
            "user_id": str(user_id),
        }
        if placement_id:
            payload["placement_id"] = placement_id
        return self._post(self.request_path, payload)

    def confirm_assignment(
        self,
        *,
        assignment_id: str,
        user_id: str | int | None = None,
    ) -> AdsgramAssignmentPayload:
        payload: AdsgramAssignmentPayload = {"assignment_id": assignment_id}
        if user_id is not None:
            payload["user_id"] = str(user_id)
        payload["app_id"] = self.app_id
        return self._post(self.complete_path, payload)


class DummyAdsgramClient:
    """Fallback client used in development when credentials are missing."""

    def request_assignment(
        self,
        *,
        user_id: str | int,
        placement_id: str | None = None,
    ) -> AdsgramAssignmentPayload:
        assignment_id = f"dummy-{uuid.uuid4()}"
        logger.info("Using dummy Adsgram assignment %s for user %s", assignment_id, user_id)
        return {
            "assignment_id": assignment_id,
            "placement_id": placement_id or settings.ADSGRAM_DEFAULT_PLACEMENT_ID,
            "reward": 0,
            "dummy": True,
        }

    def confirm_assignment(
        self,
        *,
        assignment_id: str,
        user_id: str | int | None = None,
    ) -> AdsgramAssignmentPayload:
        logger.info(
            "Confirming dummy Adsgram assignment %s for user %s", assignment_id, user_id
        )
        return {
            "assignment_id": assignment_id,
            "status": "completed",
            "dummy": True,
        }


def get_adsgram_client() -> AdsgramClientProtocol:
    base_url = getattr(settings, "ADSGRAM_API_BASE_URL", "")
    token = getattr(settings, "ADSGRAM_API_TOKEN", "")
    app_id = getattr(settings, "ADSGRAM_APP_ID", "")

    if base_url and token and app_id:
        return HttpAdsgramClient(
            base_url=base_url,
            token=token,
            app_id=app_id,
            timeout=getattr(settings, "ADSGRAM_TIMEOUT", 10),
            request_path=getattr(settings, "ADSGRAM_REQUEST_PATH", "/v1/tasks/request"),
            complete_path=getattr(settings, "ADSGRAM_COMPLETE_PATH", "/v1/tasks/complete"),
        )

    logger.warning("Adsgram credentials are missing; using dummy client")
    return DummyAdsgramClient()
