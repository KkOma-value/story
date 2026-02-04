from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from core.pagination import paginate_queryset
from core.responses import api_error, api_ok
from interactions.models import Favorite, Comment, Rating
from interactions.serializers import CommentSerializer, CommentThreadSerializer
from novels.serializers import NovelSerializer
from users.serializers import UserSerializer


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    if request.method == "GET":
        return api_ok(UserSerializer(user).data)

    data = request.data or {}
    if "username" in data:
        user.username = (data.get("username") or "").strip()
    if "displayName" in data:
        user.display_name = (data.get("displayName") or "").strip()
    if "avatarUrl" in data:
        user.avatar_url = data.get("avatarUrl")
    if "bio" in data:
        user.bio = data.get("bio")

    user.save(update_fields=["username", "display_name", "avatar_url", "bio"])
    return api_ok(UserSerializer(user).data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get("oldPassword") or ""
    new_password = request.data.get("newPassword") or ""
    confirm_password = request.data.get("confirmPassword") or ""

    if not (old_password and new_password and confirm_password):
        return api_error("参数错误", status=400)
    if new_password != confirm_password:
        return api_error("两次密码不一致", status=400)
    if not user.check_password(old_password):
        return api_error("旧密码错误", status=400)

    user.set_password(new_password)
    user.save(update_fields=["password"])
    return api_ok({"success": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_favorites(request):
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("pageSize", 10))

    qs = (
        Favorite.objects.select_related("novel")
        .filter(user=request.user, deleted_at__isnull=True, novel__status="published")
        .order_by("-created_at")
    )

    result = paginate_queryset(qs, page=page, page_size=page_size)
    novels = [fav.novel for fav in result.items]

    return api_ok(
        {
            "items": NovelSerializer(novels, many=True).data,
            "total": result.total,
            "page": result.page,
            "pageSize": result.page_size,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_comments(request):
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("pageSize", 10))

    qs = Comment.objects.select_related("novel").filter(user=request.user, deleted=False).order_by("-created_at")
    result = paginate_queryset(qs, page=page, page_size=page_size)

    # We need a serializer that includes novel info for context
    items = []
    for c in result.items:
        data = CommentSerializer(c).data
        data['novelTitle'] = c.novel.title
        data['novelId'] = str(c.novel.id)
        items.append(data)

    return api_ok(
        {
            "items": items,
            "total": result.total,
            "page": result.page,
            "pageSize": result.page_size,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_ratings(request):
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("pageSize", 10))

    qs = Rating.objects.select_related("novel").filter(user=request.user).order_by("-updated_at")
    result = paginate_queryset(qs, page=page, page_size=page_size)

    items = []
    for r in result.items:
        items.append({
            "id": str(r.id),
            "novelId": str(r.novel.id),
            "novelTitle": r.novel.title,
            "coverUrl": r.novel.cover_url,
            "score": r.score,
            "updatedAt": r.updated_at,
        })

    return api_ok(
        {
            "items": items,
            "total": result.total,
            "page": result.page,
            "pageSize": result.page_size,
        }
    )
