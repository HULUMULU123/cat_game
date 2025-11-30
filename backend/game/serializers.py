from __future__ import annotations

import random

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers
from rest_framework.request import Request

from .models import (
    AdvertisementButton,
    UserProfile,
    Task,
    TaskCompletion,
    SimulationConfig,
    RuleCategory,
    DailyReward,
    DailyRewardClaim,
    Failure,
    FailureBonusPurchase,
    FailureBonusType,
    QuizQuestion,
    ScoreEntry,
    AdsgramBlock,
    AdsgramAssignment,
    SimulationRewardClaim,
    FrontendConfig,
)

User = get_user_model()


def _file_to_url(request: Request | None, value) -> str | None:
    """
    Принимает FieldFile или строку. Возвращает:
    - абсолютный URL, если есть request и путь относительный;
    - относительный URL (/media/...), если request не передан.
    """
    if not value:
        return None
    # Если это FieldFile (ImageField/FileField)
    url = None
    try:
        url = getattr(value, "url", None)
    except Exception:
        url = None
    if not url:
        # может быть строка из БД (например "icons/a.png" или "/media/icons/a.png")
        url = str(value).strip()
    if not url:
        return None
    return _absolute_url(request, url)


def _absolute_url(request: Request | None, raw: str | None) -> str | None:
    if not raw:
        return None
    url = str(raw).strip()
    if not url:
        return None
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if request is None:
        return url
    return request.build_absolute_uri(url)


# ---------- Tasks ----------

class TaskCompletionSerializer(serializers.ModelSerializer[TaskCompletion]):
    task_id = serializers.IntegerField(source="task.id", read_only=True)
    name = serializers.CharField(source="task.name", read_only=True)
    description = serializers.CharField(source="task.description", read_only=True)
    reward = serializers.IntegerField(source="task.reward", read_only=True)
    icon = serializers.SerializerMethodField()
    link = serializers.CharField(source="task.link", read_only=True)  # ← добавили

    class Meta:
        model = TaskCompletion
        fields = ("task_id", "name", "description", "reward", "icon", "link", "is_completed")

    def get_icon(self, obj: TaskCompletion) -> str | None:
        request = self.context.get("request")
        # obj.task.icon может быть ImageField или строка
        return _file_to_url(request, getattr(obj.task, "icon", None))



# ---------- Quiz ----------

class QuizQuestionSerializer(serializers.ModelSerializer[QuizQuestion]):
    class Meta:
        model = QuizQuestion
        fields = ("id", "question_text", "answers", "correct_answer_index", "reward")

    def to_representation(self, instance: QuizQuestion) -> dict[str, object]:
        data = super().to_representation(instance)
        answers = list(instance.answers or [])
        if not answers:
            data["answers"] = []
            data["correct_answer_index"] = 0
            return data

        correct_idx = instance.correct_answer_index
        try:
            correct_answer = answers[correct_idx]
        except IndexError:
            correct_answer = answers[0]

        shuffled = answers[:]
        random.shuffle(shuffled)
        try:
            new_index = shuffled.index(correct_answer)
        except ValueError:
            shuffled = [correct_answer, *[ans for ans in shuffled if ans != correct_answer]]
            new_index = 0

        data["answers"] = shuffled
        data["correct_answer_index"] = new_index
        return data


# ---------- Simulation ----------

class SimulationConfigSerializer(serializers.ModelSerializer[SimulationConfig]):
    class Meta:
        model = SimulationConfig
        fields = (
            "attempt_cost",
            "reward_level_1",
            "reward_level_2",
            "reward_level_3",
            "duration_seconds",
            "description",
            "reward_threshold_1",
            "reward_amount_1",
            "reward_threshold_2",
            "reward_amount_2",
            "reward_threshold_3",
            "reward_amount_3",
        )


class SimulationRewardClaimSerializer(serializers.Serializer):
    threshold = serializers.IntegerField(min_value=1)


# ---------- Rules ----------

class RuleCategorySerializer(serializers.ModelSerializer[RuleCategory]):
    icon = serializers.SerializerMethodField()

    class Meta:
        model = RuleCategory
        fields = ("id", "category", "rule_text", "icon")

    def get_icon(self, obj: RuleCategory) -> str | None:
        request = self.context.get("request")
        return _file_to_url(request, obj.icon)


# ---------- Daily rewards ----------

class DailyRewardSerializer(serializers.ModelSerializer[DailyReward]):
    class Meta:
        model = DailyReward
        fields = ("day_number", "reward_amount")


class DailyRewardClaimSerializer(serializers.ModelSerializer[DailyRewardClaim]):
    day_number = serializers.IntegerField(source="reward.day_number", read_only=True)
    reward_amount = serializers.IntegerField(source="reward.reward_amount", read_only=True)
    claimed_for_date = serializers.DateField(read_only=True)
    sequence_day = serializers.IntegerField(read_only=True)

    class Meta:
        model = DailyRewardClaim
        fields = (
            "day_number",
            "reward_amount",
            "sequence_day",
            "claimed_for_date",
            "claimed_at",
        )


# ---------- Advertisements & config ----------


