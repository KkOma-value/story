from __future__ import annotations

from typing import Any

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler


def api_exception_handler(exc: Exception, context: Any) -> Response | None:
    res = exception_handler(exc, context)
    if res is None:
        return Response(
            {"success": False, "message": "服务器错误", "data": None},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    message = "请求失败"
    if isinstance(exc, APIException):
        detail = exc.detail
        if isinstance(detail, (list, tuple)):
            message = str(detail[0]) if detail else message
        elif isinstance(detail, dict):
            first = next(iter(detail.values()), None)
            if isinstance(first, (list, tuple)):
                message = str(first[0]) if first else message
            elif first is not None:
                message = str(first)
        else:
            message = str(detail)
    else:
        if isinstance(res.data, dict) and res.data.get("detail"):
            message = str(res.data["detail"])

    return Response(
        {"success": False, "message": message, "data": None},
        status=res.status_code,
    )
