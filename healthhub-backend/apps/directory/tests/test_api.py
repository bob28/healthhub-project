"""Tests for the directory API (facilities + test catalog)."""

from decimal import Decimal

import pytest
from django.urls import reverse

from apps.directory.models import (
    Facility,
    FacilityType,
    LabTest,
    TestAnalyte,
    TestCategory,
)

pytestmark = pytest.mark.django_db


def _login(api_client, user):
    """Log a user in so the test client carries the auth cookie.

    Args:
        api_client: The DRF test client.
        user: The user to authenticate (created with the shared password).
    """
    api_client.post(
        reverse("accounts:login"),
        {"email": user.email, "password": "Str0ngPass!23"},
        format="json",
    )


def test_facilities_require_authentication(api_client):
    """Listing facilities without a session returns 401."""
    response = api_client.get(reverse("directory:facility-list"))
    assert response.status_code == 401


def test_list_facilities(api_client, patient):
    """An authenticated user can list facilities with display labels."""
    Facility.objects.create(
        name="Downtown Lab", facility_type=FacilityType.LAB
    )
    _login(api_client, patient)

    response = api_client.get(reverse("directory:facility-list"))
    assert response.status_code == 200
    body = response.json()["results"]
    assert len(body) == 1
    assert body[0]["name"] == "Downtown Lab"
    assert body[0]["facility_type_display"] == "Lab"


def test_lab_test_list_includes_analytes_and_hides_inactive(api_client, patient):
    """The catalog lists active tests with nested analytes; inactive are hidden."""
    cbc = LabTest.objects.create(
        code="CBC", name="Complete Blood Count", category=TestCategory.HEMATOLOGY
    )
    TestAnalyte.objects.create(
        lab_test=cbc,
        name="Hemoglobin",
        unit="g/dL",
        ref_low=Decimal("12"),
        ref_high=Decimal("16"),
    )
    LabTest.objects.create(
        code="OLD", name="Retired Test", category=TestCategory.CHEMISTRY,
        is_active=False,
    )
    _login(api_client, patient)

    response = api_client.get(reverse("directory:lab-test-list"))
    assert response.status_code == 200
    body = response.json()["results"]
    assert len(body) == 1
    assert body[0]["code"] == "CBC"
    assert body[0]["analytes"][0]["name"] == "Hemoglobin"
    assert body[0]["analytes"][0]["reference_range"] == "12–16 g/dL"


def test_lab_test_filter_by_category(api_client, patient):
    """The ``?category=`` query parameter narrows the catalog."""
    LabTest.objects.create(
        code="CBC", name="Complete Blood Count", category=TestCategory.HEMATOLOGY
    )
    LabTest.objects.create(
        code="LIPID", name="Lipid Panel", category=TestCategory.CHEMISTRY
    )
    _login(api_client, patient)

    response = api_client.get(
        reverse("directory:lab-test-list"), {"category": "chemistry"}
    )
    assert response.status_code == 200
    body = response.json()["results"]
    assert len(body) == 1
    assert body[0]["code"] == "LIPID"
