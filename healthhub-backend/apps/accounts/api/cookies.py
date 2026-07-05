"""Helpers for writing and clearing the JWT auth cookies on a response.

Centralising the cookie flags (httpOnly, Secure, SameSite, lifetimes) here
keeps the login/refresh/logout views consistent and makes the security posture
easy to audit in one place.
"""

from django.conf import settings


def _common_cookie_kwargs():
    """Return the shared keyword args applied to every auth cookie.

    Returns:
        A dict of cookie flags derived from settings: ``httponly`` is always
        on; ``secure``/``samesite``/``domain`` are environment-driven so local
        dev (HTTP, same-site) and production (HTTPS, cross-site) both work.
    """
    return {
        "httponly": True,
        "secure": settings.JWT_COOKIE_SECURE,
        "samesite": settings.JWT_COOKIE_SAMESITE,
        "domain": settings.JWT_COOKIE_DOMAIN,
        "path": "/",
    }


def set_auth_cookies(response, access=None, refresh=None):
    """Attach the access and/or refresh JWTs to a response as httpOnly cookies.

    Each cookie's ``max_age`` matches the corresponding token lifetime so the
    browser expires it in step with the token.

    Args:
        response: The DRF/Django response to mutate.
        access: The access token to set, or ``None`` to leave it unchanged.
        refresh: The refresh token to set, or ``None`` to leave it unchanged.

    Returns:
        The same response, for chaining.
    """
    common = _common_cookie_kwargs()
    if access is not None:
        response.set_cookie(
            settings.JWT_ACCESS_COOKIE,
            access,
            max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
            **common,
        )
    if refresh is not None:
        response.set_cookie(
            settings.JWT_REFRESH_COOKIE,
            refresh,
            max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
            **common,
        )
    return response


def clear_auth_cookies(response):
    """Delete both auth cookies from the client (used on logout).

    Args:
        response: The response to mutate.

    Returns:
        The same response, for chaining.
    """
    domain = settings.JWT_COOKIE_DOMAIN
    response.delete_cookie(settings.JWT_ACCESS_COOKIE, path="/", domain=domain)
    response.delete_cookie(settings.JWT_REFRESH_COOKIE, path="/", domain=domain)
    return response
