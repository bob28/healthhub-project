from django.db import models


class FacilityType(models.TextChoices):
    """The kind of physical site where care or specimen collection happens."""

    HOSPITAL = "hospital", "Hospital"
    CLINIC = "clinic", "Clinic"
    LAB = "lab", "Lab"


class Facility(models.Model):
    """A physical location: a hospital, clinic, or lab.

    Was called ``Provider`` in the original schema — renamed because it models
    a *place*, not a clinician. Appointments happen at a facility and staff are
    assigned to one.
    """

    name = models.CharField(max_length=150)
    facility_type = models.CharField(
        max_length=20, choices=FacilityType.choices, default=FacilityType.LAB
    )
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "facilities"

    def __str__(self):
        """Return the facility name and type for admin/reference displays."""
        return f"{self.name} ({self.get_facility_type_display()})"
