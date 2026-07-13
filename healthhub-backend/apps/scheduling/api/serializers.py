from rest_framework import serializers

from apps.accounts.models import User, UserRole
from apps.directory.api.serializers import FacilitySerializer

from ..models import Appointment, AppointmentStatus


class AppointmentSerializer(serializers.ModelSerializer):
    """Read serializer for an appointment with related names resolved."""

    patient_name = serializers.CharField(
        source="patient.get_full_name", read_only=True
    )
    facility = FacilitySerializer(read_only=True)
    referring_doctor_name = serializers.CharField(
        source="referring_doctor.get_full_name",
        read_only=True,
        default=None,
    )
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_name",
            "facility",
            "referring_doctor",
            "referring_doctor_name",
            "scheduled_at",
            "status",
            "status_display",
            "reason",
            "created_at",
        ]


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Write serializer for booking an appointment.

    ``patient`` is optional: patients booking for themselves omit it (the view
    supplies their own id); staff booking on a patient's behalf must provide
    it. The view enforces which case applies.
    """

    patient = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=UserRole.PATIENT),
        required=False,
    )

    class Meta:
        model = Appointment
        fields = ["patient", "facility", "scheduled_at", "referring_doctor", "reason"]


class RescheduleSerializer(serializers.Serializer):
    """Validate the new time supplied when rescheduling an appointment."""

    scheduled_at = serializers.DateTimeField()


class StatusUpdateSerializer(serializers.Serializer):
    """Validate a staff-initiated status change on an appointment."""

    status = serializers.ChoiceField(choices=AppointmentStatus.choices)
