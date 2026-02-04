from __future__ import annotations

from django.db.models import F, Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from analytics.models import NovelViewEvent, SearchEvent
from core.pagination import paginate_queryset
from core.responses import api_error, api_ok
from interactions.models import Favorite, Rating
from novels.models import Novel
from novels.serializers import NovelDetailSerializer, NovelSerializer, ChapterSerializer, ChapterDetailSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def search_novels(request):
    q = (request.query_params.get("q") or "").strip()
    title = (request.query_params.get("title") or "").strip()
    author = (request.query_params.get("author") or "").strip()
    category = (request.query_params.get("category") or "").strip()
    tag = (request.query_params.get("tag") or "").strip()
    sort = (request.query_params.get("sort") or "hot").strip()

    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("pageSize", 10))

    qs = Novel.objects.filter(status="published")

    if q:
        qs = qs.filter(
            Q(title__icontains=q)
            | Q(author__icontains=q)
            | Q(intro__icontains=q)
            | Q(tags__icontains=q)
        )
    if title:
        qs = qs.filter(title__icontains=title)
    if author:
        qs = qs.filter(author__icontains=author)
    if category:
        qs = qs.filter(category__icontains=category)
    if tag:
        qs = qs.filter(tags__icontains=tag)

    if sort == "hot":
        qs = qs.order_by("-favorites_count", "-views", "-updated_at")
    else:
        qs = qs.order_by("-favorites_count", "-views", "-updated_at")

    # 记录搜索事件
    SearchEvent.objects.create(
        user=request.user if getattr(request.user, "is_authenticated", False) else None,
        query={
            "q": q,
            "title": title,
            "author": author,
            "category": category,
            "tag": tag,
            "sort": sort,
        },
    )

    result = paginate_queryset(qs, page=page, page_size=page_size)
    return api_ok(
        {
            "items": NovelSerializer(result.items, many=True).data,
            "total": result.total,
            "page": result.page,
            "pageSize": result.page_size,
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_novel_detail(request, novelId: str):
    try:
        novel = Novel.objects.get(id=novelId)
    except Novel.DoesNotExist:
        return api_error("小说不存在", status=404)

    if novel.status != "published":
        return api_error("小说不存在", status=404)

    # 浏览量统计
    Novel.objects.filter(id=novel.id).update(views=F("views") + 1, updated_at=timezone.now())
    novel.views += 1
    NovelViewEvent.objects.create(
        user=request.user if getattr(request.user, "is_authenticated", False) else None,
        novel=novel,
    )

    my_favorite = None
    my_rating = None
    if getattr(request.user, "is_authenticated", False):
        my_favorite = Favorite.objects.filter(user=request.user, novel=novel, deleted_at__isnull=True).exists()
        r = Rating.objects.filter(user=request.user, novel=novel).first()
        my_rating = r.score if r else None

    payload = NovelDetailSerializer(novel).data
    if getattr(request.user, "is_authenticated", False):
        payload["myFavorite"] = my_favorite
        payload["myRating"] = my_rating

    return api_ok(payload)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_novel_chapters(request, novelId: str):
    """获取小说章节列表"""
    from novels.models import Chapter
    try:
        novel = Novel.objects.get(id=novelId)
    except Novel.DoesNotExist:
        return api_error("小说不存在", status=404)

    if novel.status != "published":
        return api_error("小说不存在", status=404)

    chapters = Chapter.objects.filter(novel=novel).order_by("order")
    return api_ok(ChapterSerializer(chapters, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_chapter_detail(request, novelId: str, chapterId: str):
    """获取章节详情"""
    from novels.models import Chapter
    try:
        novel = Novel.objects.get(id=novelId)
    except Novel.DoesNotExist:
        return api_error("小说不存在", status=404)

    if novel.status != "published":
        return api_error("小说不存在", status=404)

    try:
        chapter = Chapter.objects.get(id=chapterId, novel=novel)
    except Chapter.DoesNotExist:
        return api_error("章节不存在", status=404)

    return api_ok(ChapterDetailSerializer(chapter).data)

