from django.urls import path

from .views import CurrentUserProfileView, ReferralCodeApplyView, TelegramAuthView

urlpatterns = [
    path("telegram/", TelegramAuthView.as_view(), name="telegram-auth"),
    path("me/", CurrentUserProfileView.as_view(), name="current-profile"),
    path("referral/", ReferralCodeApplyView.as_view(), name="referral-apply"),
]
