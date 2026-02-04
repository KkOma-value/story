from __future__ import annotations

from rest_framework import serializers

from novels.serializers import NovelSerializer

from .models import Comment, ReadHistory


class CommentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    novelId = serializers.CharField(source="novel_id", read_only=True)
    userId = serializers.CharField(source="user_id", read_only=True)
    userDisplayName = serializers.CharField(source="user_display_name", read_only=True)
    parentId = serializers.CharField(source="parent_id", allow_null=True, read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "novelId",
            "userId",
            "userDisplayName",
            "content",
            "parentId",
            "createdAt",
            "deleted",
        ]


class CommentThreadSerializer(CommentSerializer):
    replies = CommentSerializer(many=True, required=False, allow_null=True)

    class Meta(CommentSerializer.Meta):
        fields = CommentSerializer.Meta.fields + ["replies"]


class ReadHistorySerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    novel = NovelSerializer(read_only=True)
    lastReadAt = serializers.DateTimeField(source="last_read_at", read_only=True)
    lastChapter = serializers.CharField(source="last_chapter", read_only=True)

    class Meta:
        model = ReadHistory
        fields = ["id", "novel", "lastReadAt", "lastChapter", "progress"]
