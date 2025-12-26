from __future__ import annotations

import logging

import requests
from django.conf import settings
from django.db import transaction
from django.db.models import F
from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from cat_game_backend.permissions import IsNotBanned
from .serializers import (
    PromoCodeApplySerializer,
    ReferralCodeApplySerializer,
    TelegramAuthSerializer,
    UserProfileSerializer,
)
from game.models import (
    PromoCode,
    PromoCodeRedemption,
    ReferralProgramConfig,
    UserProfile,
)

logger = logging.getLogger(__name__)


def _legal_check_accepted(payload: dict) -> bool:
    return bool(
        payload.get("accepted")
        or payload.get("read")
        or payload.get("legal_accepted")
        or payload.get("is_read")
    )


def _run_legal_check(profile: UserProfile) -> bool:
    if profile.legal_accepted:
        return True

    telegram_id = int(profile.telegram_id or 0)
    if not telegram_id:
        logger.warning("[legal] check skipped: missing telegram_id", extra={"profile_id": profile.id})
        return False

    url = getattr(settings, "LEGAL_CHECK_URL", "")
    if not url:
        logger.warning("[legal] check skipped: LEGAL_CHECK_URL not set", extra={"profile_id": profile.id})
        return False

    try:
        resp = requests.post(
            url,
            json={
                "secret": settings.LEGAL_CHECK_SECRET,
                "user_id": telegram_id,
            },
            timeout=getattr(settings, "LEGAL_CHECK_TIMEOUT", 10),
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:  # pragma: no cover - network failure path
        logger.error("[legal] check failed", exc_info=exc)
        return False

    if not _legal_check_accepted(data or {}):
        return False

    profile.legal_accepted = True
    profile.save(update_fields=["legal_accepted", "updated_at"])
    return True


class TelegramAuthView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request: Request) -> Response:
        serializer = TelegramAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, profile = serializer.create_or_update_user()
        if profile.is_banned:
            return Response(
                {"detail": "Доступ запрещен. Пользователь заблокирован."},
                status=status.HTTP_403_FORBIDDEN,
            )
        refresh = RefreshToken.for_user(user)

        profile_data = UserProfileSerializer(profile).data
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": profile_data,
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsNotBanned)

    def get(self, request: Request) -> Response:
        profile = getattr(request.user, "profile", None) or request.user.userprofile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)


class ReferralCodeApplyView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsNotBanned)

    def post(self, request: Request) -> Response:
        serializer = ReferralCodeApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data["code"]
        profile = getattr(request.user, "profile", None) or request.user.userprofile

        if profile.referral_code == code:
            return Response(
                {"detail": "Нельзя использовать собственный реферальный код."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if profile.referred_by_id:
            return Response(
                {"detail": "Реферальный код уже был активирован."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            referrer = UserProfile.objects.get(referral_code=code)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "Реферальный код не найден."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if referrer.id == profile.id:
            return Response(
                {"detail": "Нельзя использовать собственный реферальный код."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reward_cfg = ReferralProgramConfig.get_solo()
        reward_amount = int(reward_cfg.reward_for_activation or 0)

        profile.referred_by = referrer
        if reward_amount > 0:
            profile.balance = F("balance") + reward_amount
            profile.save(update_fields=["referred_by", "balance", "updated_at"])
            profile.refresh_from_db(fields=["balance", "referred_by"])
        else:
            profile.save(update_fields=["referred_by", "updated_at"])

        return Response(UserProfileSerializer(profile).data, status=status.HTTP_200_OK)


class PromoCodeApplyView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsNotBanned)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        serializer = PromoCodeApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data["code"]
        profile = getattr(request.user, "profile", None) or request.user.userprofile

        promo = (
            PromoCode.objects.select_for_update()
            .filter(code__iexact=code, is_active=True)
            .first()
        )
        if not promo:
            return Response({"detail": "Промокод не найден."}, status=status.HTTP_404_NOT_FOUND)

        if PromoCodeRedemption.objects.filter(promo_code=promo, profile=profile).exists():
            return Response(
                {"detail": "Этот промокод уже был активирован вашим профилем."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if promo.remaining_redemptions <= 0:
            return Response(
                {"detail": "Лимит активаций промокода исчерпан."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        PromoCodeRedemption.objects.create(promo_code=promo, profile=profile)
        PromoCode.objects.filter(id=promo.id).update(
            redemptions_count=F("redemptions_count") + 1
        )
        promo.refresh_from_db(fields=["redemptions_count", "is_active"])

        if promo.redemptions_count >= promo.max_redemptions and promo.is_active:
            promo.is_active = False
            promo.save(update_fields=["is_active", "updated_at"])

        if promo.reward:
            profile.balance = F("balance") + promo.reward
            profile.save(update_fields=["balance", "updated_at"])
            profile.refresh_from_db(fields=["balance"])

        return Response(UserProfileSerializer(profile).data, status=status.HTTP_200_OK)


class LegalCheckView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsNotBanned)

    def post(self, request: Request) -> Response:
        profile = getattr(request.user, "profile", None) or request.user.userprofile

        if _run_legal_check(profile):
            return Response({"legal_accepted": True}, status=status.HTTP_200_OK)

        return Response(
            {
                "legal_accepted": False,
                "detail": "Для того, чтобы открыть игру, нужно ознакомиться с правилами.",
            },
            status=status.HTTP_200_OK,
        )
