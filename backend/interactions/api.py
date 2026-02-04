from __future__ import annotations

from django.db import transaction
from django.db.models import Avg, Count, F
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from core.pagination import paginate_queryset
from core.responses import api_error, api_ok
from interactions.models import Comment, Favorite, Rating, ReadHistory
from interactions.serializers import CommentSerializer, CommentThreadSerializer, ReadHistorySerializer
from novels.models import Novel


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def favorite_toggle(request, novelId: str):
    try:
        novel = Novel.objects.get(id=novelId, status="published")
    except Novel.DoesNotExist:
        return api_error("小说不存在", status=404)

    with transaction.atomic():
        fav, created = Favorite.objects.select_for_update().get_or_create(user=request.user, novel=novel)
        if request.method == "POST":
            if fav.deleted_at is not None:
                fav.deleted_at = None
                fav.save(update_fields=["deleted_at"])
                Novel.objects.filter(id=novel.id).update(favorites_count=F("favorites_count") + 1)
            elif created:
                Novel.objects.filter(id=novel.id).update(favorites_count=F("favorites_count") + 1)
            return api_ok({"success": True})

        # DELETE
        if fav.deleted_at is None:
            fav.deleted_at = timezone.now()
            fav.save(update_fields=["deleted_at"])
            Novel.objects.filter(id=novel.id, favorites_count__gt=0).update(favorites_count=F("favorites_count") - 1)
        return api_ok({"success": True})


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def rate_novel(request, novelId: str):
    try:
        novel = Novel.objects.get(id=novelId, status="published")
    except Novel.DoesNotExist:
        return api_error("小说不存在", status=404)

    score = request.data.get("score")
    try:
        score_int = int(score)
    except Exception:
        return api_error("评分必须为整数", status=400)
    if score_int < 1 or score_int > 5:
        return api_error("评分范围 1-5", status=400)

    with transaction.atomic():
        Rating.objects.update_or_create(user=request.user, novel=novel, defaults={"score": score_int})

        agg = Rating.objects.filter(novel=novel).aggregate(cnt=Count("id"), avg=Avg("score"))
        Novel.objects.filter(id=novel.id).update(
            rating_count=agg["cnt"] or 0,
            avg_rating=float(agg["avg"] or 0),
            updated_at=timezone.now(),
        )

    return api_ok({"success": True})


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def comments(request, novelId: str):
    try:
        novel = Novel.objects.get(id=novelId, status="published")
    except Novel.DoesNotExist:
        return api_error("小说不存在", status=404)

    if request.method == "POST":
        if not getattr(request.user, "is_authenticated", False):
            return api_error("未登录", status=401)

        content = (request.data.get("content") or "").strip()
        parent_id = request.data.get("parentId")
        if not content:
            return api_error("内容不能为空", status=400)

        parent = None
        if parent_id:
            parent = Comment.objects.filter(id=parent_id, novel=novel).first()
            if not parent:
                return api_error("父评论不存在", status=400)

        c = Comment.objects.create(
            novel=novel,
            user=request.user,
            user_display_name=getattr(request.user, "display_name", request.user.username),
            content=content,
            parent=parent,
        )
        return api_ok({"commentId": str(c.id)})

    # GET
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("pageSize", 10))

    roots = Comment.objects.filter(novel=novel, parent__isnull=True).order_by("-created_at")
    result = paginate_queryset(roots, page=page, page_size=page_size)

    threads = []
    for root in result.items:
        replies = Comment.objects.filter(parent=root).order_by("created_at")[:20]
        data = CommentThreadSerializer(root).data
        data["replies"] = CommentSerializer(replies, many=True).data
        threads.append(data)

    return api_ok({"items": threads, "total": result.total, "page": result.page, "pageSize": result.page_size})


@api_view(["GET"])
@permission_classes([AllowAny])
def comment_replies(request, commentId: str):
    try:
        parent = Comment.objects.get(id=commentId)
    except Comment.DoesNotExist:
        return api_error("评论不存在", status=404)

    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("pageSize", 10))

    qs = Comment.objects.filter(parent=parent).order_by("created_at")
    result = paginate_queryset(qs, page=page, page_size=page_size)

    return api_ok(
        {
            "items": CommentSerializer(result.items, many=True).data,
            "total": result.total,
            "page": result.page,
            "pageSize": result.page_size,
        }
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_comment(request, commentId: str):
    try:
        c = Comment.objects.get(id=commentId)
    except Comment.DoesNotExist:
        return api_error("评论不存在", status=404)

    if str(c.user_id) != str(request.user.id):
        return api_error("无权限", status=403)

    if not c.deleted:
        c.deleted = True
        c.save(update_fields=["deleted"])

    return api_ok({"success": True})


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def read_history(request):
    if request.method == "GET":
        qs = ReadHistory.objects.filter(user=request.user).select_related("novel").order_by("-last_read_at")
        return api_ok(ReadHistorySerializer(qs, many=True).data)

    if request.method == "DELETE":
        ReadHistory.objects.filter(user=request.user).delete()
        return api_ok({"success": True})

    # POST
    novel_id = request.data.get("novelId")
    if not novel_id:
        return api_error("缺少小说ID", status=400)

    try:
        novel = Novel.objects.get(id=novel_id, status="published")
    except Novel.DoesNotExist:
        return api_error("小说不存在", status=404)

    last_chapter = (request.data.get("lastChapter") or "").strip()
    progress = request.data.get("progress")
    progress_value = None
    try:
        if progress is not None:
            progress_value = max(0, min(100, int(progress)))
    except Exception:
        return api_error("进度必须为整数", status=400)

    history, created = ReadHistory.objects.get_or_create(user=request.user, novel=novel)
    if last_chapter:
        history.last_chapter = last_chapter
    if progress_value is not None:
        history.progress = progress_value
    history.save()

    return api_ok({"historyId": str(history.id), "created": created})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_read_history(request, historyId: str):
    history = ReadHistory.objects.filter(id=historyId, user=request.user).first()
    if not history:
        return api_error("记录不存在", status=404)

    history.delete()
    return api_ok({"success": True})
