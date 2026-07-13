"""API for the lab workflow: test orders and their results.

The order is the hub of the workflow. A doctor creates it; a staff member
records specimen collection and then the measured values (auto-flagged against
reference ranges); a doctor verifies the result; the patient reads it. The
queryset is role-scoped so patients only ever see their own orders.
"""

from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsClinicalStaff, IsDoctor

from ..models import TestOrder
from ..services import order_service, result_service
from .serializers import (
    RecordResultSerializer,
    TestOrderCreateSerializer,
    TestOrderSerializer,
    TestResultSerializer,
)


class TestOrderViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """Order tests and drive them through collection, results, and verification."""

    serializer_class = TestOrderSerializer

    def get_permissions(self):
        """Return the permissions for the current action.

        Doctors order tests and verify results; clinical staff collect
        specimens and record results; reads require only authentication
        (ownership is enforced by the role-scoped queryset).
        """
        if self.action in {"create", "verify"}:
            return [permissions.IsAuthenticated(), IsDoctor()]
        if self.action in {"collect", "record_result"}:
            return [permissions.IsAuthenticated(), IsClinicalStaff()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        """Use the write serializer for ordering, the read serializer otherwise."""
        if self.action == "create":
            return TestOrderCreateSerializer
        return TestOrderSerializer

    def get_queryset(self):
        """Return orders visible to the requester, applying filters.

        Patients see only their own; staff and admins see all. Both may narrow
        the list with ``?status=`` and ``?patient=`` query parameters.

        Returns:
            A filtered :class:`~lab.models.TestOrder` queryset.
        """
        user = self.request.user
        queryset = TestOrder.objects.select_related(
            "patient", "lab_test", "ordered_by", "collected_by", "result"
        ).prefetch_related("result__values__analyte")
        if user.is_patient:
            queryset = queryset.filter(patient=user)

        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)
        patient_param = self.request.query_params.get("patient")
        if patient_param:
            queryset = queryset.filter(patient_id=patient_param)
        return queryset

    def create(self, request, *args, **kwargs):
        """Order a test for a patient (doctor only).

        Args:
            request: The DRF request carrying the order payload.

        Returns:
            A ``201`` response with the created order (read shape).
        """
        write = TestOrderCreateSerializer(data=request.data)
        write.is_valid(raise_exception=True)
        order = order_service.create_order(
            ordered_by=request.user, **write.validated_data
        )
        return Response(TestOrderSerializer(order).data, status=201)

    @action(detail=True, methods=["post"])
    def collect(self, request, pk=None):
        """Record specimen collection for an order (staff only)."""
        order = self.get_object()
        order_service.collect_order(order, collected_by=request.user)
        return Response(TestOrderSerializer(order).data)

    @action(detail=True, methods=["post"], url_path="result", url_name="result")
    def record_result(self, request, pk=None):
        """Record measured values against an order (staff only)."""
        order = self.get_object()
        serializer = RecordResultSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = result_service.record_result(
            order=order,
            performed_by=request.user,
            values=serializer.validated_data["values"],
            notes=serializer.validated_data.get("notes", ""),
        )
        return Response(TestResultSerializer(result).data, status=201)

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        """Verify an order's result, finalizing it for the patient (doctor only)."""
        order = self.get_object()
        result = result_service.verify_result(
            order=order, verified_by=request.user
        )
        return Response(TestResultSerializer(result).data)
