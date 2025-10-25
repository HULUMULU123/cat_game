from django.urls import path

from .views import (
    ActiveGiftView,
    LeaderboardView,
    QuizQuestionView,
    SimulationConfigView,
    SimulationStartView,
    TaskAssignmentListView,
)

urlpatterns = [
    path("gift/", ActiveGiftView.as_view(), name="gift"),
    path("tasks/", TaskAssignmentListView.as_view(), name="tasks"),
    path("quiz/", QuizQuestionView.as_view(), name="quiz"),
    path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
    path("simulation/", SimulationConfigView.as_view(), name="simulation-config"),
    path("simulation/start/", SimulationStartView.as_view(), name="simulation-start"),
]
