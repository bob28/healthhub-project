"""Top-level URL configuration for the HealthHub backend.

Routes are grouped under ``/api/``:
    - ``/api/health/``   liveness/readiness probe
    - ``/api/auth/``     registration, login, token refresh, current user
    - ``/api/schema/``   machine-readable OpenAPI schema
    - ``/api/docs/``     interactive Swagger UI
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from .health import health_check

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health"),
    path("api/auth/", include("apps.accounts.api.urls")),
    # OpenAPI schema + interactive docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
