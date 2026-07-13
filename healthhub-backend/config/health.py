"""Liveness/readiness endpoint used by uptime monitors and keep-alive pings."""

from django.db import connection
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@extend_schema(
    summary="Health check",
    description="Reports service and database availability. Public.",
    auth=[],
    responses={200: OpenApiTypes.OBJECT, 503: OpenApiTypes.OBJECT},
)
@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def health_check(request):
    """Report whether the service and its database are reachable.

    Runs a trivial ``SELECT 1`` to confirm the database connection is alive.

    Args:
        request: The incoming request (unused; present for the view signature).

    Returns:
        A ``200`` response with ``{"status": "ok", "database": "ok"}`` when
        healthy, or ``503`` with the database error when the check fails.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception as exc:  # noqa: BLE001 — report any failure to the monitor
        return Response(
            {"status": "error", "database": str(exc)}, status=503
        )

    return Response({"status": "ok", "database": "ok"})
