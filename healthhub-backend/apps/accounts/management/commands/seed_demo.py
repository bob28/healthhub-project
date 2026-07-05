"""Management command that seeds the database with realistic demo data.

Run with ``python manage.py seed_demo``. Idempotent: it uses ``get_or_create``
throughout, so re-running will not create duplicates. Intended for local
development and the deployed demo environment — never for real patient data.
"""

import datetime
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import (
    PatientProfile,
    PatientSex,
    StaffProfile,
    User,
    UserRole,
)
from apps.directory.models import (
    Facility,
    FacilityType,
    LabTest,
    SpecimenType,
    TestAnalyte,
    TestCategory,
)
from apps.lab.models import (
    OrderStatus,
    ResultStatus,
    ResultValue,
    TestOrder,
    TestResult,
)
from apps.scheduling.models import Appointment, AppointmentStatus

DEMO_PASSWORD = "HealthHub!23"

# Test catalog: each test maps to a list of (name, unit, ref_low, ref_high).
TEST_CATALOG = {
    "CBC": {
        "name": "Complete Blood Count",
        "category": TestCategory.HEMATOLOGY,
        "specimen": SpecimenType.BLOOD,
        "turnaround": 24,
        "price": Decimal("35.00"),
        "prep": "No special preparation required.",
        "analytes": [
            ("Hemoglobin", "g/dL", "12", "16"),
            ("Hematocrit", "%", "36", "48"),
            ("White Blood Cells", "10^9/L", "4.5", "11"),
            ("Platelets", "10^9/L", "150", "400"),
        ],
    },
    "LIPID": {
        "name": "Lipid Panel",
        "category": TestCategory.CHEMISTRY,
        "specimen": SpecimenType.BLOOD,
        "turnaround": 48,
        "price": Decimal("45.00"),
        "prep": "Fast for 9–12 hours before the test.",
        "analytes": [
            ("Total Cholesterol", "mg/dL", None, "200"),
            ("HDL Cholesterol", "mg/dL", "40", None),
            ("LDL Cholesterol", "mg/dL", None, "100"),
            ("Triglycerides", "mg/dL", None, "150"),
        ],
    },
    "BMP": {
        "name": "Basic Metabolic Panel",
        "category": TestCategory.CHEMISTRY,
        "specimen": SpecimenType.BLOOD,
        "turnaround": 24,
        "price": Decimal("40.00"),
        "prep": "Fast for 8 hours before the test.",
        "analytes": [
            ("Glucose", "mg/dL", "70", "99"),
            ("Sodium", "mmol/L", "135", "145"),
            ("Potassium", "mmol/L", "3.5", "5.0"),
            ("Creatinine", "mg/dL", "0.6", "1.3"),
        ],
    },
}


