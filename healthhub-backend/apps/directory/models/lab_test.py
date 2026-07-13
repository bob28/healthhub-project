from decimal import Decimal

from django.db import models


class TestCategory(models.TextChoices):
    """The laboratory discipline a test belongs to."""

    HEMATOLOGY = "hematology", "Hematology"
    CHEMISTRY = "chemistry", "Chemistry"
    MICROBIOLOGY = "microbiology", "Microbiology"
    IMMUNOLOGY = "immunology", "Immunology"
    MOLECULAR = "molecular", "Molecular"
    PATHOLOGY = "pathology", "Pathology"


class SpecimenType(models.TextChoices):
    """The kind of sample a test is performed on."""

    BLOOD = "blood", "Blood"
    URINE = "urine", "Urine"
    SALIVA = "saliva", "Saliva"
    SWAB = "swab", "Swab"
    STOOL = "stool", "Stool"
    TISSUE = "tissue", "Tissue"
    OTHER = "other", "Other"


class ResultFlag(models.TextChoices):
    """How a measured value compares to its reference range.

    Lives here (rather than in the ``lab`` app) because the classification is a
    property of the analyte's reference range, and :meth:`TestAnalyte.classify`
    is what produces these values.
    """

    NORMAL = "normal", "Normal"
    LOW = "low", "Low"
    HIGH = "high", "High"
    CRITICAL_LOW = "critical_low", "Critical low"
    CRITICAL_HIGH = "critical_high", "Critical high"


class LabTest(models.Model):
    """A catalog entry describing an orderable test (e.g. a CBC).

    This is the *definition* — the menu item — not an instance ordered for a
    patient (that is ``lab.TestOrder``). A test is made up of one or more
    :class:`TestAnalyte` components, each with its own reference range.
    """

    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=20, choices=TestCategory.choices)
    specimen_type = models.CharField(
        max_length=20, choices=SpecimenType.choices, default=SpecimenType.BLOOD
    )
    description = models.TextField(blank=True)
    prep_instructions = models.TextField(blank=True)
    turnaround_hours = models.PositiveIntegerField(default=24)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        """Return the test code and name (e.g. ``CBC — Complete Blood Count``)."""
        return f"{self.code} — {self.name}"


class TestAnalyte(models.Model):
    """A single measured component of a :class:`LabTest`, with its range.

    A CBC, for example, has analytes for Hemoglobin, WBC, Platelets, etc. Each
    carries the reference bounds against which a measured value is classified.
    """

    lab_test = models.ForeignKey(
        LabTest, on_delete=models.CASCADE, related_name="analytes"
    )
    name = models.CharField(max_length=100)
    unit = models.CharField(max_length=30, blank=True)
    ref_low = models.DecimalField(
        max_digits=10, decimal_places=3, null=True, blank=True
    )
    ref_high = models.DecimalField(
        max_digits=10, decimal_places=3, null=True, blank=True
    )
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["lab_test", "name"], name="unique_analyte_per_test"
            )
        ]

    def __str__(self):
        """Return the analyte name with its unit and reference range."""
        rng = self.reference_range_display()
        return f"{self.name} ({rng})" if rng else self.name

    def reference_range_display(self):
        """Return the reference range as human-readable text.

        Returns:
            A string such as ``"12–16 g/dL"``, ``"< 5 mg/L"``, ``"> 40 U/L"``,
            or ``""`` when neither bound is set (a qualitative analyte).
        """
        unit = f" {self.unit}".rstrip() if self.unit else ""
        # Format through float so a DB Decimal("12.000") renders as "12", not
        # "12.000" (an in-memory Decimal("12") already would).
        low = f"{float(self.ref_low):g}" if self.ref_low is not None else None
        high = f"{float(self.ref_high):g}" if self.ref_high is not None else None
        if low is not None and high is not None:
            return f"{low}–{high}{unit}"
        if high is not None:
            return f"< {high}{unit}"
        if low is not None:
            return f"> {low}{unit}"
        return ""

    def classify(self, value):
        """Classify a measured value against this analyte's reference range.

        A value outside the range is "low"/"high"; a value that misses the
        range by more than the width of the range itself is escalated to
        "critical". Analytes with no bounds are always "normal" (qualitative).

        Args:
            value: The measured numeric value (``Decimal``/``int``/``float``).

        Returns:
            A :class:`ResultFlag` value describing where the value falls.
        """
        value = Decimal(str(value))
        low, high = self.ref_low, self.ref_high

        # Width of the reference interval, used as the "critical" margin.
        width = (high - low) if (low is not None and high is not None) else None

        if low is not None and value < low:
            if width is not None and value < low - width:
                return ResultFlag.CRITICAL_LOW
            return ResultFlag.LOW

        if high is not None and value > high:
            if width is not None and value > high + width:
                return ResultFlag.CRITICAL_HIGH
            return ResultFlag.HIGH

        return ResultFlag.NORMAL
