"""Tests for the staff-facing patient directory endpoint."""

import datetime

import pytest
from django.urls import reverse

from apps.accounts.models import PatientProfile, User, UserRole

pytestmark = pytest.mark.django_db


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


def _login(api_client, user):
    """Authenticate the test client as ``user`` via the login cookie."""
    api_client.post(
        reverse("accounts:login"),
        {"email": user.email, "password": "Str0ngPass!23"},
        format="json",
    )


def test_staff_can_list_patients(api_client, technician, patient):
    """Clinical staff can list patients with flattened profile fields."""
    _login(api_client, technician)
    response = api_client.get(reverse("accounts:patient-list"))
    assert response.status_code == 200

    body = response.json()
    assert "results" in body  # paginated
    assert body["count"] == 1
    row = body["results"][0]
    assert row["id"] == patient.id
    assert row["full_name"] == patient.get_full_name()
    assert row["mrn"] == patient.patient_profile.mrn


def test_patient_cannot_list_patients(api_client, patient):
    """A patient may not access the staff patient directory."""
    _login(api_client, patient)
    response = api_client.get(reverse("accounts:patient-list"))
    assert response.status_code == 403


def test_directory_requires_authentication(api_client):
    """The patient directory is not public."""
    response = api_client.get(reverse("accounts:patient-list"))
    assert response.status_code == 401


def test_search_by_name(api_client, technician, patient):
    """The ``?search=`` parameter matches on patient name."""
    other = User.objects.create_user(
        email="zoe@example.com",
        password="Str0ngPass!23",
        first_name="Zoe",
        last_name="Zephyr",
        role=UserRole.PATIENT,
    )
    PatientProfile.objects.create(
        user=other, date_of_birth=datetime.date(1988, 8, 8)
    )
    _login(api_client, technician)

    response = api_client.get(
        reverse("accounts:patient-list"), {"search": "Zephyr"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["count"] == 1
    assert body["results"][0]["id"] == other.id


def test_search_by_mrn(api_client, technician, patient):
    """The ``?search=`` parameter matches on MRN."""
    _login(api_client, technician)
    response = api_client.get(
        reverse("accounts:patient-list"),
        {"search": patient.patient_profile.mrn},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["count"] == 1
    assert body["results"][0]["id"] == patient.id
