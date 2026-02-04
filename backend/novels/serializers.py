from __future__ import annotations

from rest_framework import serializers

from .models import Novel, Chapter


class NovelSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    tags = serializers.SerializerMethodField()
    coverUrl = serializers.SerializerMethodField()
    sourceUrl = serializers.CharField(source="source_url", allow_null=True, required=False)
    updatedAt = serializers.DateTimeField(source="updated_at")
    favorites = serializers.IntegerField(source="favorites_count")
    rating = serializers.FloatField(source="avg_rating", default=0.0)
    wordCount = serializers.SerializerMethodField()

    def get_tags(self, obj):
        """处理可能被双重转义的tags字段"""
        import json
        tags = obj.tags
        if isinstance(tags, str):
            try:
                # 尝试解析双重转义的JSON字符串
                tags = json.loads(tags)
            except (json.JSONDecodeError, ValueError):
                # 如果解析失败，返回空列表
                return []
        return tags if isinstance(tags, list) else []

    def get_coverUrl(self, obj):
        """如果封面为空，返回默认占位符"""
        if obj.cover_url:
            return obj.cover_url
        # 使用placehold.co生成默认封面，添加书名作为文本
        import urllib.parse
        title = urllib.parse.quote(obj.title[:10] if len(obj.title) > 10 else obj.title)
        return f'https://placehold.co/240x320/151520/B8860B?text={title}'

    def get_wordCount(self, obj):
        return getattr(obj, 'word_count', 0) or 0

    class Meta:
        model = Novel
        fields = [
            "id",
            "title",
            "author",
            "category",
            "tags",
            "intro",
            "coverUrl",
            "sourceUrl",
            "status",
            "updatedAt",
            "views",
            "favorites",
            "rating",
            "wordCount",
        ]


class NovelDetailSerializer(NovelSerializer):
    myFavorite = serializers.BooleanField(required=False, allow_null=True)
    myRating = serializers.IntegerField(required=False, allow_null=True)

    class Meta(NovelSerializer.Meta):
        fields = NovelSerializer.Meta.fields + ["myFavorite", "myRating"]


class ChapterSerializer(serializers.ModelSerializer):
    """章节列表序列化器"""
    id = serializers.CharField(read_only=True)
    novelId = serializers.CharField(source="novel_id", read_only=True)
    wordCount = serializers.IntegerField(source="word_count", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Chapter
        fields = ["id", "novelId", "title", "order", "wordCount", "updatedAt"]


class ChapterDetailSerializer(ChapterSerializer):
    """章节详情序列化器（包含内容）"""

    class Meta(ChapterSerializer.Meta):
        fields = ChapterSerializer.Meta.fields + ["content"]

