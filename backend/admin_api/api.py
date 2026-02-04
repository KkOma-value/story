from __future__ import annotations

import io

from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse
from django.utils import timezone
from openpyxl import Workbook
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from core.pagination import paginate_queryset
from core.permissions import IsAdminRole
from core.responses import api_error, api_ok
from novels.models import Novel, NovelStatus
from novels.serializers import NovelSerializer
from users.models import User, UserStatus


def _admin_perms():
    return [IsAuthenticated, IsAdminRole]


def _filter_novels(request):
	keyword = (request.query_params.get("keyword") or "").strip()
	status = (request.query_params.get("status") or "").strip()
	category = (request.query_params.get("category") or "").strip()
	author = (request.query_params.get("author") or "").strip()

	if status == NovelStatus.DELETED:
		qs = Novel.objects.filter(status=NovelStatus.DELETED)
	else:
		qs = Novel.objects.exclude(status=NovelStatus.DELETED)

	if keyword:
		qs = qs.filter(Q(title__icontains=keyword) | Q(author__icontains=keyword) | Q(intro__icontains=keyword))
	if status in {NovelStatus.PUBLISHED, NovelStatus.SHELVED}:
		qs = qs.filter(status=status)
	if category:
		qs = qs.filter(category__icontains=category)
	if author:
		qs = qs.filter(author__icontains=author)

	return qs.order_by("-updated_at")


@api_view(["GET", "POST"])
@permission_classes(_admin_perms())
def admin_novels(request):
    if request.method == "POST":
        data = request.data or {}
        title = (data.get("title") or "").strip()
        author = (data.get("author") or "").strip()
        category = (data.get("category") or "").strip()
        tags = data.get("tags") or []
        intro = (data.get("intro") or "").strip()
        cover_url = data.get("coverUrl")

        if not (title and author and category and isinstance(tags, list) and intro):
            return api_error("参数错误", status=400)

        novel = Novel.objects.create(
            title=title,
            author=author,
            category=category,
            tags=tags,
            intro=intro,
            cover_url=cover_url,
            status=NovelStatus.PUBLISHED,
        )
        return api_ok({"novelId": str(novel.id)})

    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("pageSize", 10))

    qs = _filter_novels(request)
    result = paginate_queryset(qs, page=page, page_size=page_size)

    return api_ok(
        {
            "items": NovelSerializer(result.items, many=True).data,
            "total": result.total,
            "page": result.page,
            "pageSize": result.page_size,
        }
    )


@api_view(["PUT", "DELETE"])
@permission_classes(_admin_perms())
def admin_novel_detail(request, novelId: str):
    try:
        novel = Novel.objects.get(id=novelId)
    except Novel.DoesNotExist:
        return api_error("小说不存在", status=404)

    if request.method == "DELETE":
        if novel.status != NovelStatus.DELETED:
            novel.status = NovelStatus.DELETED
            novel.save(update_fields=["status"])
        return api_ok({"success": True})

    data = request.data or {}
    for field, attr in [
        ("title", "title"),
        ("author", "author"),
        ("category", "category"),
        ("intro", "intro"),
    ]:
        if field in data:
            setattr(novel, attr, data.get(field))
    if "tags" in data and isinstance(data.get("tags"), list):
        novel.tags = data.get("tags")
    if "coverUrl" in data:
        novel.cover_url = data.get("coverUrl")

    novel.updated_at = timezone.now()
    novel.save()
    return api_ok({"success": True})


@api_view(["PATCH"])
@permission_classes(_admin_perms())
def admin_novel_status(request, novelId: str):
    try:
        novel = Novel.objects.get(id=novelId)
    except Novel.DoesNotExist:
        return api_error("小说不存在", status=404)

    status = request.data.get("status")
    if status not in {NovelStatus.PUBLISHED, NovelStatus.SHELVED}:
        return api_error("参数错误", status=400)

    novel.status = status
    novel.save(update_fields=["status"])
    return api_ok({"success": True})


@api_view(["GET"])
@permission_classes(_admin_perms())
def admin_novels_export(request):
    qs = _filter_novels(request)

    wb = Workbook()
    ws = wb.active
    ws.title = "novels"

    ws.append(["id", "title", "author", "category", "tags", "intro", "updatedAt", "views", "favorites", "status"])
    for n in qs[:50000]:
        ws.append(
            [
                str(n.id),
                n.title,
                n.author,
                n.category,
                ",".join(n.tags or []),
                n.intro,
                n.updated_at.isoformat(),
                n.views,
                n.favorites_count,
                n.status,
            ]
        )

    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)

    resp = HttpResponse(
        stream.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    resp["Content-Disposition"] = 'attachment; filename="novels.xlsx"'
    return resp


def _filter_users(request):
    qs = User.objects.all()
    keyword = (request.query_params.get("keyword") or "").strip()
    status = (request.query_params.get("status") or "").strip()
    if keyword:
        qs = qs.filter(Q(email__icontains=keyword) | Q(username__icontains=keyword) | Q(display_name__icontains=keyword))
    if status in {UserStatus.ACTIVE, UserStatus.BANNED, UserStatus.PERMANENT_BANNED, UserStatus.DELETED}:
        qs = qs.filter(status=status)
    return qs.order_by("-date_joined")


@api_view(["GET"])
@permission_classes(_admin_perms())
def admin_users(request):
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("pageSize", 10))

    qs = _filter_users(request)
    result = paginate_queryset(qs, page=page, page_size=page_size)

    from users.serializers import UserSerializer

    return api_ok(
        {
            "items": UserSerializer(result.items, many=True).data,
            "total": result.total,
            "page": result.page,
            "pageSize": result.page_size,
        }
    )


@api_view(["GET", "PUT", "DELETE"])
@permission_classes(_admin_perms())
def admin_user_detail(request, userId: str):
    try:
        u = User.objects.get(id=userId)
    except User.DoesNotExist:
        return api_error("用户不存在", status=404)

    if request.method == "GET":
        from users.serializers import UserSerializer

        return api_ok(UserSerializer(u).data)

    if request.method == "DELETE":
        if u.status != UserStatus.DELETED:
            u.status = UserStatus.DELETED
            u.save(update_fields=["status"])
        return api_ok({"success": True})

    data = request.data or {}
    if "username" in data:
        u.username = data.get("username")
    if "displayName" in data:
        u.display_name = data.get("displayName")
    if "avatarUrl" in data:
        u.avatar_url = data.get("avatarUrl")
    if "bio" in data:
        u.bio = data.get("bio")
    if "role" in data and data.get("role") in {"user", "admin"}:
        u.role = data.get("role")
        u.is_staff = u.role == "admin"

    u.save()
    return api_ok({"success": True})


@api_view(["POST"])
@permission_classes(_admin_perms())
def admin_user_ban(request, userId: str):
    try:
        u = User.objects.get(id=userId)
    except User.DoesNotExist:
        return api_error("用户不存在", status=404)

    ban_type = request.data.get("type")
    if ban_type not in {UserStatus.BANNED, UserStatus.PERMANENT_BANNED}:
        return api_error("参数错误", status=400)

    u.status = ban_type
    u.save(update_fields=["status"])
    return api_ok({"success": True})


@api_view(["POST"])
@permission_classes(_admin_perms())
def admin_user_unban(request, userId: str):
    try:
        u = User.objects.get(id=userId)
    except User.DoesNotExist:
        return api_error("用户不存在", status=404)

    u.status = UserStatus.ACTIVE
    u.save(update_fields=["status"])
    return api_ok({"success": True})
