from __future__ import annotations

import hashlib
import hmac
from urllib.parse import parse_qsl

from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import serializers

from game.models import TaskCompletion, ScoreEntry, UserProfile, QuizAttempt


def _is_valid_telegram_init_data(init_data: str) -> bool:
    if not init_data:
        return False

    try:
        data = dict(parse_qsl(init_data, strict_parsing=True))
    except ValueError:
        return False

    provided_hash = data.pop("hash", "")
    if not provided_hash:
        return False

    bot_token = getattr(settings, "TELEGRAM_BOT_TOKEN", "")
    if not bot_token:
        return False

    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(data.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode("utf-8"), hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(calculated_hash, provided_hash)


class TelegramAuthSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, allow_blank=True, required=False)
    telegram_id = serializers.IntegerField(required=False)
    photo_url = serializers.URLField(required=False, allow_blank=True)
    init_data = serializers.CharField(write_only=True)

    def create_or_update_user(self) -> tuple[User, UserProfile]:
        init_data: str = self.validated_data.get("init_data", "")
        if not _is_valid_telegram_init_data(init_data):
            raise serializers.ValidationError({"init_data": "Invalid Telegram init data"})

        username: str = self.validated_data["username"].lower()
        first_name: str = self.validated_data["first_name"].strip()
        last_name: str = self.validated_data.get("last_name", "").strip()
        telegram_id: int = int(self.validated_data.get("telegram_id") or 0)
        photo_url: str = (self.validated_data.get("photo_url") or "").strip()
        user, _ = User.objects.get_or_create(username=username)
        user.first_name = first_name
        user.last_name = last_name
        user.email = user.email or ""
        if not user.has_usable_password():
            user.set_unusable_password()
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        fields_to_update = []
        if telegram_id and profile.telegram_id != telegram_id:
            profile.telegram_id = telegram_id
            fields_to_update.append("telegram_id")
        if photo_url and profile.photo_url != photo_url:
            profile.photo_url = photo_url
            fields_to_update.append("photo_url")
        if fields_to_update:
            fields_to_update.append("updated_at")
            profile.save(update_fields=fields_to_update)
        return user, profile


class UserProfileSerializer(serializers.ModelSerializer[UserProfile]):
    username = serializers.CharField(source="user.username")
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")
    referral_code = serializers.CharField(read_only=True)
    referred_by_code = serializers.CharField(
        source="referred_by.referral_code", allow_null=True, read_only=True
    )
    referrals_count = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            "username",
            "first_name",
            "last_name",
            "balance",
            "referral_code",
            "referred_by_code",
            "referrals_count",
            "stats",
            "photo_url",
            "legal_accepted",
            "is_banned",
        )

    def get_referrals_count(self, obj: UserProfile) -> int:
        return obj.referrals.count()

    def get_stats(self, obj: UserProfile) -> dict[str, int]:
        failures_completed = ScoreEntry.objects.filter(profile=obj).count()
        quizzes_completed = QuizAttempt.objects.filter(profile=obj).count()
        tasks_completed = TaskCompletion.objects.filter(
            profile=obj, is_completed=True
        ).count()

        return {
            "failures_completed": failures_completed,
            "quizzes_completed": quizzes_completed,
            "tasks_completed": tasks_completed,
        }


class ReferralCodeApplySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=32)

    def validate_code(self, value: str) -> str:
        return value.strip().upper()


class PromoCodeApplySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=32)

    def validate_code(self, value: str) -> str:
        return value.strip()
