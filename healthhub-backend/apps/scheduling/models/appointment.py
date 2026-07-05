from django.conf import settings
from django.db import models

from apps.accounts.models import UserRole


class AppointmentStatus(models.TextChoices):
    """The lifecycle states of a scheduled appointment."""

    SCHEDULED = "scheduled", "Scheduled"
    CHECKED_IN = "checked_in", "Checked in"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"
    NO_SHOW = "no_show", "No show"


class Appointment(models.Model):
    """A patient's booked visit to a facility for specimen collection.

    Appointments are the patient-facing scheduling primitive. Test orders may
    reference the appointment at which their specimen is collected.
    """

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="appointments",
        limit_choices_to={"role": UserRole.PATIENT},
    )
    facility = models.ForeignKey(
        "directory.Facility",
        on_delete=models.PROTECT,
        related_name="appointments",
    )
    referring_doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="referred_appointments",
        limit_choices_to={"role": UserRole.DOCTOR},
    )
    scheduled_at = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=AppointmentStatus.choices,
        default=AppointmentStatus.SCHEDULED,
    )
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-scheduled_at"]

    def __str__(self):
        """Return the patient, facility, and time for admin/reporting displays."""
        return (
            f"{self.patient.get_full_name()} @ {self.facility.name} "
            f"on {self.scheduled_at:%Y-%m-%d %H:%M}"
        )
