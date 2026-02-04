from __future__ import annotations

from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    message = "需要管理员权限"

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and getattr(user, "role", None) == "admin")
