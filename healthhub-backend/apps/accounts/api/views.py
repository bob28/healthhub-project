from django.conf import settings
from drf_spectacular.utils import extend_schema
from rest_framework import filters, generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from ..models import User, UserRole
from ..permissions import IsClinicalStaff
from .cookies import clear_auth_cookies, set_auth_cookies
from .serializers import (
    LoginSerializer,
    PatientListSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    """Register a new patient account.

    Public and rate-limited under the ``auth`` throttle scope. Creates the
    user and their patient profile, then returns the serialized user. Does not
    log the user in; the client follows up with a login call.
    """

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    @extend_schema(responses=UserSerializer, summary="Register a patient account")
    def create(self, request, *args, **kwargs):
        """Validate input, create the patient, and return the created user.

        Overridden so the response body is the read-oriented
        :class:`~accounts.api.serializers.UserSerializer` (including the nested
        profile) rather than the write-only registration fields.

        Args:
            request: The incoming DRF request carrying registration data.

        Returns:
            A ``201 Created`` response with the serialized new user.
        """
        write_serializer = self.get_serializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)
        user = write_serializer.save()
        headers = self.get_success_headers(write_serializer.data)
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class LoginView(TokenObtainPairView):
    """Log in by email and password, setting the JWTs as httpOnly cookies.

    The tokens are written to cookies rather than returned in the body, so the
    frontend never handles them directly. The response body carries only the
    authenticated user. Rate-limited under the ``auth`` throttle scope.
    """

    serializer_class = LoginSerializer
    throttle_scope = "auth"

    def post(self, request, *args, **kwargs):
        """Authenticate, then move the tokens from the body into cookies.

        Args:
            request: The incoming DRF request with credentials.

        Returns:
            A ``200`` response whose body is ``{"user": ...}`` and whose
            headers set the access and refresh cookies.
        """
        response = super().post(request, *args, **kwargs)
        access = response.data.pop("access")
        refresh = response.data.pop("refresh")
        set_auth_cookies(response, access=access, refresh=refresh)
        return response


class CookieTokenRefreshView(APIView):
    """Mint a fresh access token from the refresh-token cookie.

    Reads the refresh token from its httpOnly cookie (never the body), and,
    because refresh rotation is enabled, also rotates the refresh cookie.
    """

    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    @extend_schema(request=None, responses={200: None}, summary="Refresh access token")
    def post(self, request, *args, **kwargs):
        """Validate the refresh cookie and set new token cookies.

        Args:
            request: The incoming DRF request; the refresh token is read from
                the ``JWT_REFRESH_COOKIE`` cookie.

        Returns:
            A ``200`` response with refreshed cookies, or ``401`` when the
            refresh cookie is missing or invalid.
        """
        refresh = request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
        if not refresh:
            return Response(
                {"detail": "No refresh token cookie."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = TokenRefreshSerializer(data={"refresh": refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except InvalidToken:
            response = Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            return clear_auth_cookies(response)

        data = serializer.validated_data
        response = Response(status=status.HTTP_200_OK)
        set_auth_cookies(response, access=data["access"], refresh=data.get("refresh"))
        return response


class LogoutView(APIView):
    """Log out by clearing the auth cookies."""

    permission_classes = [permissions.AllowAny]

    @extend_schema(request=None, responses={200: None}, summary="Log out")
    def post(self, request, *args, **kwargs):
        """Clear the access and refresh cookies.

        Args:
            request: The incoming DRF request (unused).

        Returns:
            A ``200`` response that deletes both auth cookies.
        """
        response = Response({"detail": "Logged out."}, status=status.HTTP_200_OK)
        return clear_auth_cookies(response)


class MeView(generics.RetrieveAPIView):
    """Return the currently authenticated user and their profile."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Return the ``User`` making the request."""
        return self.request.user


class PatientViewSet(viewsets.ReadOnlyModelViewSet):
    """Staff-facing directory of patients (list + retrieve).

    Lets clinical staff find the patient they are booking an appointment or
    ordering a test for. Supports ``?search=`` across name, email, and MRN.
    Patients cannot access it (staff-only).
    """

    serializer_class = PatientListSerializer
    permission_classes = [permissions.IsAuthenticated, IsClinicalStaff]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "email", "patient_profile__mrn"]
    ordering_fields = ["last_name", "date_joined"]
    ordering = ["last_name", "first_name"]

    def get_queryset(self):
        """Return all patient users with their profile prefetched."""
        return User.objects.filter(role=UserRole.PATIENT).select_related(
            "patient_profile"
        )
