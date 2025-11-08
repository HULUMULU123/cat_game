from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    UserProfile,
    Task,
    TaskCompletion,
    SimulationConfig,
    RuleCategory,
    DailyReward,
    DailyRewardClaim,
    Failure,
    QuizQuestion,
    ScoreEntry,
    AdsgramAssignment,
)

User = get_user_model()


# ---------- Tasks ----------

class TaskCompletionSerializer(serializers.ModelSerializer[TaskCompletion]):
    task_id = serializers.IntegerField(source="task.id", read_only=True)
    name = serializers.CharField(source="task.name", read_only=True)
    description = serializers.CharField(source="task.description", read_only=True)
    reward = serializers.IntegerField(source="task.reward", read_only=True)
    icon = serializers.CharField(source="task.icon", read_only=True)
    link = serializers.CharField(source="task.link", read_only=True)  # ← добавили

    class Meta:
        model = TaskCompletion
        fields = ("task_id", "name", "description", "reward", "icon", "link", "is_completed")



# ---------- Quiz ----------

class QuizQuestionSerializer(serializers.ModelSerializer[QuizQuestion]):
    class Meta:
        model = QuizQuestion
        fields = ("question_text", "answers", "correct_answer_index")


# ---------- Simulation ----------

class SimulationConfigSerializer(serializers.ModelSerializer[SimulationConfig]):
    class Meta:
        model = SimulationConfig
        fields = ("attempt_cost", "reward_level_1", "reward_level_2", "reward_level_3", "description")


# ---------- Rules ----------

class RuleCategorySerializer(serializers.ModelSerializer[RuleCategory]):
    class Meta:
        model = RuleCategory
        fields = ("id", "category", "rule_text")


# ---------- Daily rewards ----------

class DailyRewardSerializer(serializers.ModelSerializer[DailyReward]):
    class Meta:
        model = DailyReward
        fields = ("day_number", "reward_amount")


class DailyRewardClaimSerializer(serializers.ModelSerializer[DailyRewardClaim]):
    day_number = serializers.IntegerField(source="reward.day_number", read_only=True)
    reward_amount = serializers.IntegerField(source="reward.reward_amount", read_only=True)

    class Meta:
        model = DailyRewardClaim
        fields = ("day_number", "reward_amount", "claimed_at")


# ---------- Failures ----------

class FailureSerializer(serializers.ModelSerializer[Failure]):
    class Meta:
        model = Failure
        fields = ("id", "name", "start_time", "end_time")


# ---------- Scores ----------

class ScoreEntrySerializer(serializers.ModelSerializer[ScoreEntry]):
    failure_id = serializers.IntegerField(source="failure.id", read_only=True)
    failure_name = serializers.CharField(source="failure.name", read_only=True)

    class Meta:
        model = ScoreEntry
        fields = (
            "position",
            "username",
            "first_name",
            "last_name",
            "score",
            # "duration_seconds",  # <- больше не используем в выдаче
            "achieved_at",
            "failure_id",
            "failure_title",
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
class QuizResultSubmitSerializer(serializers.Serializer):
    mode = serializers.CharField()
    correct = serializers.IntegerField(min_value=0)
    total = serializers.IntegerField(min_value=1)


class QuizResultResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()
    reward = serializers.IntegerField()
    balance = serializers.IntegerField()


# ---------- Adsgram ----------


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