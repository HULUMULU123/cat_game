from typing import TYPE_CHECKING
from django.contrib import admin

from .models import (
    Gift,
    LeaderboardEntry,
    QuizQuestion,
    SimulationConfig,
    Task,
    TaskAssignment,
    UserProfile,
)

# --- Типы только для mypy ---
if TYPE_CHECKING:
    from django.contrib.admin import ModelAdmin as _ModelAdmin

    UserProfileAdminBase = _ModelAdmin[UserProfile]  # type: ignore[index]
    TaskAdminBase = _ModelAdmin[Task]  # type: ignore[index]
    TaskAssignmentAdminBase = _ModelAdmin[TaskAssignment]  # type: ignore[index]
    GiftAdminBase = _ModelAdmin[Gift]  # type: ignore[index]
    QuizQuestionAdminBase = _ModelAdmin[QuizQuestion]  # type: ignore[index]
    LeaderboardEntryAdminBase = _ModelAdmin[LeaderboardEntry]  # type: ignore[index]
    SimulationConfigAdminBase = _ModelAdmin[SimulationConfig]  # type: ignore[index]
else:
    UserProfileAdminBase = admin.ModelAdmin
    TaskAdminBase = admin.ModelAdmin
    TaskAssignmentAdminBase = admin.ModelAdmin
    GiftAdminBase = admin.ModelAdmin
    QuizQuestionAdminBase = admin.ModelAdmin
    LeaderboardEntryAdminBase = admin.ModelAdmin
    SimulationConfigAdminBase = admin.ModelAdmin


@admin.register(UserProfile)
class UserProfileAdmin(UserProfileAdminBase):
    list_display = ("user", "balance", "created_at")


@admin.register(Task)
class TaskAdmin(TaskAdminBase):
    list_display = ("name", "reward", "created_at")


@admin.register(TaskAssignment)
class TaskAssignmentAdmin(TaskAssignmentAdminBase):
    list_display = ("profile", "task", "is_completed", "created_at")
    list_filter = ("is_completed",)


@admin.register(Gift)
class GiftAdmin(GiftAdminBase):
    list_display = ("title", "coins", "expires_at", "is_active")


@admin.register(QuizQuestion)
class QuizQuestionAdmin(QuizQuestionAdminBase):
    list_display = ("question", "round_number", "total_rounds")


@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(LeaderboardEntryAdminBase):
    list_display = ("profile", "score", "duration_seconds", "position")


@admin.register(SimulationConfig)
class SimulationConfigAdmin(SimulationConfigAdminBase):
    list_display = ("cost", "updated_at")
