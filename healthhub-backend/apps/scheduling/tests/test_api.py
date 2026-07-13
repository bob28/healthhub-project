"""Tests for the appointments API."""

import datetime

import pytest
from django.urls import reverse
from django.utils import timezone

from apps.accounts.models import PatientProfile, User, UserRole
from apps.directory.models import Facility, FacilityType
from apps.scheduling.models import Appointment, AppointmentStatus

pytestmark = pytest.mark.django_db


@pytest.fixture
def facility():
    """Return a facility appointments can be booked at."""
    return Facility.objects.create(
        name="Downtown Lab", facility_type=FacilityType.LAB
    )


@pytest.fixture
def technician():
    """Return a technician (clinical staff) user."""
    return User.objects.create_user(
        email="tech@example.com",
        password="Str0ngPass!23",
        first_name="Theo",
        last_name="Tech",
        role=UserRole.TECHNICIAN,
    )


@pytest.fixture
def other_patient():
    """Return a second patient (to test cross-patient isolation)."""
    user = User.objects.create_user(
        email="bob@example.com",
        password="Str0ngPass!23",
        first_name="Bob",
        last_name="Other",
        role=UserRole.PATIENT,
    )
    PatientProfile.objects.create(
        user=user, date_of_birth=datetime.date(1980, 5, 5)
    )
    return user


def _login(api_client, user):
    """Authenticate the test client as ``user`` via the login cookie."""
    api_client.post(
        reverse("accounts:login"),
        {"email": user.email, "password": "Str0ngPass!23"},
        format="json",
    )


def _future(days=3):
    """Return an ISO datetime ``days`` in the future."""
    return (timezone.now() + datetime.timedelta(days=days)).isoformat()


def test_patient_books_appointment_for_self(api_client, patient, facility):
    """A patient can book, and the appointment is assigned to them."""
    _login(api_client, patient)
    response = api_client.post(
        reverse("scheduling:appointment-list"),
        {"facility": facility.id, "scheduled_at": _future(), "reason": "Blood work"},
        format="json",
    )
    assert response.status_code == 201
    body = response.json()
    assert body["patient"] == patient.id
    assert body["status"] == AppointmentStatus.SCHEDULED
    assert body["facility"]["name"] == "Downtown Lab"


def test_booking_in_the_past_is_rejected(api_client, patient, facility):
    """Booking a time in the past returns 400."""
    _login(api_client, patient)
    past = (timezone.now() - datetime.timedelta(days=1)).isoformat()
    response = api_client.post(
        reverse("scheduling:appointment-list"),
        {"facility": facility.id, "scheduled_at": past},
        format="json",
    )
    assert response.status_code == 400
    assert "scheduled_at" in response.json()


def test_staff_books_on_behalf_of_patient(api_client, technician, patient, facility):
    """Staff can book for a named patient."""
    _login(api_client, technician)
    response = api_client.post(
        reverse("scheduling:appointment-list"),
        {
            "patient": patient.id,
            "facility": facility.id,
            "scheduled_at": _future(),
        },
        format="json",
    )
    assert response.status_code == 201
    assert response.json()["patient"] == patient.id


def test_staff_booking_without_patient_is_rejected(api_client, technician, facility):
    """Staff must name the patient when booking."""
    _login(api_client, technician)
    response = api_client.post(
        reverse("scheduling:appointment-list"),
        {"facility": facility.id, "scheduled_at": _future()},
        format="json",
    )
    assert response.status_code == 400
    assert "patient" in response.json()


def test_patient_only_sees_own_appointments(
    api_client, patient, other_patient, facility
):
    """A patient's list excludes other patients' appointments."""
    Appointment.objects.create(
        patient=patient, facility=facility, scheduled_at=timezone.now()
    )
    Appointment.objects.create(
        patient=other_patient, facility=facility, scheduled_at=timezone.now()
    )
    _login(api_client, patient)

    response = api_client.get(reverse("scheduling:appointment-list"))
    assert response.status_code == 200
    body = response.json()["results"]
    assert len(body) == 1
    assert body[0]["patient"] == patient.id


def test_patient_cannot_access_others_appointment(
    api_client, patient, other_patient, facility
):
    """Retrieving another patient's appointment returns 404 (scoped away)."""
    appt = Appointment.objects.create(
        patient=other_patient, facility=facility, scheduled_at=timezone.now()
    )
    _login(api_client, patient)

    response = api_client.get(
        reverse("scheduling:appointment-detail", args=[appt.id])
    )
    assert response.status_code == 404


def test_patient_cancels_own_appointment(api_client, patient, facility):
    """Cancelling sets the status to cancelled."""
    appt = Appointment.objects.create(
        patient=patient, facility=facility, scheduled_at=timezone.now()
    )
    _login(api_client, patient)

    response = api_client.post(
        reverse("scheduling:appointment-cancel", args=[appt.id])
    )
    assert response.status_code == 200
    assert response.json()["status"] == AppointmentStatus.CANCELLED


def test_completed_appointment_cannot_be_cancelled(api_client, patient, facility):
    """A completed appointment can no longer be cancelled."""
    appt = Appointment.objects.create(
        patient=patient,
        facility=facility,
        scheduled_at=timezone.now(),
        status=AppointmentStatus.COMPLETED,
    )
    _login(api_client, patient)

    response = api_client.post(
        reverse("scheduling:appointment-cancel", args=[appt.id])
    )
    assert response.status_code == 400


def test_reschedule_moves_and_resets_status(api_client, patient, facility):
    """Rescheduling updates the time and returns the status to scheduled."""
    appt = Appointment.objects.create(
        patient=patient,
        facility=facility,
        scheduled_at=timezone.now(),
        status=AppointmentStatus.CHECKED_IN,
    )
    _login(api_client, patient)

    response = api_client.post(
        reverse("scheduling:appointment-reschedule", args=[appt.id]),
        {"scheduled_at": _future(5)},
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["status"] == AppointmentStatus.SCHEDULED


def test_staff_sets_status(api_client, technician, patient, facility):
    """Staff can transition an appointment to checked-in."""
    appt = Appointment.objects.create(
        patient=patient, facility=facility, scheduled_at=timezone.now()
    )
    _login(api_client, technician)

    response = api_client.post(
        reverse("scheduling:appointment-set-status", args=[appt.id]),
        {"status": AppointmentStatus.CHECKED_IN},
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["status"] == AppointmentStatus.CHECKED_IN


def test_patient_cannot_set_status(api_client, patient, facility):
    """A patient may not use the staff status endpoint."""
    appt = Appointment.objects.create(
        patient=patient, facility=facility, scheduled_at=timezone.now()
    )
    _login(api_client, patient)

    response = api_client.post(
        reverse("scheduling:appointment-set-status", args=[appt.id]),
        {"status": AppointmentStatus.COMPLETED},
        format="json",
    )
    assert response.status_code == 403
