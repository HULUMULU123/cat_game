from typing import TYPE_CHECKING
from django.contrib import admin

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
)

# --- Типы только для mypy ---
if TYPE_CHECKING:
    from django.contrib.admin import ModelAdmin as _ModelAdmin

    UserProfileAdminBase = _ModelAdmin[UserProfile]  # type: ignore[index]
    TaskAdminBase = _ModelAdmin[Task]  # type: ignore[index]
    TaskCompletionAdminBase = _ModelAdmin[TaskCompletion]  # type: ignore[index]
    SimulationConfigAdminBase = _ModelAdmin[SimulationConfig]  # type: ignore[index]
    RuleCategoryAdminBase = _ModelAdmin[RuleCategory]  # type: ignore[index]
    DailyRewardAdminBase = _ModelAdmin[DailyReward]  # type: ignore[index]
    DailyRewardClaimAdminBase = _ModelAdmin[DailyRewardClaim]  # type: ignore[index]
    FailureAdminBase = _ModelAdmin[Failure]  # type: ignore[index]
    QuizQuestionAdminBase = _ModelAdmin[QuizQuestion]  # type: ignore[index]
    ScoreEntryAdminBase = _ModelAdmin[ScoreEntry]  # type: ignore[index]
else:
    UserProfileAdminBase = admin.ModelAdmin
    TaskAdminBase = admin.ModelAdmin
    TaskCompletionAdminBase = admin.ModelAdmin
    SimulationConfigAdminBase = admin.ModelAdmin
    RuleCategoryAdminBase = admin.ModelAdmin
    DailyRewardAdminBase = admin.ModelAdmin
    DailyRewardClaimAdminBase = admin.ModelAdmin
    FailureAdminBase = admin.ModelAdmin
    QuizQuestionAdminBase = admin.ModelAdmin
    ScoreEntryAdminBase = admin.ModelAdmin


# --- Регистрация моделей ---

@admin.register(UserProfile)
class UserProfileAdmin(UserProfileAdminBase):
    list_display = ("user", "balance", "created_at", "updated_at")
    search_fields = ("user__username",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(Task)
class TaskAdmin(TaskAdminBase):
    list_display = ("name", "reward", "created_at", "updated_at")
    search_fields = ("name",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(TaskCompletion)
class TaskCompletionAdmin(TaskCompletionAdminBase):
    list_display = ("profile", "task", "is_completed", "created_at")
    list_filter = ("is_completed",)
    search_fields = ("profile__user__username", "task__name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(SimulationConfig)
class SimulationConfigAdmin(SimulationConfigAdminBase):
    list_display = (
        "attempt_cost",
        "reward_level_1",
        "reward_level_2",
        "reward_level_3",
        "updated_at",
    )
    readonly_fields = ("created_at", "updated_at")


@admin.register(RuleCategory)
class RuleCategoryAdmin(RuleCategoryAdminBase):
    list_display = ("category", "created_at", "updated_at")
    search_fields = ("category",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(DailyReward)
class DailyRewardAdmin(DailyRewardAdminBase):
    list_display = ("day_number", "reward_amount", "created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")


@admin.register(DailyRewardClaim)
class DailyRewardClaimAdmin(DailyRewardClaimAdminBase):
    list_display = ("profile", "reward", "claimed_at")
    list_filter = ("reward__day_number",)
    search_fields = ("profile__user__username",)
    readonly_fields = ("claimed_at", "created_at", "updated_at")


@admin.register(Failure)
class FailureAdmin(FailureAdminBase):
    list_display = ("name", "start_time", "end_time", "created_at")
    search_fields = ("name",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(QuizQuestion)
class QuizQuestionAdmin(QuizQuestionAdminBase):
    list_display = ("id", "question_text", "correct_answer_index", "created_at")
    readonly_fields = ("created_at", "updated_at")


@admin.register(ScoreEntry)
class ScoreEntryAdmin(ScoreEntryAdminBase):
    list_display = (
        "profile",
        "failure",
        "points",
        "duration_seconds",
        "earned_at",
    )
    list_filter = ("failure",)
    search_fields = ("profile__user__username",)
    readonly_fields = ("earned_at", "created_at", "updated_at")