class AdvertisementButtonSerializer(serializers.ModelSerializer[AdvertisementButton]):
    image = serializers.SerializerMethodField()
    available_claims = serializers.SerializerMethodField()

    class Meta:
        model = AdvertisementButton
        fields = (
            "id",
            "title",
            "link",
            "order",
            "image",
            "reward_amount",
            "available_claims",
        )

    def get_image(self, obj: AdvertisementButton) -> str | None:
        request = self.context.get("request")
        return _file_to_url(request, obj.image)

    def get_available_claims(self, obj: AdvertisementButton) -> int:
        if obj.reward_amount <= 0:
            return 0

        request: Request | None = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return 1

        try:
            profile = user.profile
        except UserProfile.DoesNotExist:  # type: ignore[attr-defined]
            return 0

        claimed = obj.reward_claims.filter(profile=profile).exists()
        return 0 if claimed else 1


class FrontendConfigSerializer(serializers.ModelSerializer[FrontendConfig]):
    screen_texture = serializers.SerializerMethodField()

    class Meta:
        model = FrontendConfig
        fields = ("screen_texture",)

    def get_screen_texture(self, obj: FrontendConfig) -> str | None:
        request = self.context.get("request")
        return _file_to_url(request, obj.screen_texture)


# ---------- Failures ----------

class FailureSerializer(serializers.ModelSerializer[Failure]):
    is_active = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    bonus_prices = serializers.SerializerMethodField()
    main_prize_image = serializers.SerializerMethodField()

    class Meta:
        model = Failure
        fields = (
            "id",
            "name",
            "start_time",
            "end_time",
            "is_active",
            "is_completed",
            "duration_seconds",
            "attempt_cost",
            "bombs_min_count",
            "bombs_max_count",
            "max_bonuses_per_run",
            "bonus_prices",
            "main_prize_title",
            "main_prize_image",
        )

    def get_is_active(self, obj: Failure) -> bool:
        now = timezone.now()
        if obj.start_time and obj.start_time > now:
            return False
        if obj.end_time and obj.end_time <= now:
            return False
        return True

    def get_is_completed(self, obj: Failure) -> bool:
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:  # type: ignore[attr-defined]
            return False
        return ScoreEntry.objects.filter(profile=profile, failure=obj).exists()

    def get_bonus_prices(self, obj: Failure) -> dict[str, int]:
        return obj.bonus_prices()

    def get_main_prize_image(self, obj: Failure) -> str | None:
        request = self.context.get("request")
        return _file_to_url(request, obj.main_prize_image)


class FailureBonusPurchaseSerializer(serializers.Serializer):
    failure_id = serializers.IntegerField()
    bonus_type = serializers.ChoiceField(choices=FailureBonusType.choices)


# ---------- Scores ----------

class ScoreEntrySerializer(serializers.ModelSerializer[ScoreEntry]):
    """Простая выдача очков пользователя."""

    failure_id = serializers.IntegerField(source="failure.id", read_only=True)
    failure_name = serializers.CharField(source="failure.name", read_only=True)
    score = serializers.IntegerField(source="points", read_only=True)

    class Meta:
        model = ScoreEntry
        fields = (
            "id",
            "score",
            "points",
            "duration_seconds",
            "earned_at",
            "failure_id",
            "failure_name",
        )


# ---------- Leaderboard (computed) ----------

class LeaderboardRowSerializer(serializers.Serializer):
    position = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    score = serializers.IntegerField()
    duration_seconds = serializers.IntegerField()


# --- НОВОЕ: сериалайзеры для результата квиза ---
class QuizAnswerSubmitSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_answer = serializers.CharField(allow_blank=True)


class QuizResultSubmitSerializer(serializers.Serializer):
    mode = serializers.CharField()
    answers = QuizAnswerSubmitSerializer(many=True)

    def validate_answers(self, value: list[dict[str, object]]) -> list[dict[str, object]]:
        if not value:
            raise serializers.ValidationError("answers must not be empty")
        if len(value) > 50:
            raise serializers.ValidationError("answers list is too long")
        return value


class QuizResultResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()
    reward = serializers.IntegerField()
    balance = serializers.IntegerField()


class FailureStartSerializer(serializers.Serializer):
    failure_id = serializers.IntegerField(required=False)


class FailureCompleteSerializer(serializers.Serializer):
    failure_id = serializers.IntegerField()
    points = serializers.IntegerField(min_value=0)
    duration_seconds = serializers.IntegerField(min_value=0, max_value=3600)


# ---------- Adsgram ----------


class AdsgramBlockSerializer(serializers.ModelSerializer[AdsgramBlock]):
    class Meta:
        model = AdsgramBlock
        fields = ("block_id",)


class AdsgramAssignmentRequestSerializer(serializers.Serializer):
    placement_id = serializers.CharField(required=False, allow_blank=True)


class AdsgramAssignmentCompleteSerializer(serializers.Serializer):
    assignment_id = serializers.CharField()


class AdsgramAssignmentSerializer(serializers.ModelSerializer[AdsgramAssignment]):
    assignment_id = serializers.CharField(source="external_assignment_id", read_only=True)
    user_id = serializers.IntegerField(source="profile.user_id", read_only=True)

    class Meta:
        model = AdsgramAssignment
        fields = (
            "assignment_id",
            "placement_id",
            "status",
            "payload",
            "completed_at",
            "created_at",
            "updated_at",
            "user_id",
        )