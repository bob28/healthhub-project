from django.contrib import admin

from .models import ResultValue, TestOrder, TestResult


class ResultValueInline(admin.TabularInline):
    """Edit measured values inline on the TestResult admin page.

    The ``flag`` is read-only because it is computed from the analyte's
    reference range when the value is saved.
    """

    model = ResultValue
    extra = 1
    fields = ["analyte", "value", "flag"]
    readonly_fields = ["flag"]
    raw_id_fields = ["analyte"]


@admin.register(TestOrder)
class TestOrderAdmin(admin.ModelAdmin):
    """Admin for ordered tests and their workflow status."""

    list_display = [
        "order_number",
        "lab_test",
        "patient",
        "status",
        "priority",
        "ordered_by",
        "created_at",
    ]
    list_filter = ["status", "priority", "lab_test__category"]
    search_fields = ["order_number", "patient__email", "patient__last_name"]
    raw_id_fields = ["patient", "lab_test", "appointment", "ordered_by", "collected_by"]
    readonly_fields = ["order_number", "created_at"]
    date_hierarchy = "created_at"


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    """Admin for result sets, with measured values edited inline."""

    list_display = ["order", "status", "performed_by", "verified_by", "resulted_at"]
    list_filter = ["status"]
    search_fields = ["order__order_number"]
    raw_id_fields = ["order", "performed_by", "verified_by"]
    inlines = [ResultValueInline]


@admin.register(ResultValue)
class ResultValueAdmin(admin.ModelAdmin):
    """Admin for individual measured values (flag shown read-only)."""

    list_display = ["result", "analyte", "value", "flag"]
    list_filter = ["flag"]
    readonly_fields = ["flag"]
    raw_id_fields = ["result", "analyte"]
