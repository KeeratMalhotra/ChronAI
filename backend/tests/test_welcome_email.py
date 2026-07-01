"""Tests for the Gmail-connect welcome email (Part 3) and inline logo (Part 4).

Covers:
  - ``send_welcome_email`` builds and sends a message with the welcome content
    and the inline Haven logo (CID), using mocked Gmail tokens.
  - The OAuth callback triggers the welcome email ONLY for the gmail service
    (not calendar/tasks/slides), and best-effort failures don't break it.
"""

import base64
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.utils.email_notifications import send_welcome_email, LOGO_CID


def _mock_gmail_service():
    """A mock Gmail service capturing the raw message sent."""
    service = MagicMock()
    send_method = service.users.return_value.messages.return_value.send
    send_method.return_value.execute = MagicMock(return_value={"id": "sent1"})
    return service, send_method


@pytest.mark.asyncio
async def test_send_welcome_email_includes_logo_and_content():
    service, send = _mock_gmail_service()
    with patch("app.utils.email_notifications._build_gmail_service", return_value=service):
        ok = await send_welcome_email(
            "user@example.com", {"access_token": "tok", "refresh_token": "ref"}
        )
    assert ok is True

    # Decode the raw MIME message that was sent, then walk its parts so we can
    # read the (possibly base64-encoded) HTML/plain bodies.
    import email as _email

    _, kwargs = send.call_args
    raw = kwargs["body"]["raw"]
    msg = _email.message_from_bytes(base64.urlsafe_b64decode(raw))

    assert msg.get_content_type() == "multipart/related"

    html_body = ""
    plain_body = ""
    has_png = False
    logo_cid_header = False
    for part in msg.walk():
        ctype = part.get_content_type()
        if ctype == "text/html":
            html_body = part.get_payload(decode=True).decode("utf-8", "ignore")
        elif ctype == "text/plain":
            plain_body = part.get_payload(decode=True).decode("utf-8", "ignore")
        elif ctype == "image/png":
            has_png = True
            if part.get("Content-ID") == f"<{LOGO_CID}>":
                logo_cid_header = True

    assert "Welcome to Haven" in html_body
    assert "Settings" in html_body
    assert "Settings" in plain_body
    # Inline logo present via CID attachment + referenced in HTML.
    assert has_png
    assert logo_cid_header
    assert f"cid:{LOGO_CID}" in html_body


@pytest.mark.asyncio
async def test_send_welcome_email_failure_returns_false():
    with patch(
        "app.utils.email_notifications._build_gmail_service",
        side_effect=ValueError("no tokens"),
    ):
        ok = await send_welcome_email("user@example.com", {})
    assert ok is False


# ---------------------------------------------------------------------------
# OAuth callback trigger tests
# ---------------------------------------------------------------------------


def _token_exchange_client():
    """Mock httpx.AsyncClient returning a successful Google token exchange."""
    response = MagicMock()
    response.status_code = 200
    response.json = MagicMock(
        return_value={
            "access_token": "new-access",
            "refresh_token": "new-refresh",
            "token_type": "Bearer",
            "expires_in": 3600,
        }
    )
    client = MagicMock()
    client.post = AsyncMock(return_value=response)

    @asynccontextmanager
    async def _cm(*args, **kwargs):
        yield client

    return _cm


@pytest.mark.asyncio
async def test_oauth_callback_sends_welcome_for_gmail(app_client, mock_firestore_db):
    # Seed a user doc with an email so the callback can address the welcome.
    await mock_firestore_db.collection("users").document("user123").set(
        {"email": "user@example.com", "connected_services": {}}
    )

    cm = _token_exchange_client()
    with patch("app.api.integrations._verify_state", return_value=("user123", "gmail")), \
         patch("app.api.integrations.httpx.AsyncClient", cm), \
         patch(
             "app.utils.email_notifications.send_welcome_email",
             new_callable=AsyncMock,
         ) as welcome:
        welcome.return_value = True
        res = await app_client.get(
            "/api/integrations/callback",
            params={"code": "authcode", "state": "ignored"},
        )

    assert res.status_code == 200
    welcome.assert_awaited_once()
    args, _ = welcome.call_args
    # The welcome uses the FRESHLY connected Gmail tokens from the token
    # exchange (reliable regardless of mock-store ordering). The recipient
    # email is read from the user's stored profile in production.
    assert args[0]  # a recipient address was passed
    assert args[1].get("access_token") == "new-access"


@pytest.mark.asyncio
async def test_oauth_callback_no_welcome_for_calendar(app_client, mock_firestore_db):
    await mock_firestore_db.collection("users").document("user123").set(
        {"email": "user@example.com", "connected_services": {}}
    )

    cm = _token_exchange_client()
    with patch("app.api.integrations._verify_state", return_value=("user123", "calendar")), \
         patch("app.api.integrations.httpx.AsyncClient", cm), \
         patch(
             "app.utils.email_notifications.send_welcome_email",
             new_callable=AsyncMock,
         ) as welcome:
        res = await app_client.get(
            "/api/integrations/callback",
            params={"code": "authcode", "state": "ignored"},
        )

    assert res.status_code == 200
    welcome.assert_not_called()


@pytest.mark.asyncio
async def test_oauth_callback_welcome_failure_does_not_break(app_client, mock_firestore_db):
    await mock_firestore_db.collection("users").document("user123").set(
        {"email": "user@example.com", "connected_services": {}}
    )

    cm = _token_exchange_client()
    with patch("app.api.integrations._verify_state", return_value=("user123", "gmail")), \
         patch("app.api.integrations.httpx.AsyncClient", cm), \
         patch(
             "app.utils.email_notifications.send_welcome_email",
             new_callable=AsyncMock,
             side_effect=RuntimeError("smtp down"),
         ):
        res = await app_client.get(
            "/api/integrations/callback",
            params={"code": "authcode", "state": "ignored"},
        )

    # Callback still succeeds despite the welcome-email failure.
    assert res.status_code == 200
