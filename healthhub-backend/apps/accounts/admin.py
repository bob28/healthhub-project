from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import PatientProfile, StaffProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin for the custom email-based user model.

    Reconfigures Django's ``UserAdmin`` (which assumes a ``username`` field)
    to work with email login and the ``role`` discriminator.
    """

    ordering = ["email"]
    list_display = ["email", "get_full_name", "role", "is_active", "is_staff"]
    list_filter = ["role", "is_active", "is_staff"]
    search_fields = ["email", "first_name", "last_name"]
    readonly_fields = ["date_joined", "last_login"]

    fieldsets = [
        (None, {"fields": ["email", "password"]}),
        ("Personal", {"fields": ["first_name", "last_name", "phone"]}),
        (
            "Role & access",
            {"fields": ["role", "is_active", "is_staff", "is_superuser"]},
        ),
        ("Permissions", {"fields": ["groups", "user_permissions"]}),
        ("Timestamps", {"fields": ["date_joined", "last_login"]}),
    ]
    add_fieldsets = [
        (
            None,
            {
                "classes": ["wide"],
                "fields": [
                    "email",
                    "first_name",
                    "last_name",
                    "role",
                    "password1",
                    "password2",
                ],
            },
        ),
    ]


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    """Admin for patient profiles, keyed by MRN and name."""

    list_display = ["mrn", "user", "date_of_birth", "sex", "primary_doctor"]
    search_fields = ["mrn", "user__email", "user__first_name", "user__last_name"]
    list_filter = ["sex"]
    raw_id_fields = ["user", "primary_doctor"]


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    """Admin for staff profiles, keyed by employee ID and name."""

    list_display = ["employee_id", "user", "job_title", "specialty", "facility"]
    search_fields = [
        "employee_id",
        "user__email",
        "user__first_name",
        "user__last_name",
    ]
    list_filter = ["facility"]
    raw_id_fields = ["user"]
