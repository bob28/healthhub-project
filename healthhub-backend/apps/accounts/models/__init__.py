"""Accounts models package.

Re-exports every model and choices enum so the rest of the codebase can keep
importing from ``accounts.models`` regardless of how the package is split
internally (``from accounts.models import User``).
"""

from .managers import UserManager
from .profiles import PatientProfile, PatientSex, StaffProfile
from .user import User, UserRole

__all__ = [
    "UserManager",
    "User",
    "UserRole",
    "PatientProfile",
    "PatientSex",
    "StaffProfile",
]
