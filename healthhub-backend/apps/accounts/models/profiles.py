import uuid

from django.db import models

from .user import User, UserRole


class PatientSex(models.TextChoices):
    """Administrative sex recorded for a patient."""

    FEMALE = "female", "Female"
    MALE = "male", "Male"
    OTHER = "other", "Other"
    UNKNOWN = "unknown", "Unknown"


class PatientProfile(models.Model):
    """Patient-specific detail hanging off a patient :class:`~accounts.models.User`.

    Holds the clinical/demographic fields that only apply to patients, plus a
    human-facing medical record number (MRN) distinct from the database PK.
    """

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="patient_profile"
    )
    mrn = models.CharField("medical record number", max_length=20, unique=True)
    date_of_birth = models.DateField()
    sex = models.CharField(
        max_length=10, choices=PatientSex.choices, default=PatientSex.UNKNOWN
    )
    address = models.CharField(max_length=255, blank=True)
    primary_doctor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="patients",
        limit_choices_to={"role": UserRole.DOCTOR},
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Return the patient's name and MRN for admin/reporting displays."""
        return f"{self.user.get_full_name()} — {self.mrn}"

    def save(self, *args, **kwargs):
        """Persist the profile, assigning an MRN on first save if absent.

        The MRN is a short, collision-resistant, human-quotable identifier
        (``HH`` + 8 hex chars). Generating it here keeps the database's unique
        constraint authoritative while freeing callers from supplying one.
        """
        if not self.mrn:
            self.mrn = f"HH{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class StaffProfile(models.Model):
    """Employment detail for a clinical staff :class:`~accounts.models.User`.

    Applies to doctors, nurses, and technicians. Captures the credentials and
    facility assignment that patients never have.
    """

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="staff_profile"
    )
    employee_id = models.CharField(max_length=20, unique=True)
    job_title = models.CharField(max_length=100, blank=True)
    specialty = models.CharField(max_length=100, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    facility = models.ForeignKey(
        "directory.Facility",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="staff",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Return the staff member's name, role, and employee ID."""
        return f"{self.user.get_full_name()} ({self.user.role}) — {self.employee_id}"

    def save(self, *args, **kwargs):
        """Persist the profile, assigning an employee ID on first save.

        Mirrors :meth:`PatientProfile.save`: generates an ``EMP`` + 8 hex
        identifier when one is not supplied so the unique constraint holds.
        """
        if not self.employee_id:
            self.employee_id = f"EMP{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
