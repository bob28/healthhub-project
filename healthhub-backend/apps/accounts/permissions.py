"""Reusable DRF permission classes keyed off :class:`accounts.models.UserRole`.
"""

from rest_framework.permissions import BasePermission

from .models import UserRole


class IsPatient(BasePermission):
    """Allow access only to authenticated patient accounts."""

    message = "Only patients may perform this action."

    def has_permission(self, request, view):
        """Return whether the requesting user is an authenticated patient."""
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.PATIENT
        )


class IsClinicalStaff(BasePermission):
    """Allow access to any authenticated doctor, nurse, or technician."""

    message = "Only clinical staff may perform this action."

    def has_permission(self, request, view):
        """Return whether the requesting user is authenticated clinical staff."""
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_clinical_staff
        )


class IsDoctor(BasePermission):
    """Allow access only to authenticated doctor accounts."""

    message = "Only doctors may perform this action."

    def has_permission(self, request, view):
        """Return whether the requesting user is an authenticated doctor."""
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.DOCTOR
        )