class Command(BaseCommand):
    """Seed demo facilities, a test catalog, one user per role, and a result."""

    help = "Populate the database with realistic demo data (idempotent)."

    @transaction.atomic
    def handle(self, *args, **options):
        """Create all demo records within a single transaction.

        Args:
            *args: Unused positional arguments from the command runner.
            **options: Parsed command-line options (none defined).
        """
        facilities = self._seed_facilities()
        tests = self._seed_catalog()
        staff = self._seed_staff(facilities["downtown"])
        patients = self._seed_patients(staff["doctor"])
        self._seed_sample_result(
            patient=patients["alice"],
            doctor=staff["doctor"],
            technician=staff["technician"],
            facility=facilities["downtown"],
            lab_test=tests["CBC"],
        )

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
        self._print_credentials()

    def _seed_facilities(self):
        """Create the demo facilities.

        Returns:
            A dict mapping short keys to :class:`~directory.models.Facility`.
        """
        downtown, _ = Facility.objects.get_or_create(
            name="HealthHub Downtown Lab",
            defaults={
                "facility_type": FacilityType.LAB,
                "address": "100 Main St, Springfield",
                "phone": "555-0100",
            },
        )
        clinic, _ = Facility.objects.get_or_create(
            name="Riverside Community Clinic",
            defaults={
                "facility_type": FacilityType.CLINIC,
                "address": "42 River Rd, Springfield",
                "phone": "555-0142",
            },
        )
        return {"downtown": downtown, "clinic": clinic}

    def _seed_catalog(self):
        """Create the lab-test catalog and each test's analytes.

        Returns:
            A dict mapping test code to :class:`~directory.models.LabTest`.
        """
        tests = {}
        for code, spec in TEST_CATALOG.items():
            test, _ = LabTest.objects.get_or_create(
                code=code,
                defaults={
                    "name": spec["name"],
                    "category": spec["category"],
                    "specimen_type": spec["specimen"],
                    "turnaround_hours": spec["turnaround"],
                    "price": spec["price"],
                    "prep_instructions": spec["prep"],
                },
            )
            for order, (name, unit, low, high) in enumerate(spec["analytes"]):
                TestAnalyte.objects.get_or_create(
                    lab_test=test,
                    name=name,
                    defaults={
                        "unit": unit,
                        "ref_low": Decimal(low) if low is not None else None,
                        "ref_high": Decimal(high) if high is not None else None,
                        "display_order": order,
                    },
                )
            tests[code] = test
        return tests

    def _seed_staff(self, facility):
        """Create one doctor, nurse, and technician assigned to a facility.

        Args:
            facility: The facility to assign each staff member to.

        Returns:
            A dict mapping role key to the created staff ``User``.
        """
        specs = {
            "doctor": ("doctor@healthhub.test", "Dana", "Reyes", UserRole.DOCTOR,
                       "Attending Physician", "Internal Medicine"),
            "nurse": ("nurse@healthhub.test", "Nina", "Okafor", UserRole.NURSE,
                      "Registered Nurse", ""),
            "technician": ("tech@healthhub.test", "Theo", "Kim",
                           UserRole.TECHNICIAN, "Lab Technician", ""),
        }
        staff = {}
        for key, (email, first, last, role, title, specialty) in specs.items():
            user = self._get_or_create_user(email, first, last, role)
            StaffProfile.objects.get_or_create(
                user=user,
                defaults={
                    "job_title": title,
                    "specialty": specialty,
                    "facility": facility,
                },
            )
            staff[key] = user
        return staff

    def _seed_patients(self, primary_doctor):
        """Create two demo patients with profiles.

        Args:
            primary_doctor: The doctor to set as each patient's PCP.

        Returns:
            A dict mapping patient key to the created patient ``User``.
        """
        specs = {
            "alice": ("patient@healthhub.test", "Alice", "Nguyen",
                      datetime.date(1990, 4, 12), PatientSex.FEMALE),
            "bob": ("bob@healthhub.test", "Bob", "Martin",
                    datetime.date(1978, 11, 3), PatientSex.MALE),
        }
        patients = {}
        for key, (email, first, last, dob, sex) in specs.items():
            user = self._get_or_create_user(email, first, last, UserRole.PATIENT)
            PatientProfile.objects.get_or_create(
                user=user,
                defaults={
                    "date_of_birth": dob,
                    "sex": sex,
                    "primary_doctor": primary_doctor,
                },
            )
            patients[key] = user
        return patients

    def _seed_sample_result(self, patient, doctor, technician, facility, lab_test):
        """Create a completed appointment, order, and verified result.

        Gives the demo a patient who already has a viewable result (with one
        out-of-range value) on first login.

        Args:
            patient: The patient the result belongs to.
            doctor: The ordering/verifying doctor.
            technician: The technician who performed the result.
            facility: The facility where the specimen was collected.
            lab_test: The :class:`~directory.models.LabTest` that was ordered.
        """
        appointment, _ = Appointment.objects.get_or_create(
            patient=patient,
            facility=facility,
            scheduled_at=timezone.now() - datetime.timedelta(days=2),
            defaults={
                "status": AppointmentStatus.COMPLETED,
                "referring_doctor": doctor,
                "reason": "Routine blood work",
            },
        )
        order, created = TestOrder.objects.get_or_create(
            patient=patient,
            lab_test=lab_test,
            appointment=appointment,
            defaults={
                "ordered_by": doctor,
                "status": OrderStatus.VERIFIED,
                "collected_by": technician,
                "collected_at": timezone.now() - datetime.timedelta(days=2),
            },
        )
        if not created:
            return

        result = TestResult.objects.create(
            order=order,
            performed_by=technician,
            verified_by=doctor,
            status=ResultStatus.FINAL,
            notes="Slightly low hemoglobin; recommend follow-up.",
        )
        # One deliberately low value (Hemoglobin 10.2 vs 12–16) to show flagging.
        sample_values = {
            "Hemoglobin": "10.2",
            "Hematocrit": "38",
            "White Blood Cells": "6.5",
            "Platelets": "250",
        }
        for analyte in lab_test.analytes.all():
            if analyte.name in sample_values:
                ResultValue.objects.create(
                    result=result,
                    analyte=analyte,
                    value=Decimal(sample_values[analyte.name]),
                )

    def _get_or_create_user(self, email, first_name, last_name, role):
        """Get or create a user with the demo password.

        Args:
            email: The account email (login).
            first_name: Given name.
            last_name: Family name.
            role: The :class:`~accounts.models.UserRole` to assign.

        Returns:
            The existing or newly created ``User``.
        """
        user = User.objects.filter(email=email).first()
        if user:
            return user
        return User.objects.create_user(
            email=email,
            password=DEMO_PASSWORD,
            first_name=first_name,
            last_name=last_name,
            role=role,
        )

    def _print_credentials(self):
        """Print the demo login credentials to the console."""
        self.stdout.write(f"\nDemo logins (password for all: {DEMO_PASSWORD}):")
        for label, email in [
            ("Patient", "patient@healthhub.test"),
            ("Doctor", "doctor@healthhub.test"),
            ("Nurse", "nurse@healthhub.test"),
            ("Technician", "tech@healthhub.test"),
        ]:
            self.stdout.write(f"  {label:<12} {email}")
