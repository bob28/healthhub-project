"""Read-only API for the clinical directory (facilities + test catalog).

These are reference data managed by administrators (via the Django admin), so
the API exposes them read-only. A ``ViewSet`` groups the list and retrieve
actions for one resource; a router (see ``urls.py``) turns it into the URL
routes ``/facilities/`` and ``/facilities/{id}/``.
"""

from rest_framework import permissions, viewsets

from ..models import Facility, LabTest
from .serializers import FacilitySerializer, LabTestSerializer


class FacilityViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve facilities (hospitals, clinics, labs)."""

    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [permissions.IsAuthenticated]


class LabTestViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve orderable catalog tests with their analytes.

    The list is limited to active tests and can be narrowed by category via a
    ``?category=`` query parameter; retrieve works for any test by id.
    """

    serializer_class = LabTestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return active tests, optionally filtered by ``?category=``.

        Analytes are prefetched to avoid a query per test when serializing.

        Returns:
            A queryset of active :class:`~directory.models.LabTest` rows.
        """
        queryset = LabTest.objects.filter(is_active=True).prefetch_related(
            "analytes"
        )
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)
        return queryset
