from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """Admin for patient appointments."""

    list_display = ["patient", "facility", "scheduled_at", "status", "referring_doctor"]
    list_filter = ["status", "facility"]
    search_fields = [
        "patient__email",
        "patient__first_name",
        "patient__last_name",
        "reason",
    ]
    raw_id_fields = ["patient", "facility", "referring_doctor"]
    date_hierarchy = "scheduled_at"
