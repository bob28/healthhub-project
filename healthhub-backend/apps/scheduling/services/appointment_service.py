"""Business rules for booking and managing appointments.

Kept out of the views so the rules (valid times, allowed transitions) are
reusable and unit-testable without a request. Rule violations raise DRF
``ValidationError`` so the API surfaces them as ``400`` responses.
"""

from django.utils import timezone
from rest_framework.exceptions import ValidationError

from ..models import Appointment, AppointmentStatus

# Statuses that are final — an appointment in one of these can't be changed
# by the patient (rescheduled or cancelled).
_CLOSED_STATUSES = {AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED}

# Statuses a staff member may set directly via the status action.
_STAFF_SETTABLE = {
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.NO_SHOW,
    AppointmentStatus.CANCELLED,
}


def create_appointment(
    *, patient, facility, scheduled_at, reason="", referring_doctor=None
):
    """Book a new appointment for a patient.

    Args:
        patient: The patient ``User`` the appointment is for.
        facility: The :class:`~directory.models.Facility` to visit.
        scheduled_at: The appointment datetime; must be in the future.
        reason: Optional free-text reason for the visit.
        referring_doctor: Optional referring doctor ``User``.

    Returns:
        The created :class:`~scheduling.models.Appointment`.

    Raises:
        ValidationError: If ``scheduled_at`` is not in the future.
    """
    if scheduled_at <= timezone.now():
        raise ValidationError(
            {"scheduled_at": "Appointment time must be in the future."}
        )
    return Appointment.objects.create(
        patient=patient,
        facility=facility,
        scheduled_at=scheduled_at,
        reason=reason,
        referring_doctor=referring_doctor,
    )


def reschedule_appointment(appointment, scheduled_at):
    """Move an appointment to a new future time and reset it to scheduled.

    Args:
        appointment: The appointment to move.
        scheduled_at: The new datetime; must be in the future.

    Returns:
        The updated appointment.

    Raises:
        ValidationError: If the appointment is completed/cancelled, or the new
            time is not in the future.
    """
    if appointment.status in _CLOSED_STATUSES:
        raise ValidationError(
            "A completed or cancelled appointment can't be rescheduled."
        )
    if scheduled_at <= timezone.now():
        raise ValidationError(
            {"scheduled_at": "Appointment time must be in the future."}
        )
    appointment.scheduled_at = scheduled_at
    appointment.status = AppointmentStatus.SCHEDULED
    appointment.save(update_fields=["scheduled_at", "status", "updated_at"])
    return appointment


def cancel_appointment(appointment):
    """Cancel an appointment.

    Args:
        appointment: The appointment to cancel.

    Returns:
        The cancelled appointment.

    Raises:
        ValidationError: If the appointment is already completed or cancelled.
    """
    if appointment.status in _CLOSED_STATUSES:
        raise ValidationError("This appointment can no longer be cancelled.")
    appointment.status = AppointmentStatus.CANCELLED
    appointment.save(update_fields=["status", "updated_at"])
    return appointment


def set_status(appointment, status):
    """Apply a staff-initiated status change (check-in, complete, no-show).

    Args:
        appointment: The appointment to update.
        status: The target status; must be one staff may set directly.

    Returns:
        The updated appointment.

    Raises:
        ValidationError: If ``status`` is not a staff-settable status.
    """
    if status not in _STAFF_SETTABLE:
        raise ValidationError({"status": "That status can't be set directly."})
    appointment.status = status
    appointment.save(update_fields=["status", "updated_at"])
    return appointment
