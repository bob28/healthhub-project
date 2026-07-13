"""Routes for the lab API."""

from rest_framework.routers import DefaultRouter

from .views import TestOrderViewSet

app_name = "lab"

router = DefaultRouter()
router.register("orders", TestOrderViewSet, basename="order")

urlpatterns = router.urls
