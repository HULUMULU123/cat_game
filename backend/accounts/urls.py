from django.urls import path

from .views import (
    CurrentUserProfileView,
    LegalCheckView,
    PromoCodeApplyView,
    ReferralCodeApplyView,
    TelegramAuthView,
)

urlpatterns = [
    path("telegram/", TelegramAuthView.as_view(), name="telegram-auth"),
    path("me/", CurrentUserProfileView.as_view(), name="current-profile"),
    path("legal-check/", LegalCheckView.as_view(), name="legal-check"),
    path("referral/", ReferralCodeApplyView.as_view(), name="referral-apply"),
    path("promo/", PromoCodeApplyView.as_view(), name="promo-apply"),
]
