from __future__ import annotations

from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    displayName = serializers.CharField(source="display_name")
    avatarUrl = serializers.CharField(source="avatar_url", allow_null=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "displayName",
            "email",
            "avatarUrl",
            "bio",
            "role",
            "status",
        ]
