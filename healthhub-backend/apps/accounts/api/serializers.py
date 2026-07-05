from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from ..models import PatientProfile, StaffProfile, User
from ..services.auth_service import register_patient


class PatientProfileSerializer(serializers.ModelSerializer):
    """Read serializer for the patient-specific profile fields."""

    class Meta:
        model = PatientProfile
        fields = [
            "mrn",
            "date_of_birth",
            "sex",
            "address",
            "primary_doctor",
        ]
        read_only_fields = ["mrn"]


class StaffProfileSerializer(serializers.ModelSerializer):
    """Read serializer for the staff-specific profile fields."""

    class Meta:
        model = StaffProfile
        fields = [
            "employee_id",
            "job_title",
            "specialty",
            "license_number",
            "facility",
        ]
        read_only_fields = ["employee_id"]


class UserSerializer(serializers.ModelSerializer):
    """Read serializer for a user plus whichever profile matches their role.

    ``profile`` is populated from the patient or staff profile depending on the
    user's role, so the frontend gets one consistent shape from ``/auth/me``.
    """

    full_name = serializers.CharField(source="get_full_name", read_only=True)
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "phone",
            "profile",
        ]

    def get_profile(self, user):
        """Return the role-appropriate nested profile, or ``None``.

        Args:
            user: The ``User`` being serialized.

        Returns:
            A serialized patient or staff profile dict, or ``None`` when the
            matching profile does not exist (e.g. an admin account).
        """
        if user.is_patient and hasattr(user, "patient_profile"):
            return PatientProfileSerializer(user.patient_profile).data
        if user.is_clinical_staff and hasattr(user, "staff_profile"):
            return StaffProfileSerializer(user.staff_profile).data
        return None


class RegisterSerializer(serializers.ModelSerializer):
    """Validate and create a self-registering patient account.

    Only patients may self-register; staff accounts are provisioned by an
    administrator. The serializer creates the ``User`` and its
    :class:`~accounts.models.PatientProfile` atomically.
    """

    password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )
    date_of_birth = serializers.DateField(write_only=True)
    sex = serializers.ChoiceField(
        choices=PatientProfile._meta.get_field("sex").choices,
        required=False,
        write_only=True,
    )

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "first_name",
            "last_name",
            "phone",
            "date_of_birth",
            "sex",
        ]

    def validate_password(self, value):
        """Run Django's configured password validators on the raw password.

        Args:
            value: The submitted plaintext password.

        Returns:
            The validated password, unchanged.

        Raises:
            serializers.ValidationError: If the password fails any validator.
        """
        validate_password(value)
        return value

    def create(self, validated_data):
        """Create the patient user and profile via the accounts service.

        The actual creation logic lives in
        :func:`~accounts.services.auth_service.register_patient` so it can be
        reused and tested independently of the HTTP layer.

        Args:
            validated_data: Cleaned registration fields.

        Returns:
            The newly created ``User`` (role ``patient``).
        """
        return register_patient(validated_data)


class LoginSerializer(TokenObtainPairSerializer):
    """JWT login serializer that embeds the role and returns the user object.

    Extends SimpleJWT so the access token carries a ``role`` claim (handy for
    lightweight client-side gating) and the login response body includes the
    serialized user, saving the frontend a follow-up ``/auth/me`` call.
    """

    @classmethod
    def get_token(cls, user):
        """Build the JWT for ``user`` with a custom ``role`` claim added.

        Args:
            user: The authenticating ``User``.

        Returns:
            The refresh token (SimpleJWT derives the access token from it),
            with ``role`` embedded in the payload.
        """
        token = super().get_token(user)
        token["role"] = user.role
        return token

    def validate(self, attrs):
        """Authenticate and augment the token response with user detail.

        Args:
            attrs: The submitted credentials.

        Returns:
            The standard ``{access, refresh}`` payload plus a ``user`` key
            containing the serialized authenticated user.
        """
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
