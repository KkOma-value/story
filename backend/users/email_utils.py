"""邮件发送工具函数 — 验证码邮件"""

from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_verification_email(to_email: str, code: str, purpose: str) -> bool:
    """发送验证码邮件。

    Args:
        to_email: 收件人邮箱地址
        code: 6 位验证码
        purpose: 用途（'register' 或 'reset_password'）

    Returns:
        True 发送成功，False 发送失败
    """
    if purpose == "register":
        subject = "【小说推荐系统】注册验证码"
        body_title = "注册验证码"
        body_desc = "您正在注册小说推荐系统账号，请使用以下验证码完成注册："
    elif purpose == "reset_password":
        subject = "【小说推荐系统】密码重置验证码"
        body_title = "密码重置验证码"
        body_desc = "您正在重置密码，请使用以下验证码完成操作："
    else:
        logger.warning("Unknown email purpose: %s", purpose)
        return False

    html_message = f"""\
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="420" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08);padding:36px 32px;">
        <tr><td style="text-align:center;">
          <h2 style="margin:0 0 8px;color:#333;font-size:20px;">{body_title}</h2>
          <p style="margin:0 0 24px;color:#666;font-size:14px;line-height:1.6;">{body_desc}</p>
          <div style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#667eea,#764ba2);
                      border-radius:8px;font-size:32px;font-weight:700;letter-spacing:8px;color:#fff;">
            {code}
          </div>
          <p style="margin:24px 0 0;color:#999;font-size:12px;">验证码 10 分钟内有效，请勿转发给他人。</p>
          <hr style="margin:24px 0 16px;border:none;border-top:1px solid #eee;">
          <p style="margin:0;color:#bbb;font-size:11px;">此邮件由系统自动发送，请勿直接回复。</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""

    plain_message = f"{body_desc}\n\n验证码：{code}\n\n验证码 10 分钟内有效，请勿转发给他人。"

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info("Verification email sent to %s (purpose=%s)", to_email, purpose)
        return True
    except Exception:
        logger.exception("Failed to send email to %s (purpose=%s)", to_email, purpose)
        return False
