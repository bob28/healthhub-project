"""API for appointments.

Patients book, reschedule, and cancel their own appointments; staff can book
on a patient's behalf, see every appointment, and drive its status (check-in,
complete, no-show). The queryset is scoped by role, so patients can only ever
act on their own rows.
"""

from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.accounts.permissions import IsClinicalStaff

from ..models import Appointment
from ..services import appointment_service
from .serializers import (
    AppointmentCreateSerializer,
    AppointmentSerializer,
    RescheduleSerializer,
    StatusUpdateSerializer,
)


class AppointmentViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """List/retrieve/book appointments, plus reschedule, cancel, and status."""

    serializer_class = AppointmentSerializer

    def get_permissions(self):
        """Return the permissions for the current action.

        Status changes are staff-only; booking, rescheduling, cancelling, and
        reads just require authentication (row ownership is enforced by the
        role-scoped queryset).
        """
        if self.action == "set_status":
            return [permissions.IsAuthenticated(), IsClinicalStaff()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        """Use the write serializer for booking, the read serializer otherwise."""
        if self.action == "create":
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def get_queryset(self):
        """Return appointments visible to the requester, applying filters.

        Patients see only their own; staff and admins see all. Both may narrow
        the list with ``?status=`` and ``?facility=`` query parameters.

        Returns:
            A filtered :class:`~scheduling.models.Appointment` queryset.
        """
        user = self.request.user
        queryset = Appointment.objects.select_related(
            "patient", "facility", "referring_doctor"
        )
        if user.is_patient:
            queryset = queryset.filter(patient=user)

        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)
        facility_param = self.request.query_params.get("facility")
        if facility_param:
            queryset = queryset.filter(facility_id=facility_param)
        return queryset

    def create(self, request, *args, **kwargs):
        """Book an appointment.

        A patient books for themselves (any supplied ``patient`` is ignored);
        staff must name the patient they are booking for.

        Args:
            request: The DRF request carrying the booking payload.

        Returns:
            A ``201`` response with the created appointment (read shape).

        Raises:
            ValidationError: If a staff member omits the ``patient`` field.
        """
        write = AppointmentCreateSerializer(data=request.data)
        write.is_valid(raise_exception=True)
        data = write.validated_data

        if request.user.is_patient:
            data.pop("patient", None)
            patient = request.user
        else:
            patient = data.pop("patient", None)
            if patient is None:
                raise ValidationError(
                    {
                        "patient": "This field is required when staff "
                        "book an appointment."
                    }
                )

        appointment = appointment_service.create_appointment(
            patient=patient, **data
        )
        return Response(AppointmentSerializer(appointment).data, status=201)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel an appointment (owner patient or any staff)."""
        appointment = self.get_object()
        appointment_service.cancel_appointment(appointment)
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=["post"])
    def reschedule(self, request, pk=None):
        """Move an appointment to a new time (owner patient or any staff)."""
        appointment = self.get_object()
        serializer = RescheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment_service.reschedule_appointment(
            appointment, serializer.validated_data["scheduled_at"]
        )
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=["post"], url_path="status")
    def set_status(self, request, pk=None):
        """Apply a staff-initiated status change to an appointment."""
        appointment = self.get_object()
        serializer = StatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment_service.set_status(
            appointment, serializer.validated_data["status"]
        )
        return Response(AppointmentSerializer(appointment).data)
