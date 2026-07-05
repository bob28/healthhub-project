"""Tests for the registration, login, and current-user endpoints."""

import pytest
from django.urls import reverse

from apps.accounts.models import PatientProfile, User, UserRole

pytestmark = pytest.mark.django_db


def _valid_registration_payload(**overrides):
    """Return a valid patient registration payload, applying any overrides.

    Args:
        **overrides: Field values to replace in the base payload.

    Returns:
        A dict suitable for POSTing to the register endpoint.
    """
    payload = {
        "email": "new@example.com",
        "password": "Str0ngPass!23",
        "first_name": "New",
        "last_name": "Patient",
        "date_of_birth": "1995-06-15",
        "sex": "female",
    }
    payload.update(overrides)
    return payload


def test_register_creates_patient_with_hashed_password_and_profile(api_client):
    """Registering returns 201 and creates a patient, profile, and MRN."""
    response = api_client.post(
        reverse("accounts:register"), _valid_registration_payload(), format="json"
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "new@example.com"
    assert body["role"] == UserRole.PATIENT
    assert body["profile"]["mrn"].startswith("HH")

    user = User.objects.get(email="new@example.com")
    assert user.role == UserRole.PATIENT
    # Password must be stored hashed, never in plaintext.
    assert user.password != "Str0ngPass!23"
    assert user.check_password("Str0ngPass!23")
    assert PatientProfile.objects.filter(user=user).exists()


def test_register_rejects_duplicate_email(api_client, patient):
    """A second registration with an existing email is rejected with 400."""
    response = api_client.post(
        reverse("accounts:register"),
        _valid_registration_payload(email=patient.email),
        format="json",
    )
    assert response.status_code == 400
    assert "email" in response.json()


def test_register_rejects_weak_password(api_client):
    """A password that fails Django's validators is rejected with 400."""
    response = api_client.post(
        reverse("accounts:register"),
        _valid_registration_payload(password="123"),
        format="json",
    )
    assert response.status_code == 400
    assert "password" in response.json()


def test_login_sets_httponly_cookies_and_returns_user(api_client, patient):
    """Login sets httpOnly JWT cookies and returns only the user in the body."""
    response = api_client.post(
        reverse("accounts:login"),
        {"email": patient.email, "password": "Str0ngPass!23"},
        format="json",
    )
    assert response.status_code == 200

    # Tokens are delivered as cookies, not in the response body.
    body = response.json()
    assert "access" not in body
    assert "refresh" not in body
    assert body["user"]["role"] == UserRole.PATIENT
    assert body["user"]["email"] == patient.email

    access_cookie = response.cookies["hh_access"]
    refresh_cookie = response.cookies["hh_refresh"]
    assert access_cookie.value
    assert refresh_cookie.value
    assert access_cookie["httponly"] is True
    assert refresh_cookie["httponly"] is True


def test_login_rejects_bad_credentials(api_client, patient):
    """An incorrect password returns 401 and no tokens."""
    response = api_client.post(
        reverse("accounts:login"),
        {"email": patient.email, "password": "wrong-password"},
        format="json",
    )
    assert response.status_code == 401


def test_me_requires_authentication(api_client):
    """The current-user endpoint returns 401 without a token."""
    response = api_client.get(reverse("accounts:me"))
    assert response.status_code == 401


def test_me_returns_authenticated_user_via_cookie(api_client, patient):
    """After login, the auth cookie authenticates /auth/me automatically."""
    api_client.post(
        reverse("accounts:login"),
        {"email": patient.email, "password": "Str0ngPass!23"},
        format="json",
    )
    # No manual Authorization header: the test client resends the login cookies.
    response = api_client.get(reverse("accounts:me"))
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == patient.email
    assert body["profile"]["date_of_birth"] == "1990-01-01"


def test_logout_clears_auth_cookies(api_client, patient):
    """Logging out deletes both auth cookies."""
    api_client.post(
        reverse("accounts:login"),
        {"email": patient.email, "password": "Str0ngPass!23"},
        format="json",
    )
    response = api_client.post(reverse("accounts:logout"))
    assert response.status_code == 200
    # A deleted cookie is sent back with an empty value.
    assert response.cookies["hh_access"].value == ""
    assert response.cookies["hh_refresh"].value == ""


def test_refresh_issues_new_access_cookie(api_client, patient):
    """The refresh endpoint mints a new access cookie from the refresh cookie."""
    api_client.post(
        reverse("accounts:login"),
        {"email": patient.email, "password": "Str0ngPass!23"},
        format="json",
    )
    response = api_client.post(reverse("accounts:token-refresh"))
    assert response.status_code == 200
    assert response.cookies["hh_access"].value


def test_refresh_without_cookie_is_rejected(api_client):
    """Refresh returns 401 when no refresh cookie is present."""
    response = api_client.post(reverse("accounts:token-refresh"))
    assert response.status_code == 401
