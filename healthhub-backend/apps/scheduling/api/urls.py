"""Routes for the scheduling API."""

from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet

app_name = "scheduling"

router = DefaultRouter()
router.register("appointments", AppointmentViewSet, basename="appointment")

urlpatterns = router.urls
