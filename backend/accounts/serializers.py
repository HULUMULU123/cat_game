from __future__ import annotations

from django.contrib.auth.models import User
from rest_framework import serializers

from game.models import TaskCompletion, ScoreEntry, UserProfile, QuizAttempt


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
