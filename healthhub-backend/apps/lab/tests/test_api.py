"""Tests for the lab workflow API (orders → collection → results → verify)."""

from decimal import Decimal

import pytest
from django.urls import reverse

from apps.accounts.models import User, UserRole
from apps.directory.models import LabTest, TestAnalyte, TestCategory
from apps.lab.models import OrderStatus, ResultStatus, TestOrder
from apps.lab.services import result_service

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


@pytest.fixture
def cbc():
    """Return a CBC lab test with Hemoglobin (12–16) and WBC (4.5–11) analytes."""
    test = LabTest.objects.create(
        code="CBC", name="Complete Blood Count", category=TestCategory.HEMATOLOGY
    )
    TestAnalyte.objects.create(
        lab_test=test, name="Hemoglobin", unit="g/dL",
        ref_low=Decimal("12"), ref_high=Decimal("16"), display_order=0,
    )
    TestAnalyte.objects.create(
        lab_test=test, name="WBC", unit="10^9/L",
        ref_low=Decimal("4.5"), ref_high=Decimal("11"), display_order=1,
    )
    return test


def _login(api_client, user):
    """Authenticate the test client as ``user`` via the login cookie."""
    api_client.post(
        reverse("accounts:login"),
        {"email": user.email, "password": "Str0ngPass!23"},
        format="json",
    )


def _order(patient, cbc, **kwargs):
    """Create and return a TestOrder for ``patient`` and the CBC test."""
    return TestOrder.objects.create(patient=patient, lab_test=cbc, **kwargs)


def test_doctor_creates_order(api_client, doctor, patient, cbc):
    """A doctor can order a test for a patient."""
    _login(api_client, doctor)
    response = api_client.post(
        reverse("lab:order-list"),
        {"patient": patient.id, "lab_test": cbc.id},
        format="json",
    )
    assert response.status_code == 201
    body = response.json()
    assert body["patient"] == patient.id
    assert body["status"] == OrderStatus.ORDERED
    assert body["order_number"].startswith("ORD")
    assert body["result"] is None


def test_patient_cannot_create_order(api_client, patient, cbc):
    """Patients may not order tests."""
    _login(api_client, patient)
    response = api_client.post(
        reverse("lab:order-list"),
        {"patient": patient.id, "lab_test": cbc.id},
        format="json",
    )
    assert response.status_code == 403


def test_staff_collects_specimen(api_client, technician, patient, cbc):
    """A staff member advances the order to collected."""
    order = _order(patient, cbc)
    _login(api_client, technician)
    response = api_client.post(reverse("lab:order-collect", args=[order.id]))
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == OrderStatus.COLLECTED
    assert body["collected_by_name"] == technician.get_full_name()


def test_record_result_autoflags_values(api_client, technician, patient, cbc):
    """Recording values creates a preliminary result with auto-computed flags."""
    order = _order(patient, cbc, status=OrderStatus.COLLECTED)
    hgb, wbc = cbc.analytes.all()
    _login(api_client, technician)

    response = api_client.post(
        reverse("lab:order-result", args=[order.id]),
        {
            "notes": "Low hemoglobin",
            "values": [
                {"analyte": hgb.id, "value": "10.2"},  # below 12 -> low
                {"analyte": wbc.id, "value": "7.0"},   # in range -> normal
            ],
        },
        format="json",
    )
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == ResultStatus.PRELIMINARY
    flags = {v["analyte_name"]: v["flag"] for v in body["values"]}
    assert flags["Hemoglobin"] == "low"
    assert flags["WBC"] == "normal"

    order.refresh_from_db()
    assert order.status == OrderStatus.RESULTED


def test_record_result_rejects_foreign_analyte(api_client, technician, patient, cbc):
    """An analyte from another test is rejected."""
    other_test = LabTest.objects.create(
        code="LIPID", name="Lipid Panel", category=TestCategory.CHEMISTRY
    )
    foreign = TestAnalyte.objects.create(
        lab_test=other_test, name="LDL", unit="mg/dL"
    )
    order = _order(patient, cbc, status=OrderStatus.COLLECTED)
    _login(api_client, technician)

    response = api_client.post(
        reverse("lab:order-result", args=[order.id]),
        {"values": [{"analyte": foreign.id, "value": "100"}]},
        format="json",
    )
    assert response.status_code == 400


def test_patient_cannot_record_result(api_client, patient, cbc):
    """Patients may not record results."""
    order = _order(patient, cbc, status=OrderStatus.COLLECTED)
    hgb = cbc.analytes.first()
    _login(api_client, patient)
    response = api_client.post(
        reverse("lab:order-result", args=[order.id]),
        {"values": [{"analyte": hgb.id, "value": "13"}]},
        format="json",
    )
    assert response.status_code == 403


def test_doctor_verifies_result(api_client, doctor, technician, patient, cbc):
    """Verifying finalizes the result and marks the order verified."""
    order = _order(patient, cbc, status=OrderStatus.COLLECTED)
    hgb = cbc.analytes.first()
    result_service.record_result(
        order=order,
        performed_by=technician,
        values=[{"analyte": hgb, "value": Decimal("13")}],
    )
    _login(api_client, doctor)

    response = api_client.post(reverse("lab:order-verify", args=[order.id]))
    assert response.status_code == 200
    assert response.json()["status"] == ResultStatus.FINAL
    order.refresh_from_db()
    assert order.status == OrderStatus.VERIFIED


def test_technician_cannot_verify(api_client, technician, patient, cbc):
    """A technician may not verify results (doctor-only)."""
    order = _order(patient, cbc, status=OrderStatus.RESULTED)
    _login(api_client, technician)
    response = api_client.post(reverse("lab:order-verify", args=[order.id]))
    assert response.status_code == 403


def test_patient_sees_only_own_orders_with_results(
    api_client, doctor, technician, patient, cbc
):
    """A patient lists only their own orders, including nested results."""
    other = User.objects.create_user(
        email="bob@example.com", password="Str0ngPass!23",
        first_name="Bob", last_name="Other", role=UserRole.PATIENT,
    )
    mine = _order(patient, cbc, status=OrderStatus.COLLECTED)
    _order(other, cbc)
    hgb = cbc.analytes.first()
    result_service.record_result(
        order=mine, performed_by=technician,
        values=[{"analyte": hgb, "value": Decimal("9")}],
    )
    _login(api_client, patient)

    response = api_client.get(reverse("lab:order-list"))
    assert response.status_code == 200
    body = response.json()["results"]
    assert len(body) == 1
    assert body[0]["patient"] == patient.id
    assert body[0]["result"]["values"][0]["flag"] == "low"
