from django.urls import path

from .views import CurrentUserProfileView, TelegramAuthView

urlpatterns = [
    path("telegram/", TelegramAuthView.as_view(), name="telegram-auth"),
    path("me/", CurrentUserProfileView.as_view(), name="current-profile"),
]
