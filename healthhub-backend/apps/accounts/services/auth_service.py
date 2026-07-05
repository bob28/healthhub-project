"""Domain operations for account creation and authentication."""

from django.db import transaction

from ..models import PatientProfile, User, UserRole


@transaction.atomic
def register_patient(data):
    """Create a patient ``User`` and their ``PatientProfile`` atomically.

    The user and profile are created together so a failure in either rolls
    back both — a patient must never exist without a profile.

    Args:
        data: A mapping of validated registration fields. Recognised keys:
            ``email``, ``password``, ``first_name``, ``last_name``,
            ``date_of_birth`` (required); ``phone``, ``sex`` (optional). Any
            remaining keys are passed through to ``User`` creation.

    Returns:
        The newly created patient ``User``.
    """
    data = dict(data)
    password = data.pop("password")
    profile_fields = {"date_of_birth": data.pop("date_of_birth")}
    if "sex" in data:
        profile_fields["sex"] = data.pop("sex")

    user = User.objects.create_user(
        password=password, role=UserRole.PATIENT, **data
    )
    PatientProfile.objects.create(user=user, **profile_fields)
    return user
