from __future__ import annotations

from django.db.models import Avg, Count
from django.utils.dateparse import parse_date
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from core.pagination import paginate_queryset
from core.permissions import IsAdminRole
from core.responses import api_ok
from interactions.models import Favorite, Rating
from novels.models import Novel
from analytics.models import LoginEvent, NovelViewEvent, SearchEvent


def _admin_perms():
    return [IsAuthenticated, IsAdminRole]


def _date_range(request):
    f = parse_date(request.query_params.get("from") or "")
    t = parse_date(request.query_params.get("to") or "")
    return f, t


@api_view(["GET"])
@permission_classes(_admin_perms())
def novel_analytics(request):
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("pageSize", 10))
    from_date, to_date = _date_range(request)

    qs = Novel.objects.all().order_by("-favorites_count", "-views")
    result = paginate_queryset(qs, page=page, page_size=page_size)

    def _range_filter(qs2):
        if from_date:
            qs2 = qs2.filter(created_at__date__gte=from_date)
        if to_date:
            qs2 = qs2.filter(created_at__date__lte=to_date)
        return qs2

    items = []
    for n in result.items:
        views = _range_filter(NovelViewEvent.objects.filter(novel=n)).count() if (from_date or to_date) else n.views
        favorites = (
            _range_filter(Favorite.objects.filter(novel=n)).count() if (from_date or to_date) else n.favorites_count
        )
        rating_agg = (
            Rating.objects.filter(novel=n)
            .filter(updated_at__date__gte=from_date) if from_date else Rating.objects.filter(novel=n)
        )
        if to_date:
            rating_agg = rating_agg.filter(updated_at__date__lte=to_date)
        rating_agg = rating_agg.aggregate(cnt=Count("id"), avg=Avg("score"))

        items.append(
            {
                "novelId": str(n.id),
                "title": n.title,
                "views": views,
                "favorites": favorites,
                "ratingCount": rating_agg["cnt"] or 0,
                "avgRating": float(rating_agg["avg"] or 0),
            }
        )

    return api_ok({"items": items, "total": result.total, "page": result.page, "pageSize": result.page_size})


@api_view(["GET"])
@permission_classes(_admin_perms())
def user_analytics(request):
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("pageSize", 10))
    from_date, to_date = _date_range(request)

    from users.models import User

    qs = User.objects.all().order_by("-date_joined")
    result = paginate_queryset(qs, page=page, page_size=page_size)

    def _range_filter(qs2):
        if from_date:
            qs2 = qs2.filter(created_at__date__gte=from_date)
        if to_date:
            qs2 = qs2.filter(created_at__date__lte=to_date)
        return qs2

    items = []
    for u in result.items:
        logins = _range_filter(LoginEvent.objects.filter(user=u)).count()
        searches = _range_filter(SearchEvent.objects.filter(user=u)).count()
        novel_views = _range_filter(NovelViewEvent.objects.filter(user=u)).count()
        favorites = _range_filter(Favorite.objects.filter(user=u)).count()
        ratings = _range_filter(Rating.objects.filter(user=u)).count()
        comments = _range_filter(
            __import__("interactions.models", fromlist=["Comment"]).Comment.objects.filter(user=u)
        ).count()

        items.append(
            {
                "userId": str(u.id),
                "username": u.username,
                "displayName": u.display_name,
                "logins": logins,
                "searches": searches,
                "novelViews": novel_views,
                "favorites": favorites,
                "ratings": ratings,
                "comments": comments,
            }
        )

    return api_ok({"items": items, "total": result.total, "page": result.page, "pageSize": result.page_size})
