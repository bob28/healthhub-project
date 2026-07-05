from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.accounts.models import UserRole
from apps.directory.models import ResultFlag

from .order import TestOrder


class ResultStatus(models.TextChoices):
    """The reporting state of a result set."""

    PRELIMINARY = "preliminary", "Preliminary"
    FINAL = "final", "Final"
    CORRECTED = "corrected", "Corrected"


class TestResult(models.Model):
    """The result set for a single :class:`~lab.models.TestOrder` (1:1).

    Holds reporting-level metadata — who performed and verified the result and
    its reporting status — while the individual measured numbers live in the
    related :class:`ResultValue` rows.
    """

    order = models.OneToOneField(
        TestOrder, on_delete=models.CASCADE, related_name="result"
    )
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="performed_results",
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_results",
        limit_choices_to={"role": UserRole.DOCTOR},
    )
    status = models.CharField(
        max_length=20,
        choices=ResultStatus.choices,
        default=ResultStatus.PRELIMINARY,
    )
    resulted_at = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True)

    def __str__(self):
        """Return the order number and reporting status of this result."""
        return f"Result for {self.order.order_number} ({self.get_status_display()})"


class ResultValue(models.Model):
    """One measured value for one analyte within a :class:`TestResult`.

    The flag is derived automatically from the analyte's reference range on
    save, so callers only supply the raw number.
    """

    result = models.ForeignKey(
        TestResult, on_delete=models.CASCADE, related_name="values"
    )
    analyte = models.ForeignKey(
        "directory.TestAnalyte", on_delete=models.PROTECT, related_name="values"
    )
    value = models.DecimalField(max_digits=10, decimal_places=3)
    flag = models.CharField(
        max_length=20, choices=ResultFlag.choices, default=ResultFlag.NORMAL
    )

    class Meta:
        ordering = ["analyte__display_order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["result", "analyte"], name="unique_value_per_analyte"
            )
        ]

    def __str__(self):
        """Return the analyte name, value, unit, and flag."""
        unit = f" {self.analyte.unit}" if self.analyte.unit else ""
        return f"{self.analyte.name}: {self.value:g}{unit} [{self.get_flag_display()}]"

    def save(self, *args, **kwargs):
        """Persist the value, auto-classifying its flag against the range.

        Delegates to :meth:`~directory.models.TestAnalyte.classify` so that the
        normal/low/high/critical determination lives with the reference range
        that defines it, keeping this model a thin record of the measurement.
        """
        if self.analyte_id and self.value is not None:
            self.flag = self.analyte.classify(self.value)
        super().save(*args, **kwargs)
