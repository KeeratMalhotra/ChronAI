"""Email notification utilities for Haven.

Provides reusable functions for sending formatted HTML emails via Gmail API,
including task deadline reminders, daily digest summaries, and weekly reviews.
"""

import asyncio
import base64
import html
import logging
import re
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from functools import lru_cache
from pathlib import Path

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.config import settings

logger = logging.getLogger(__name__)

# Content-ID used to embed the Haven logo inline in every email. Templates
# reference it via <img src="cid:havenlogo">. Using an inline CID attachment
# (rather than a remote URL) means the logo renders without the recipient
# having to "load remote images".
LOGO_CID = "havenlogo"

# Path to the committed PNG rendering of frontend/app/icon.svg.
_LOGO_PATH = Path(__file__).resolve().parent.parent / "assets" / "haven_logo.png"


@lru_cache(maxsize=1)
def _load_logo_bytes() -> bytes | None:
    """Load the Haven logo PNG once and cache it for the process lifetime.

    Returns:
        The PNG bytes, or None if the asset is missing/unreadable (emails still
        send fine without the inline logo).
    """
    try:
        return _LOGO_PATH.read_bytes()
    except Exception as e:
        logger.warning("Could not load Haven logo asset at %s: %s", _LOGO_PATH, e)
        return None


def _build_logo_mime() -> MIMEImage | None:
    """Build the inline-logo MIMEImage part (Content-ID = <havenlogo>).

    Returns:
        A MIMEImage ready to attach to a ``MIMEMultipart("related")`` message,
        or None when the logo asset is unavailable.
    """
    data = _load_logo_bytes()
    if not data:
        return None
    image = MIMEImage(data, _subtype="png")
    image.add_header("Content-ID", f"<{LOGO_CID}>")
    image.add_header("Content-Disposition", "inline", filename="haven_logo.png")
    return image


def _attach_logo(related_msg: MIMEMultipart) -> str | None:
    """Attach the inline Haven logo to a ``related`` multipart message.

    Args:
        related_msg: A ``MIMEMultipart("related")`` message.

    Returns:
        The CID string to reference in HTML (``havenlogo``), or None if the
        logo asset could not be loaded.
    """
    image = _build_logo_mime()
    if image is None:
        return None
    related_msg.attach(image)
    return LOGO_CID


# Reusable HTML snippet placing the logo image next to the "Haven" wordmark.
# Falls back gracefully to just the wordmark if the image can't be shown.
_LOGO_HTML = (
    f'<div class="logo">'
    f'<img src="cid:{LOGO_CID}" width="28" height="28" alt="Haven" '
    f'style="vertical-align:middle;border-radius:6px;margin-right:8px;">'
    f'<span style="vertical-align:middle;">Haven</span>'
    f'</div>'
)


def _build_gmail_service(google_tokens: dict):
    """Build a Gmail API service using the user's OAuth tokens.

    Args:
        google_tokens: Dict containing access_token and/or refresh_token.

    Returns:
        Authorized Gmail API service instance.

    Raises:
        ValueError: If no tokens are available.
    """
    access_token = google_tokens.get("access_token", "")
    refresh_token = google_tokens.get("refresh_token", "")

    if not access_token and not refresh_token:
        raise ValueError("No tokens available to build Gmail service")

    credentials = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        token_uri="https://oauth2.googleapis.com/token",
    )

    return build("gmail", "v1", credentials=credentials)


def _send_email(service, to_email: str, subject: str, plain_text: str, html_body: str) -> bool:
    """Send an email via the Gmail API (synchronous - call via asyncio.to_thread).

    Args:
        service: Authorized Gmail API service.
        to_email: Recipient email address.
        subject: Email subject line.
        plain_text: Plain text fallback body.
        html_body: HTML body content.

    Returns:
        True if sent successfully, False otherwise.
    """
    # Wrap the alternative (plain + HTML) part inside a "related" container so
    # the inline logo image travels with the message and renders via cid:.
    msg = MIMEMultipart("related")
    msg["to"] = to_email
    msg["subject"] = subject

    alternative = MIMEMultipart("alternative")
    alternative.attach(MIMEText(plain_text, "plain"))
    alternative.attach(MIMEText(html_body, "html"))
    msg.attach(alternative)

    # Best-effort inline logo; the email is still valid without it.
    _attach_logo(msg)

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    service.users().messages().send(userId="me", body={"raw": raw}).execute()
    return True


