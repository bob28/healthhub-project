from django.contrib import admin

from .models import Facility, LabTest, TestAnalyte


class TestAnalyteInline(admin.TabularInline):
    """Edit a lab test's analytes inline on the LabTest admin page."""

    model = TestAnalyte
    extra = 1
    fields = ["display_order", "name", "unit", "ref_low", "ref_high"]
    ordering = ["display_order"]


@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    """Admin for care/collection facilities."""

    list_display = ["name", "facility_type", "phone", "address"]
    list_filter = ["facility_type"]
    search_fields = ["name", "address"]


@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    """Admin for the orderable test catalog, with analytes edited inline."""

    list_display = [
        "code",
        "name",
        "category",
        "specimen_type",
        "turnaround_hours",
        "price",
        "is_active",
    ]
    list_filter = ["category", "specimen_type", "is_active"]
    search_fields = ["code", "name"]
    inlines = [TestAnalyteInline]


@admin.register(TestAnalyte)
class TestAnalyteAdmin(admin.ModelAdmin):
    """Admin for individual analytes and their reference ranges."""

    list_display = ["name", "lab_test", "unit", "ref_low", "ref_high", "display_order"]
    list_filter = ["lab_test__category"]
    search_fields = ["name", "lab_test__code", "lab_test__name"]
    raw_id_fields = ["lab_test"]
