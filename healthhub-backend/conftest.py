"""Shared pytest fixtures for the HealthHub backend test suite."""

import datetime

import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.accounts.models import PatientProfile, User, UserRole


@pytest.fixture(autouse=True)
def _test_environment(settings):
    """Relax production-only hardening that interferes with the test client.

    Tests run with ``DEBUG=False``, which enables ``SECURE_SSL_REDIRECT`` and
    the manifest static-files storage. The former turns plain-HTTP test
    requests into 301 redirects; the latter warns when ``collectstatic`` has
    not run. Neither is relevant to the behaviour under test, so disable them.

    Also clears the cache before each test: DRF's rate-limit counters live in
    the cache, and without a reset the many logins across the suite would trip
    the ``auth`` throttle and fail later tests.

    Args:
        settings: pytest-django's settings-override fixture.
    """
    settings.SECURE_SSL_REDIRECT = False
    settings.STORAGES = {
        **settings.STORAGES,
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"
        },
    }
    cache.clear()


@pytest.fixture
def api_client():
    """Return an unauthenticated DRF API test client."""
    return APIClient()


@pytest.fixture
def patient(db):
    """Create and return a patient user with a profile.

    Args:
        db: pytest-django's database-access fixture.

    Returns:
        A persisted patient ``User`` with a related ``PatientProfile``.
    """
    user = User.objects.create_user(
        email="pat@example.com",
        password="Str0ngPass!23",
        first_name="Pat",
        last_name="Patient",
        role=UserRole.PATIENT,
    )
    PatientProfile.objects.create(
        user=user, date_of_birth=datetime.date(1990, 1, 1)
    )
    return user


@pytest.fixture
def doctor(db):
    """Create and return a doctor user (no profile required for tests)."""
    return User.objects.create_user(
        email="doc@example.com",
        password="Str0ngPass!23",
        first_name="Dana",
        last_name="Doctor",
        role=UserRole.DOCTOR,
    )
