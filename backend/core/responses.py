from __future__ import annotations

from typing import Any

from rest_framework.response import Response


def api_response(*, data: Any, message: str = "OK", success: bool = True, status: int = 200) -> Response:
    return Response({"success": success, "message": message, "data": data}, status=status)


def api_ok(data: Any = None, message: str = "OK", status: int = 200) -> Response:
    return api_response(data=data, message=message, success=True, status=status)


def api_error(message: str, status: int = 400) -> Response:
    return api_response(data=None, message=message, success=False, status=status)
