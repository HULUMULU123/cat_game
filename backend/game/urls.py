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
    SimulationAdRewardView,
    SimulationRewardClaimView,

    # Правила
    RuleCategoryListView,

    # Ежедневные награды
    DailyRewardConfigView,
    DailyRewardClaimTodayView,
    AdvertisementButtonListView,
    AdvertisementButtonClaimView,
    FrontendConfigView,

    # Сбои
    FailureListView,
    FailureStartView,
    FailureCompleteView,
    FailureBonusPurchaseView,

    # Очки и лидерборд
    ScoreListView,
    LeaderboardView,

    # Adsgram
    AdsgramBlockView,
    AdsgramAssignmentRequestView,
    AdsgramAssignmentCompleteView,
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
    path("simulation/ad-reward/", SimulationAdRewardView.as_view(), name="simulation-ad-reward"),
    path(
        "simulation/reward-claim/",
        SimulationRewardClaimView.as_view(),
        name="simulation-reward-claim",
    ),

    # Правила
    path("rules/", RuleCategoryListView.as_view(), name="rules"),

    # Ежедневные награды
    path("daily-rewards/", DailyRewardConfigView.as_view(), name="daily-rewards"),
    path("daily-rewards/claim/", DailyRewardClaimTodayView.as_view(), name="daily-reward-claim"),

    # Реклама и конфиг фронтенда
    path(
        "home/advert-buttons/",
        AdvertisementButtonListView.as_view(),
        name="advert-buttons",
    ),
    path(
        "home/advert-buttons/<int:button_id>/claim/",
        AdvertisementButtonClaimView.as_view(),
        name="advert-button-claim",
    ),
    path("frontend/config/", FrontendConfigView.as_view(), name="frontend-config"),

    # Сбои
    path("failures/", FailureListView.as_view(), name="failures"),
    path("failures/start/", FailureStartView.as_view(), name="failure-start"),
    path("failures/complete/", FailureCompleteView.as_view(), name="failure-complete"),
    path(
        "failures/bonus-purchase/",
        FailureBonusPurchaseView.as_view(),
        name="failure-bonus-purchase",
    ),

    # Очки и лидерборд
    path("scores/", ScoreListView.as_view(), name="scores"),
    path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),

    # Adsgram
    path("adsgram/block/", AdsgramBlockView.as_view(), name="adsgram-block"),
    path("adsgram/request/", AdsgramAssignmentRequestView.as_view(), name="adsgram-request"),
    path("adsgram/complete/", AdsgramAssignmentCompleteView.as_view(), name="adsgram-complete"),
]
