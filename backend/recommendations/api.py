from __future__ import annotations

from django.db.models import FloatField, Value, F, ExpressionWrapper, Min, Max
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from novels.models import Novel
from novels.serializers import NovelSerializer
from core.responses import api_ok


def _limit(request, default: int = 6) -> int:
    try:
        v = int(request.query_params.get("limit", default))
    except Exception:
        v = default
    return max(1, min(v, 50))


def _hot_novels(limit: int):
    base_qs = Novel.objects.filter(status="published")
    stats = base_qs.aggregate(
        fav_min=Min("favorites_count"),
        fav_max=Max("favorites_count"),
        view_min=Min("views"),
        view_max=Max("views"),
        rating_min=Min("avg_rating"),
        rating_max=Max("avg_rating"),
    )

    fav_min = stats.get("fav_min") or 0
    fav_max = stats.get("fav_max") or 0
    view_min = stats.get("view_min") or 0
    view_max = stats.get("view_max") or 0
    rating_min = stats.get("rating_min") or 0
    rating_max = stats.get("rating_max") or 0

    fav_range = fav_max - fav_min
    view_range = view_max - view_min
    rating_range = rating_max - rating_min

    fav_norm = (
        Value(0.0)
        if fav_range == 0
        else ExpressionWrapper((F("favorites_count") - Value(fav_min)) / Value(fav_range), output_field=FloatField())
    )
    view_norm = (
        Value(0.0)
        if view_range == 0
        else ExpressionWrapper((F("views") - Value(view_min)) / Value(view_range), output_field=FloatField())
    )
    rating_norm = (
        Value(0.0)
        if rating_range == 0
        else ExpressionWrapper((F("avg_rating") - Value(rating_min)) / Value(rating_range), output_field=FloatField())
    )

    hot_score = ExpressionWrapper(
        Value(0.5) * fav_norm + Value(0.3) * view_norm + Value(0.2) * rating_norm,
        output_field=FloatField(),
    )

    return base_qs.annotate(hot_score=hot_score).order_by("-hot_score", "-updated_at")[:limit]


@api_view(["GET"])
@permission_classes([AllowAny])
def hot(request):
    """热门推荐：基于收藏/阅读/评分加权排序"""
    limit = _limit(request)
    qs = _hot_novels(limit)
    return api_ok(NovelSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def latest(request):
    """最新推荐：基于更新时间排序"""
    limit = _limit(request)
    qs = Novel.objects.filter(status="published").order_by("-updated_at")[:limit]
    return api_ok(NovelSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def personalized(request):
    """个性化推荐：基于协同过滤和内容推荐的缓存结果
    
    优先级：
    1. 从 RecommendationCache 读取缓存的推荐结果
    2. 如果缓存为空（冷启动），返回热门推荐
    """
    limit = _limit(request)
    
    from recommendations.models import RecommendationCache

    cached = RecommendationCache.objects.filter(
        user=request.user,
        algorithm__in=["cf", "content"],
    ).select_related("novel")

    if cached.exists():
        combined: dict[str, dict[str, object]] = {}
        for entry in cached:
            if entry.novel.status != "published":
                continue
            key = str(entry.novel_id)
            if key not in combined:
                combined[key] = {"novel": entry.novel, "cf": 0.0, "content": 0.0}
            if entry.algorithm == "cf":
                combined[key]["cf"] = float(entry.score)
            elif entry.algorithm == "content":
                combined[key]["content"] = float(entry.score)

        if combined:
            ranked = sorted(
                combined.values(),
                key=lambda r: 0.6 * r["cf"] + 0.4 * r["content"],
                reverse=True,
            )
            novels = [r["novel"] for r in ranked[:limit]]
            return api_ok(NovelSerializer(novels, many=True).data)

    return api_ok(NovelSerializer(_hot_novels(limit), many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def similar_novels(request, novelId: str):
    """获取与指定小说相似的小说（基于缓存的相似度矩阵）"""
    limit = _limit(request, default=10)
    
    try:
        novel = Novel.objects.get(id=novelId, status="published")
    except Novel.DoesNotExist:
        from core.responses import api_error
        return api_error("小说不存在", status=404)
    
    # 从相似度缓存读取
    from recommendations.models import NovelSimilarity
    
    similar = NovelSimilarity.objects.filter(
        novel_a=novel
    ).select_related('novel_b').order_by('-similarity')[:limit]
    
    if similar.exists():
        novels = [s.novel_b for s in similar if s.novel_b.status == 'published']
        if novels:
            return api_ok(NovelSerializer(novels, many=True).data)
    
    # Fallback: 同分类热门
    fallback = Novel.objects.filter(
        status="published",
        category=novel.category
    ).exclude(id=novel.id).order_by("-favorites_count", "-views")[:limit]
    
    return api_ok(NovelSerializer(fallback, many=True).data)
