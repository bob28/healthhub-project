"""Routes for the accounts API.

Auth endpoints live under ``auth/`` (e.g. ``/api/auth/login/``); the staff
patient directory is a router-registered ViewSet at ``/api/patients/``. This
module is mounted at ``/api/`` by the project URLconf.
"""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CookieTokenRefreshView,
    LoginView,
    LogoutView,
    MeView,
    PatientViewSet,
    RegisterView,
)

app_name = "accounts"

router = DefaultRouter()
router.register("patients", PatientViewSet, basename="patient")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", MeView.as_view(), name="me"),
    *router.urls,
]
