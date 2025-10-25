from __future__ import annotations

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UserProfile(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:  # pragma: no cover - repr helper
        return f"Profile<{self.user.username}>"


class Task(TimestampedModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    reward = models.PositiveIntegerField(default=0)
    icon = models.URLField(blank=True)

    def __str__(self) -> str:  # pragma: no cover - repr helper
        return self.name


class TaskAssignment(TimestampedModel):
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="assignments")
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="assignments")
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ("profile", "task")

    def __str__(self) -> str:  # pragma: no cover
        return f"Assignment<{self.profile.user.username} -> {self.task.name}>"


class Gift(TimestampedModel):
    title = models.CharField(max_length=255)
    description = models.TextField()
    coins = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(null=True, blank=True)
    image_url = models.URLField(blank=True)

    def is_active(self) -> bool:
        if self.expires_at is None:
            return True
        return timezone.now() <= self.expires_at

    def __str__(self) -> str:  # pragma: no cover
        return self.title


class QuizQuestion(TimestampedModel):
    question = models.TextField()
    answers = models.JSONField(default=list)
    correct_answer_index = models.PositiveIntegerField(default=0)
    round_number = models.PositiveIntegerField(default=1)
    total_rounds = models.PositiveIntegerField(default=5)

    def __str__(self) -> str:  # pragma: no cover
        return f"QuizQuestion<round={self.round_number}>"


class LeaderboardEntry(TimestampedModel):
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="leaderboard_entries")
    score = models.PositiveIntegerField(default=0)
    duration_seconds = models.PositiveIntegerField(default=0)
    position = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ("position",)

    def __str__(self) -> str:  # pragma: no cover
        return f"LeaderboardEntry<{self.profile.user.username} #{self.position}>"


class SimulationConfig(TimestampedModel):
    cost = models.PositiveIntegerField(default=200)
    description = models.TextField(blank=True)

    def __str__(self) -> str:  # pragma: no cover
        return f"SimulationConfig<cost={self.cost}>"
