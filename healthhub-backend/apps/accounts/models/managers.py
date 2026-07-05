from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    """Manager for the custom email-based :class:`~accounts.models.User`.

    Django's default ``UserManager`` assumes a ``username`` field. HealthHub
    logs users in by email, so this manager reimplements the creation helpers
    to require an email instead and to hash the password on the way in.
    """

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create, hash-and-save, and return a user (shared internal helper).

        Args:
            email: The user's email address; used as the login identifier.
                Required — a falsy value raises ``ValueError``.
            password: Raw password. Hashed via ``set_password`` before saving;
                may be ``None`` to create an unusable password.
            **extra_fields: Any other ``User`` model fields (e.g. ``role``,
                ``first_name``, ``is_staff``).

        Returns:
            The freshly created and persisted ``User`` instance.

        Raises:
            ValueError: If ``email`` is empty.
        """
        if not email:
            raise ValueError("Users must have an email address.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create a standard (non-privileged) user.

        Defaults ``is_staff`` and ``is_superuser`` to ``False`` so callers
        cannot accidentally create a privileged account through this path.

        Args:
            email: The user's email address.
            password: Raw password (optional).
            **extra_fields: Additional ``User`` fields.

        Returns:
            The created ``User`` instance.
        """
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create a Django admin superuser.

        Forces the privileged flags on and assigns the ``admin`` role, then
        validates that the flags were not overridden to invalid values by the
        caller.

        Args:
            email: The superuser's email address.
            password: Raw password.
            **extra_fields: Additional ``User`` fields.

        Returns:
            The created superuser ``User`` instance.

        Raises:
            ValueError: If ``is_staff`` or ``is_superuser`` is explicitly set
                to anything other than ``True``.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)
