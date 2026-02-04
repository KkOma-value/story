from django.urls import path

from admin_api import api as admin_api
from analytics import api as analytics_api
from interactions import api as interactions_api
from novels import api as novels_api
from recommendations import api as recommendations_api
from users import api_auth, api_me

urlpatterns = [
    # Auth
    path("auth/email-code", api_auth.send_email_code),
    path("auth/register", api_auth.register),
    path("auth/login", api_auth.login),
    path("auth/logout", api_auth.logout),
    path("auth/reset-code", api_auth.send_reset_code),
    path("auth/reset-password", api_auth.reset_password),

    # Users
    path("users/me", api_me.me),
    path("users/me/password", api_me.change_password),
    path("users/me/favorites", api_me.my_favorites),
    path("users/me/comments", api_me.my_comments),
    path("users/me/ratings", api_me.my_ratings),

    # Catalog / novels
    path("novels/search", novels_api.search_novels),
    path("novels/<str:novelId>", novels_api.get_novel_detail),
    path("novels/<str:novelId>/chapters", novels_api.get_novel_chapters),
    path("novels/<str:novelId>/chapters/<str:chapterId>", novels_api.get_chapter_detail),

    # Interactions
    path("novels/<str:novelId>/favorite", interactions_api.favorite_toggle),
    path("novels/<str:novelId>/rating", interactions_api.rate_novel),
    path("novels/<str:novelId>/comments", interactions_api.comments),
    path("comments/<str:commentId>/replies", interactions_api.comment_replies),
    path("comments/<str:commentId>", interactions_api.delete_comment),
    path("history", interactions_api.read_history),
    path("history/<str:historyId>", interactions_api.delete_read_history),

    # Recommendations
    path("recommendations/personalized", recommendations_api.personalized),
    path("recommendations/hot", recommendations_api.hot),
    path("recommendations/latest", recommendations_api.latest),
    path("recommendations/similar/<str:novelId>", recommendations_api.similar_novels),

    # Admin
    path("admin/novels", admin_api.admin_novels),
    path("admin/novels/<str:novelId>", admin_api.admin_novel_detail),
    path("admin/novels/<str:novelId>/status", admin_api.admin_novel_status),
    path("admin/novels/export", admin_api.admin_novels_export),
    path("admin/users", admin_api.admin_users),
    path("admin/users/<str:userId>", admin_api.admin_user_detail),
    path("admin/users/<str:userId>/ban", admin_api.admin_user_ban),
    path("admin/users/<str:userId>/unban", admin_api.admin_user_unban),
    # Analytics
    path("admin/analytics/novels", analytics_api.novel_analytics),
    path("admin/analytics/users", analytics_api.user_analytics),
]