async def send_task_reminder(
    user_email: str, task_title: str, deadline: str, google_tokens: dict
) -> bool:
    """Send a task deadline reminder email via Gmail API.

    Sends a professional HTML email reminding the user about an upcoming
    task deadline with Haven branding and a link to the app.

    Args:
        user_email: The recipient email address.
        task_title: Title of the task approaching its deadline.
        deadline: Human-readable deadline string (e.g. "Tomorrow at 5:00 PM").
        google_tokens: Dict with access_token and/or refresh_token.

    Returns:
        True if the email was sent successfully, False otherwise.
    """
    try:
        service = _build_gmail_service(google_tokens)

        plain_text = (
            f"Task Reminder: {task_title}\n\n"
            f"Your task \"{task_title}\" is due {deadline}.\n\n"
            f"Open Haven to take action: {settings.FRONTEND_ORIGIN}"
        )

        safe_title = html.escape(task_title)
        safe_deadline = html.escape(deadline)

        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {{ margin: 0; padding: 0; background-color: #f8f6f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
    .container {{ max-width: 560px; margin: 0 auto; padding: 40px 20px; }}
    .card {{ background-color: #fffefb; border-radius: 16px; padding: 36px; border: 1px solid #ece5da; }}
    .logo {{ color: #dd8a5a; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 28px; }}
    .heading {{ color: #2b2722; font-size: 18px; font-weight: 600; margin-bottom: 12px; }}
    .message {{ color: #6b6258; font-size: 15px; line-height: 1.7; margin-bottom: 28px; }}
    .task-badge {{ display: inline-block; background-color: #fae9da; border: 1px solid #f0d4bd; color: #dd8a5a; padding: 6px 14px; border-radius: 8px; font-size: 14px; font-weight: 500; margin-bottom: 8px; }}
    .deadline {{ color: #c96f3e; font-weight: 500; }}
    .btn {{ display: inline-block; background-color: #c96f3e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; }}
    .footer {{ color: #a89e92; font-size: 12px; margin-top: 28px; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      {_LOGO_HTML}
      <div class="heading">Task Reminder</div>
      <div class="message">
        <span class="task-badge">{safe_title}</span>
        <p>This task is due <span class="deadline">{safe_deadline}</span>. Make sure to wrap it up before the deadline.</p>
      </div>
      <a href="{settings.FRONTEND_ORIGIN}" class="btn">Open Haven</a>
    </div>
    <div class="footer">
      <p>You received this because you have task reminders enabled in Haven.</p>
    </div>
  </div>
</body>
</html>"""

        await asyncio.to_thread(
            _send_email, service, user_email,
            f"Haven: {task_title} - Due {deadline}", plain_text, html_body,
        )
        logger.info(f"Task reminder email sent to {user_email} for '{task_title}'")
        return True
    except Exception as e:
        logger.error(
            "Failed to send task reminder email to %s for '%s': [%s] %s",
            user_email,
            task_title,
            type(e).__name__,
            e,
        )
        return False


async def send_daily_digest(
    user_email: str, tasks: list, events: list, google_tokens: dict
) -> bool:
    """Send a daily digest email with task and event summary via Gmail API.

    Sends a professional HTML email summarizing the user's tasks and
    calendar events for the day.

    Args:
        user_email: The recipient email address.
        tasks: List of task dicts (each with 'title' and optionally 'due').
        events: List of event dicts (each with 'summary' and optionally 'start').
        google_tokens: Dict with access_token and/or refresh_token.

    Returns:
        True if the email was sent successfully, False otherwise.
    """
    try:
        service = _build_gmail_service(google_tokens)

        # Build plain text version
        task_lines = ""
        for t in tasks[:10]:
            title = t.get("title", "Untitled")
            due = t.get("due", "")
            task_lines += f"  - {title}" + (f" (due {due})" if due else "") + "\n"

        event_lines = ""
        for ev in events[:10]:
            summary = ev.get("summary", "Untitled event")
            start = ev.get("start", "")
            event_lines += f"  - {summary}" + (f" at {start}" if start else "") + "\n"

        plain_text = (
            "Good morning! Here is your daily digest from Haven:\n\n"
            f"Tasks ({len(tasks)}):\n{task_lines or '  No pending tasks.'}\n\n"
            f"Events ({len(events)}):\n{event_lines or '  No events today.'}\n\n"
            f"Open Haven: {settings.FRONTEND_ORIGIN}"
        )

        # Build task HTML rows
        tasks_html = ""
        for t in tasks[:10]:
            title = html.escape(t.get("title", "Untitled"))
            due = html.escape(t.get("due", ""))
            due_badge = f'<span style="color:#c96f3e;font-size:12px;margin-left:8px;">due {due}</span>' if due else ""
            tasks_html += f'<div style="padding:10px 0;border-bottom:1px solid #ece5da;color:#6b6258;font-size:14px;">{title}{due_badge}</div>'

        if not tasks:
            tasks_html = '<div style="padding:10px 0;color:#a89e92;font-size:14px;">No pending tasks</div>'

        # Build event HTML rows
        events_html = ""
        for ev in events[:10]:
            summary = html.escape(ev.get("summary", "Untitled event"))
            start = html.escape(ev.get("start", ""))
            time_badge = f'<span style="color:#dd8a5a;font-size:12px;margin-left:8px;">{start}</span>' if start else ""
            events_html += f'<div style="padding:10px 0;border-bottom:1px solid #ece5da;color:#6b6258;font-size:14px;">{summary}{time_badge}</div>'

        if not events:
            events_html = '<div style="padding:10px 0;color:#a89e92;font-size:14px;">No events today</div>'

        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {{ margin: 0; padding: 0; background-color: #f8f6f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
    .container {{ max-width: 560px; margin: 0 auto; padding: 40px 20px; }}
    .card {{ background-color: #fffefb; border-radius: 16px; padding: 36px; border: 1px solid #ece5da; }}
    .logo {{ color: #dd8a5a; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 28px; }}
    .heading {{ color: #2b2722; font-size: 18px; font-weight: 600; margin-bottom: 6px; }}
    .subheading {{ color: #6b6258; font-size: 13px; margin-bottom: 24px; }}
    .section-title {{ color: #dd8a5a; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; margin-top: 24px; }}
    .btn {{ display: inline-block; background-color: #c96f3e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; margin-top: 24px; }}
    .footer {{ color: #a89e92; font-size: 12px; margin-top: 28px; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      {_LOGO_HTML}
      <div class="heading">Your Daily Digest</div>
      <div class="subheading">Here is what is on your plate today.</div>

      <div class="section-title">Tasks ({len(tasks)})</div>
      {tasks_html}

      <div class="section-title">Events ({len(events)})</div>
      {events_html}

      <a href="{settings.FRONTEND_ORIGIN}" class="btn">Open Haven</a>
    </div>
    <div class="footer">
      <p>You received this daily digest from Haven.</p>
    </div>
  </div>
</body>
</html>"""

        await asyncio.to_thread(
            _send_email, service, user_email,
            "Haven: Your Daily Digest", plain_text, html_body,
        )
        logger.info(f"Daily digest email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(
            "Failed to send daily digest email to %s: [%s] %s",
            user_email,
            type(e).__name__,
            e,
        )
        return False


def _markdown_to_html(markdown_text: str) -> str:
    """Convert basic markdown to HTML (headers, bullets, paragraphs, bold).

    Handles ## headings, - bullet lists, **bold**, and paragraph separation.
    All text content is HTML-escaped before formatting to prevent injection.

    Args:
        markdown_text: The markdown string to convert.

    Returns:
        HTML string with basic formatting.
    """
    lines = markdown_text.split("\n")
    html_parts: list[str] = []
    in_list = False

    for line in lines:
        stripped = line.strip()

        # Headings
        if stripped.startswith("### "):
            if in_list:
                html_parts.append("</ul>")
                in_list = False
            safe = html.escape(stripped[4:])
            html_parts.append(f'<h3 style="color:#2b2722;font-size:15px;margin:18px 0 8px 0;">{safe}</h3>')
        elif stripped.startswith("## "):
            if in_list:
                html_parts.append("</ul>")
                in_list = False
            safe = html.escape(stripped[3:])
            html_parts.append(f'<h2 style="color:#2b2722;font-size:17px;margin:20px 0 10px 0;">{safe}</h2>')
        elif stripped.startswith("# "):
            if in_list:
                html_parts.append("</ul>")
                in_list = False
            safe = html.escape(stripped[2:])
            html_parts.append(f'<h1 style="color:#2b2722;font-size:20px;margin:24px 0 12px 0;">{safe}</h1>')
        elif stripped.startswith("- ") or stripped.startswith("* "):
            if not in_list:
                html_parts.append('<ul style="padding-left:20px;margin:8px 0;">')
                in_list = True
            content = stripped[2:]
            # Escape first, then apply bold formatting
            content = html.escape(content)
            content = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", content)
            html_parts.append(f'<li style="color:#6b6258;font-size:14px;margin:4px 0;">{content}</li>')
        elif stripped == "":
            if in_list:
                html_parts.append("</ul>")
                in_list = False
            html_parts.append("<br>")
        else:
            if in_list:
                html_parts.append("</ul>")
                in_list = False
            # Escape first, then apply bold formatting
            content = html.escape(stripped)
            content = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", content)
            html_parts.append(f'<p style="color:#6b6258;font-size:14px;line-height:1.7;margin:6px 0;">{content}</p>')

    if in_list:
        html_parts.append("</ul>")

    return "\n".join(html_parts)


async def send_weekly_review(
    user_email: str, review_content: str, google_tokens: dict
) -> bool:
    """Send a weekly review email via Gmail API.

    Formats the markdown review content from the ReviewAgent as an HTML email
    with Haven warm-theme branding.

    Args:
        user_email: The recipient email address.
        review_content: Markdown string from the ReviewAgent (weekly review).
        google_tokens: Dict with access_token and/or refresh_token.

    Returns:
        True if the email was sent successfully, False otherwise.
    """
    try:
        service = _build_gmail_service(google_tokens)

        # Plain text is the raw markdown
        plain_text = (
            "Your Weekly Review from Haven\n\n"
            f"{review_content}\n\n"
            f"Open Haven: {settings.FRONTEND_ORIGIN}"
        )

        # Convert markdown review to HTML
        review_html = _markdown_to_html(review_content)

        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {{ margin: 0; padding: 0; background-color: #f8f6f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
    .container {{ max-width: 560px; margin: 0 auto; padding: 40px 20px; }}
    .card {{ background-color: #fffefb; border-radius: 16px; padding: 36px; border: 1px solid #ece5da; }}
    .logo {{ color: #dd8a5a; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 28px; }}
    .heading {{ color: #2b2722; font-size: 18px; font-weight: 600; margin-bottom: 6px; }}
    .subheading {{ color: #6b6258; font-size: 13px; margin-bottom: 24px; }}
    .review-content {{ margin: 16px 0; }}
    .btn {{ display: inline-block; background-color: #c96f3e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; margin-top: 24px; }}
    .footer {{ color: #a89e92; font-size: 12px; margin-top: 28px; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      {_LOGO_HTML}
      <div class="heading">Your Weekly Review</div>
      <div class="subheading">Here is how your week went.</div>
      <div class="review-content">
        {review_html}
      </div>
      <a href="{settings.FRONTEND_ORIGIN}" class="btn">Open Haven</a>
    </div>
    <div class="footer">
      <p>You received this weekly review from Haven.</p>
    </div>
  </div>
</body>
</html>"""

        await asyncio.to_thread(
            _send_email, service, user_email,
            "Haven: Your Weekly Review", plain_text, html_body,
        )
        logger.info(f"Weekly review email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(
            "Failed to send weekly review email to %s: [%s] %s",
            user_email,
            type(e).__name__,
            e,
        )
        return False


async def send_notifications_enabled_confirmation(
    user_email: str, google_tokens: dict
) -> bool:
    """Send a confirmation email when email notifications are enabled.

    Notifies the user that their Gmail notifications have been successfully
    turned on in Haven settings.

    Args:
        user_email: The recipient email address.
        google_tokens: Dict with access_token and/or refresh_token.

    Returns:
        True if the email was sent successfully, False otherwise.
    """
    try:
        service = _build_gmail_service(google_tokens)

        plain_text = (
            "Gmail Notifications Enabled\n\n"
            "You have successfully enabled email notifications in Haven. "
            "You will now receive task deadline reminders, daily digests, "
            "and other important updates directly in your inbox.\n\n"
            "You can manage your notification preferences at any time from Settings.\n\n"
            f"Open Haven: {settings.FRONTEND_ORIGIN}"
        )

        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {{ margin: 0; padding: 0; background-color: #f8f6f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
    .container {{ max-width: 560px; margin: 0 auto; padding: 40px 20px; }}
    .card {{ background-color: #fffefb; border-radius: 16px; padding: 36px; border: 1px solid #ece5da; }}
    .logo {{ color: #dd8a5a; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 28px; }}
    .heading {{ color: #2b2722; font-size: 18px; font-weight: 600; margin-bottom: 12px; }}
    .message {{ color: #6b6258; font-size: 15px; line-height: 1.7; margin-bottom: 28px; }}
    .check-badge {{ display: inline-block; background-color: #10b98115; border: 1px solid #10b98130; color: #10b981; padding: 6px 14px; border-radius: 8px; font-size: 14px; font-weight: 500; margin-bottom: 16px; }}
    .btn {{ display: inline-block; background-color: #c96f3e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; }}
    .footer {{ color: #a89e92; font-size: 12px; margin-top: 28px; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      {_LOGO_HTML}
      <div class="heading">Notifications Enabled</div>
      <div class="message">
        <span class="check-badge">Email notifications are now active</span>
        <p>You will receive task deadline reminders, daily digests, and other important updates directly to your inbox.</p>
        <p>You can adjust your notification preferences at any time from your Haven settings.</p>
      </div>
      <a href="{settings.FRONTEND_ORIGIN}" class="btn">Open Haven</a>
    </div>
    <div class="footer">
      <p>You received this because you enabled email notifications in Haven.</p>
    </div>
  </div>
</body>
</html>"""

        await asyncio.to_thread(
            _send_email, service, user_email,
            "Haven: Email Notifications Enabled", plain_text, html_body,
        )
        logger.info(f"Notifications enabled confirmation email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(
            "Failed to send notifications enabled confirmation to %s: [%s] %s",
            user_email,
            type(e).__name__,
            e,
        )
        return False



async def send_welcome_email(user_email: str, google_tokens: dict) -> bool:
    """Send a one-time warm welcome email after the user connects Gmail.

    Triggered from the OAuth callback when the "gmail" service is connected.
    Uses the freshly granted Gmail tokens to send a Haven-themed welcome that
    lets the user know they'll now receive reminders/updates and can manage
    preferences in Settings.

    Args:
        user_email: The recipient email address.
        google_tokens: Dict with access_token and/or refresh_token from the
            just-connected Gmail authorization.

    Returns:
        True if the email was sent successfully, False otherwise.
    """
    try:
        service = _build_gmail_service(google_tokens)

        plain_text = (
            "Welcome to Haven!\n\n"
            "Thanks for connecting your Gmail. Haven can now keep you on track "
            "with task deadline reminders, daily digests, and gentle nudges "
            "delivered right to your inbox.\n\n"
            "You're in control — manage exactly what you receive anytime from "
            "Settings.\n\n"
            f"Open Haven: {settings.FRONTEND_ORIGIN}"
        )

        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {{ margin: 0; padding: 0; background-color: #f8f6f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
    .container {{ max-width: 560px; margin: 0 auto; padding: 40px 20px; }}
    .card {{ background-color: #fffefb; border-radius: 16px; padding: 36px; border: 1px solid #ece5da; }}
    .logo {{ color: #dd8a5a; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 28px; }}
    .heading {{ color: #2b2722; font-size: 20px; font-weight: 600; margin-bottom: 12px; }}
    .message {{ color: #6b6258; font-size: 15px; line-height: 1.7; margin-bottom: 28px; }}
    .welcome-badge {{ display: inline-block; background-color: #fae9da; border: 1px solid #f0d4bd; color: #dd8a5a; padding: 6px 14px; border-radius: 8px; font-size: 14px; font-weight: 500; margin-bottom: 16px; }}
    .btn {{ display: inline-block; background-color: #c96f3e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; }}
    .footer {{ color: #a89e92; font-size: 12px; margin-top: 28px; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      {_LOGO_HTML}
      <div class="heading">Welcome to Haven</div>
      <div class="message">
        <span class="welcome-badge">Gmail connected</span>
        <p>Thanks for connecting your Gmail. Haven can now keep you on track with
        task deadline reminders, daily digests, and gentle nudges delivered right
        to your inbox.</p>
        <p>You're always in control — manage exactly what you receive anytime from
        your Haven Settings.</p>
      </div>
      <a href="{settings.FRONTEND_ORIGIN}" class="btn">Open Haven</a>
    </div>
    <div class="footer">
      <p>You received this because you just connected Gmail to Haven.</p>
    </div>
  </div>
</body>
</html>"""

        await asyncio.to_thread(
            _send_email, service, user_email,
            "Welcome to Haven", plain_text, html_body,
        )
        logger.info(f"Welcome email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(
            "Failed to send welcome email to %s: [%s] %s",
            user_email,
            type(e).__name__,
            e,
        )
        return False
