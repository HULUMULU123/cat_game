from django.urls import path

from .views import (
    # Задания
    TaskCompletionListView,
    TaskToggleCompleteView,

    # Викторина
    QuizQuestionView,
    QuizRandomBatchView,   # <-- НОВОЕ

    # Симуляция
    SimulationConfigView,
    SimulationStartView,

    # Правила
    RuleCategoryListView,

    # Ежедневные награды
    DailyRewardConfigView,
    DailyRewardClaimTodayView,

    # Сбои
    FailureListView,

    # Очки и лидерборд
    ScoreListView,
    LeaderboardView,
)

urlpatterns = [
    # Задания
    path("tasks/", TaskCompletionListView.as_view(), name="tasks"),
    path("tasks/toggle/", TaskToggleCompleteView.as_view(), name="task-toggle"),

    # Викторина
    path("quiz/", QuizQuestionView.as_view(), name="quiz"),
    path("quiz/random/", QuizRandomBatchView.as_view(), name="quiz-random"),  # <-- НОВЫЙ путь

    # Симуляция
    path("simulation/", SimulationConfigView.as_view(), name="simulation-config"),
    path("simulation/start/", SimulationStartView.as_view(), name="simulation-start"),

    # Правила
    path("rules/", RuleCategoryListView.as_view(), name="rules"),

    # Ежедневные награды
    path("daily-rewards/", DailyRewardConfigView.as_view(), name="daily-rewards"),
    path("daily-rewards/claim/", DailyRewardClaimTodayView.as_view(), name="daily-reward-claim"),

    # Сбои
    path("failures/", FailureListView.as_view(), name="failures"),

    # Очки и лидерборд
    path("scores/", ScoreListView.as_view(), name="scores"),
    path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
]
