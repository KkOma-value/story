from __future__ import annotations

import random

from django.core.cache import cache
from django.db import IntegrityError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import AccessToken

from analytics.models import LoginEvent
from core.responses import api_error, api_ok
from users.email_utils import send_verification_email
from users.models import User, UserStatus
from users.serializers import UserSerializer


def _email_code_cache_key(email: str, purpose: str) -> str:
    return f"email_code:{purpose}:{email.lower().strip()}"


@api_view(["POST"])
@permission_classes([AllowAny])
def send_email_code(request):
    email = (request.data.get("email") or "").strip().lower()
    purpose = request.data.get("purpose")
    if not email or purpose != "register":
        return api_error("参数错误", status=400)

    code = "".join(str(random.randint(0, 9)) for _ in range(6))
    cache.set(_email_code_cache_key(email, purpose), code, timeout=10 * 60)

    # 发送验证码邮件
    if not send_verification_email(email, code, "register"):
        return api_error("邮件发送失败，请稍后重试", status=500)

    return api_ok({"sent": True})


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    username = (request.data.get("username") or "").strip()
    display_name = (request.data.get("displayName") or "").strip()
    email = (request.data.get("email") or "").strip().lower()
    code = (request.data.get("code") or "").strip()
    password = request.data.get("password") or ""
    confirm_password = request.data.get("confirmPassword") or ""

    if not (username and display_name and email and code and password and confirm_password):
        return api_error("参数错误", status=400)
    if password != confirm_password:
        return api_error("两次密码不一致", status=400)

    cached = cache.get(_email_code_cache_key(email, "register"))
    if not cached or str(cached) != code:
        return api_error("验证码无效或已过期", status=400)

    try:
        user = User.objects.create_user(
            email=email,
            password=password,
            username=username,
            display_name=display_name,
        )
    except IntegrityError:
        return api_error("邮箱已注册", status=409)

    cache.delete(_email_code_cache_key(email, "register"))
    return api_ok({"userId": str(user.id)})


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    credential = (request.data.get("credential") or "").strip()
    password = request.data.get("password") or ""
    if not (credential and password):
        return api_error("参数错误", status=400)

    # 支持邮箱或账号名登录
    try:
        # 如果包含 @ 符号，尝试按邮箱登录
        if "@" in credential:
            user = User.objects.get(email=credential.lower())
        else:
            # 否则按用户名查找
            user = User.objects.get(username=credential)
    except User.DoesNotExist:
        return api_error("账号或密码错误", status=401)

    if user.status in {UserStatus.BANNED, UserStatus.PERMANENT_BANNED, UserStatus.DELETED}:
        return api_error("账号已被禁用", status=403)

    if not user.check_password(password):
        return api_error("账号或密码错误", status=401)

    token = AccessToken.for_user(user)
    LoginEvent.objects.create(user=user)

    return api_ok({"token": str(token), "user": UserSerializer(user).data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    # 纯无状态：不做服务端失效处理
    return api_ok({"success": True})


@api_view(["POST"])
@permission_classes([AllowAny])
def send_reset_code(request):
    """发送密码重置验证码"""
    email = (request.data.get("email") or "").strip().lower()
    if not email:
        return api_error("参数错误", status=400)

    # 检查邮箱是否存在
    if not User.objects.filter(email=email).exists():
        return api_error("邮箱不存在", status=404)

    code = "".join(str(random.randint(0, 9)) for _ in range(6))
    cache.set(_email_code_cache_key(email, "reset_password"), code, timeout=10 * 60)

    # 发送密码重置验证码邮件
    if not send_verification_email(email, code, "reset_password"):
        return api_error("邮件发送失败，请稍后重试", status=500)

    return api_ok({"sent": True})


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    """重置密码"""
    email = (request.data.get("email") or "").strip().lower()
    code = (request.data.get("code") or "").strip()
    password = request.data.get("password") or ""
    confirm_password = request.data.get("confirmPassword") or ""

    if not (email and code and password and confirm_password):
        return api_error("参数错误", status=400)

    if password != confirm_password:
        return api_error("两次密码不一致", status=400)

    # 验证验证码
    cached = cache.get(_email_code_cache_key(email, "reset_password"))
    if not cached or str(cached) != code:
        return api_error("验证码无效或已过期", status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return api_error("账号不存在", status=404)

    user.set_password(password)
    user.save()

    cache.delete(_email_code_cache_key(email, "reset_password"))
    return api_ok({"success": True})
