from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from .managers import UserManager


class UserRole(models.TextChoices):
    """The mutually exclusive roles a user account can hold."""

    PATIENT = "patient", "Patient"
    DOCTOR = "doctor", "Doctor"
    NURSE = "nurse", "Nurse"
    TECHNICIAN = "technician", "Technician"
    ADMIN = "admin", "Admin"


class User(AbstractBaseUser, PermissionsMixin):
    """The single authentication model for every HealthHub actor.

    Rather than a separate table (and password) per role, HealthHub has one
    ``User`` with a ``role`` discriminator. Role-specific data lives in the
    1:1 profile models (:class:`~accounts.models.PatientProfile`,
    :class:`~accounts.models.StaffProfile`).

    Login is by email (``USERNAME_FIELD = "email"``); there is no username.
    """

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(
        max_length=20, choices=UserRole.choices, default=UserRole.PATIENT
    )
    phone = models.CharField(max_length=20, blank=True)

    # ``is_staff`` gates access to the Django admin, not clinical staff status.
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self):
        """Return a human-readable identifier for admin lists and logs."""
        return f"{self.get_full_name()} <{self.email}> ({self.role})"

    def get_full_name(self):
        """Return the user's full name (first + last), whitespace-trimmed."""
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        """Return the user's short (first) name, used by Django internals."""
        return self.first_name

    @property
    def is_patient(self):
        """Whether this account is a patient."""
        return self.role == UserRole.PATIENT

    @property
    def is_clinical_staff(self):
        """Whether this account is a doctor, nurse, or technician.

        Distinct from ``is_staff`` (Django admin access): a clinician can act
        on orders and results without being a Django admin.
        """
        return self.role in {
            UserRole.DOCTOR,
            UserRole.NURSE,
            UserRole.TECHNICIAN,
        }
