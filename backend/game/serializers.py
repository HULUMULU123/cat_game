from __future__ import annotations

from rest_framework import serializers

from .models import Gift, LeaderboardEntry, QuizQuestion, SimulationConfig, TaskAssignment


class GiftSerializer(serializers.ModelSerializer[Gift]):
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Gift
        fields = ("title", "description", "coins", "expires_at", "image_url", "is_active")

    def get_is_active(self, gift: Gift) -> bool:
        return gift.is_active()


class TaskAssignmentSerializer(serializers.ModelSerializer[TaskAssignment]):
    task_id = serializers.IntegerField(source="task.id")
    name = serializers.CharField(source="task.name")
    description = serializers.CharField(source="task.description")
    reward = serializers.IntegerField(source="task.reward")
    icon = serializers.CharField(source="task.icon")

    class Meta:
        model = TaskAssignment
        fields = ("task_id", "name", "description", "reward", "icon", "is_completed")


class QuizQuestionSerializer(serializers.ModelSerializer[QuizQuestion]):
    class Meta:
        model = QuizQuestion
        fields = ("question", "answers", "correct_answer_index", "round_number", "total_rounds")


class LeaderboardEntrySerializer(serializers.ModelSerializer[LeaderboardEntry]):
    username = serializers.CharField(source="profile.user.username")
    first_name = serializers.CharField(source="profile.user.first_name")
    last_name = serializers.CharField(source="profile.user.last_name")

    class Meta:
        model = LeaderboardEntry
        fields = ("position", "username", "first_name", "last_name", "score", "duration_seconds")


class SimulationConfigSerializer(serializers.ModelSerializer[SimulationConfig]):
    class Meta:
        model = SimulationConfig
        fields = ("cost", "description")
