"""JWT authentication that reads the access token from an httpOnly cookie.

The frontend never sees the raw token (it lives in a cookie JavaScript cannot
read), which removes the XSS token-theft risk of storing JWTs in
``localStorage``. Requests are authenticated by the browser automatically
sending the cookie; CSRF is mitigated by a strict CORS allowlist plus the API
only accepting JSON (see ``config.settings``).
"""

from django.conf import settings
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticate via the access-token cookie, or the ``Authorization`` header.

    The header path is kept as a fallback so API tooling (Swagger, curl,
    integration tests) can still authenticate with a bearer token; browsers
    use the cookie set at login.
    """

    def authenticate(self, request):
        """Resolve and validate the access token for the request.

        Prefers a standard ``Authorization: Bearer`` header when present,
        otherwise falls back to the httpOnly access-token cookie.

        Args:
            request: The incoming DRF request.

        Returns:
            A ``(user, validated_token)`` tuple when a valid token is found,
            or ``None`` when no token is present (letting other authenticators
            or the permission layer decide).
        """
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
        else:
            raw_token = request.COOKIES.get(settings.JWT_ACCESS_COOKIE)

        if not raw_token:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token


class CookieJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    """Teach drf-spectacular to document the cookie-based JWT auth.

    Without this, the generated OpenAPI schema can't describe how requests are
    authenticated (it only understands header schemes out of the box). This
    registers the access-token cookie as an ``apiKey`` security scheme so the
    Swagger docs are accurate.
    """

    target_class = "apps.accounts.authentication.CookieJWTAuthentication"
    name = "cookieAuth"

    def get_security_definition(self, auto_schema):
        """Describe the auth as the httpOnly access-token cookie."""
        return {
            "type": "apiKey",
            "in": "cookie",
            "name": settings.JWT_ACCESS_COOKIE,
        }
