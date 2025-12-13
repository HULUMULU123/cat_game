from __future__ import annotations

import hmac
import hashlib
from urllib.parse import parse_qsl
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import serializers

from game.models import TaskCompletion, ScoreEntry, UserProfile, QuizAttempt

import json
import time


class TelegramAuthSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, allow_blank=True, required=False)
    telegram_id = serializers.IntegerField(required=False)
    init_data = serializers.CharField(required=False, allow_blank=True)

    def validate_init_data(self, value: str) -> str:
        bot_token = settings.TELEGRAM_BOT_TOKEN
        if not bot_token:
            raise serializers.ValidationError("TELEGRAM_BOT_TOKEN is not configured on backend")
        if not value:
            raise serializers.ValidationError("init_data is required")

        parsed_pairs = parse_qsl(value, keep_blank_values=True, strict_parsing=False)
        params = {k: v for k, v in parsed_pairs}

        received_hash = params.get("hash")
        if not received_hash:
            raise serializers.ValidationError("hash is missing in init_data")

        # data_check_string: sort key=value lines excluding hash
        data_check_pairs = [f"{k}={params[k]}" for k in params if k != "hash"]
        data_check_pairs.sort()
        data_check_string = "\n".join(data_check_pairs)

        # secret_key = HMAC_SHA256(key="WebAppData", msg=bot_token)
        secret_key = hmac.new(
            key=b"WebAppData",
            msg=bot_token.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).digest()

        computed_hash = hmac.new(
            key=secret_key,
            msg=data_check_string.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).hexdigest()

        # ✅ timing-safe compare
        if not hmac.compare_digest(computed_hash, received_hash):
            raise serializers.ValidationError("Invalid Telegram init_data signature")

        # ✅ anti-replay: auth_date freshness (recommended)
        auth_date = params.get("auth_date")
        if auth_date and auth_date.isdigit():
            now = int(time.time())
            age = now - int(auth_date)
            # выбери окно сам; 1 час обычно норм
            if age < 0 or age > 3600:
                raise serializers.ValidationError("init_data auth_date expired")

        # ✅ bind telegram_id to signed user.id (optional but strongly recommended)
        raw_user = params.get("user")
        if raw_user:
            try:
                user_obj = json.loads(raw_user)
                signed_tg_id = user_obj.get("id")
                if signed_tg_id is not None:
                    signed_tg_id = int(signed_tg_id)
                    provided_tg_id = self.initial_data.get("telegram_id")
                    if provided_tg_id is not None and int(provided_tg_id) != signed_tg_id:
                        raise serializers.ValidationError("telegram_id does not match init_data user.id")
            except serializers.ValidationError:
                raise
            except Exception:
                # если user есть, но битый — лучше падать, чем принимать
                raise serializers.ValidationError("init_data user is not valid JSON")

        return value

    def create_or_update_user(self) -> tuple[User, UserProfile]:
        username: str = self.validated_data["username"].lower()
        first_name: str = self.validated_data["first_name"].strip()
        last_name: str = self.validated_data.get("last_name", "").strip()
        telegram_id: int = int(self.validated_data.get("telegram_id") or 0)

        user, _ = User.objects.get_or_create(username=username)
        user.first_name = first_name
        user.last_name = last_name
        user.email = user.email or ""
        if not user.has_usable_password():
            user.set_unusable_password()
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if telegram_id and profile.telegram_id != telegram_id:
            profile.telegram_id = telegram_id
            profile.save(update_fields=["telegram_id", "updated_at"])
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
        return value.strip().upper()
