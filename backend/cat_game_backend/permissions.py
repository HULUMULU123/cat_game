from __future__ import annotations

from rest_framework import permissions


class IsNotBanned(permissions.BasePermission):
    message = "Доступ запрещен. Пользователь заблокирован."

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return True

        if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
            return True

        profile = getattr(user, "profile", None) or getattr(user, "userprofile", None)
        if not profile:
            return True

        return not bool(getattr(profile, "is_banned", False))
