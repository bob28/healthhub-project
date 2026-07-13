"""Routes for the directory API.

A DRF ``DefaultRouter`` generates the standard list/detail URLs for each
registered ViewSet (e.g. ``/facilities/`` and ``/facilities/{id}/``).
"""

from rest_framework.routers import DefaultRouter

from .views import FacilityViewSet, LabTestViewSet

app_name = "directory"

router = DefaultRouter()
router.register("facilities", FacilityViewSet, basename="facility")
router.register("lab-tests", LabTestViewSet, basename="lab-test")

urlpatterns = router.urls
