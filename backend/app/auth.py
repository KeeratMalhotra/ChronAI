"""Google OAuth token validation middleware."""

from typing import Optional

from fastapi import HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app.config import settings


async def verify_google_token(token: str) -> dict:
    """Verify a Google OAuth ID token and return user info.

    Args:
        token: The Google OAuth ID token to verify.

    Returns:
        Dictionary containing user information (sub, email, name, picture).

    Raises:
        HTTPException: If token validation fails.
    """
    try:
        id_info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )

        if id_info["iss"] not in [
            "accounts.google.com",
            "https://accounts.google.com",
        ]:
            raise ValueError("Invalid issuer.")

        return {
            "sub": id_info["sub"],
            "email": id_info.get("email", ""),
            "name": id_info.get("name", ""),
            "picture": id_info.get("picture", ""),
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {e}",
        )


async def get_current_user(auth_token: str) -> Optional[dict]:
    """Extract and validate user from auth token.

    Args:
        auth_token: The auth token from WebSocket or HTTP request.

    Returns:
        User info dict if valid, None if token is empty/missing.
    """
    if not auth_token:
        return None
    return await verify_google_token(auth_token)
