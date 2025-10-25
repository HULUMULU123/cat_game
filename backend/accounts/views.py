from __future__ import annotations

from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import TelegramAuthSerializer, UserProfileSerializer


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
        serializer = UserProfileSerializer(request.user.userprofile)
        return Response(serializer.data)
