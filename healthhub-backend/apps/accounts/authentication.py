"""JWT authentication that reads the access token from an httpOnly cookie.

The frontend never sees the raw token (it lives in a cookie JavaScript cannot
read), which removes the XSS token-theft risk of storing JWTs in
``localStorage``. Requests are authenticated by the browser automatically
sending the cookie; CSRF is mitigated by a strict CORS allowlist plus the API
only accepting JSON (see ``config.settings``).
"""

from django.conf import settings
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
