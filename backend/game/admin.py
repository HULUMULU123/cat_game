from django.contrib import admin

from .models import Gift, LeaderboardEntry, QuizQuestion, SimulationConfig, Task, TaskAssignment, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin[UserProfile]):
    list_display = ("user", "balance", "created_at")


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin[Task]):
    list_display = ("name", "reward", "created_at")


@admin.register(TaskAssignment)
class TaskAssignmentAdmin(admin.ModelAdmin[TaskAssignment]):
    list_display = ("profile", "task", "is_completed", "created_at")
    list_filter = ("is_completed",)


@admin.register(Gift)
class GiftAdmin(admin.ModelAdmin[Gift]):
    list_display = ("title", "coins", "expires_at", "is_active")


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin[QuizQuestion]):
    list_display = ("question", "round_number", "total_rounds")


@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin[LeaderboardEntry]):
    list_display = ("profile", "score", "duration_seconds", "position")


@admin.register(SimulationConfig)
class SimulationConfigAdmin(admin.ModelAdmin[SimulationConfig]):
    list_display = ("cost", "updated_at")
