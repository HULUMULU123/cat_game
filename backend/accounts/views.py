from __future__ import annotations

from django.db import transaction
from django.db.models import F
from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

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


class TelegramAuthView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request: Request) -> Response:
        
        serializer = TelegramAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, profile = serializer.create_or_update_user()
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
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        profile = getattr(request.user, "profile", None) or request.user.userprofile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)


class ReferralCodeApplyView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

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
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        serializer = PromoCodeApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data["code"]
        profile = getattr(request.user, "profile", None) or request.user.userprofile

        try:
            promo = PromoCode.objects.select_for_update().get(code=code, is_active=True)
        except PromoCode.DoesNotExist:
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
