import uuid

from django.conf import settings
from django.db import models

from apps.accounts.models import UserRole


class OrderPriority(models.TextChoices):
    """How urgently a test order should be processed."""

    ROUTINE = "routine", "Routine"
    STAT = "stat", "STAT"


class OrderStatus(models.TextChoices):
    """The lifecycle states a test order moves through."""

    ORDERED = "ordered", "Ordered"
    COLLECTED = "collected", "Specimen collected"
    IN_PROGRESS = "in_progress", "In progress"
    RESULTED = "resulted", "Resulted"
    VERIFIED = "verified", "Verified"
    CANCELLED = "cancelled", "Cancelled"


class TestOrder(models.Model):
    """A specific :class:`~directory.models.LabTest` ordered for a patient.

    This is the transactional instance of a catalog test: who ordered it, for
    whom, when the specimen was collected, and where it is in the workflow.
    """

    order_number = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="test_orders",
        limit_choices_to={"role": UserRole.PATIENT},
    )
    lab_test = models.ForeignKey(
        "directory.LabTest", on_delete=models.PROTECT, related_name="orders"
    )
    appointment = models.ForeignKey(
        "scheduling.Appointment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="test_orders",
    )
    ordered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="ordered_tests",
        limit_choices_to={"role": UserRole.DOCTOR},
    )
    priority = models.CharField(
        max_length=10, choices=OrderPriority.choices, default=OrderPriority.ROUTINE
    )
    status = models.CharField(
        max_length=20, choices=OrderStatus.choices, default=OrderStatus.ORDERED
    )
    collected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="collected_orders",
    )
    collected_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        """Return the order number, test code, and patient name."""
        return (
            f"{self.order_number} — {self.lab_test.code} "
            f"for {self.patient.get_full_name()}"
        )

    def save(self, *args, **kwargs):
        """Persist the order, assigning an order number on first save.

        The order number is a short human-quotable identifier (``ORD`` + 8 hex
        chars), distinct from the database PK.
        """
        if not self.order_number:
            self.order_number = f"ORD{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
