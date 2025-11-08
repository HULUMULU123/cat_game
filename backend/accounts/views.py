from __future__ import annotations

from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    ReferralCodeApplySerializer,
    TelegramAuthSerializer,
    UserProfileSerializer,
)
from game.models import UserProfile


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

        profile.referred_by = referrer
        profile.save(update_fields=["referred_by", "updated_at"])

        return Response(UserProfileSerializer(profile).data, status=status.HTTP_200_OK)
