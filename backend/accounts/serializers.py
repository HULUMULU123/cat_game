from __future__ import annotations

from django.contrib.auth.models import User
from rest_framework import serializers

from game.models import UserProfile


class TelegramAuthSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, allow_blank=True, required=False)

    def create_or_update_user(self) -> tuple[User, UserProfile]:
        username: str = self.validated_data["username"].lower()
        first_name: str = self.validated_data["first_name"].strip()
        last_name: str = self.validated_data.get("last_name", "").strip()

        user, _ = User.objects.get_or_create(username=username)
        user.first_name = first_name
        user.last_name = last_name
        user.email = user.email or ""
        if not user.has_usable_password():
            user.set_unusable_password()
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        return user, profile


class UserProfileSerializer(serializers.ModelSerializer[UserProfile]):
    username = serializers.CharField(source="user.username")
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")

    class Meta:
        model = UserProfile
        fields = ("username", "first_name", "last_name", "balance")
