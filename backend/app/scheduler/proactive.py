"""Proactive Scheduler - Background task for deadline monitoring and nudge delivery.

Periodically checks all users' tasks for approaching deadlines and sends
escalating notifications through the WebSocket connection manager.
Falls back to email when the user is not connected via WebSocket.
"""

import asyncio
import base64
import logging
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from app.config import settings
from app.db.repositories import UserRepository, TaskRepository
from app.scheduler.nudge_engine import classify_urgency, generate_nudge, _format_time_remaining
from app.ws_manager import ConnectionManager

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)


async def _send_nudge_email(user_email: str, nudge_message: str, task_title: str, google_tokens: dict) -> bool:
    """Send a nudge email to the user via Gmail API.

    Uses the user's stored refresh token to obtain fresh credentials and
    sends an HTML email with ChronAI branding.

    Args:
        user_email: The user's email address.
        nudge_message: The nudge text to include in the email.
        task_title: The task title for the email subject.
        google_tokens: The user's stored Google OAuth tokens.

    Returns:
        True if the email was sent successfully, False otherwise.
    """
    try:
        access_token = google_tokens.get("access_token", "")
        refresh_token = google_tokens.get("refresh_token", "")

        if not access_token and not refresh_token:
            logger.warning("No tokens available to send nudge email")
            return False

        credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            token_uri="https://oauth2.googleapis.com/token",
        )

        service = build("gmail", "v1", credentials=credentials)

        # Build HTML email with ChronAI branding
        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ margin: 0; padding: 0; background-color: #1a1a2e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
    .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
    .card {{ background-color: #16213e; border-radius: 12px; padding: 32px; border: 1px solid #0f3460; }}
    .logo {{ color: #e94560; font-size: 24px; font-weight: bold; margin-bottom: 24px; }}
    .message {{ color: #eaeaea; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }}
    .task-title {{ color: #ffffff; font-weight: 600; }}
    .btn {{ display: inline-block; background-color: #e94560; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; }}
    .footer {{ color: #666; font-size: 12px; margin-top: 24px; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">ChronAI</div>
      <div class="message">
        <p>{nudge_message}</p>
      </div>
      <a href="{settings.FRONTEND_ORIGIN}" class="btn">Open ChronAI</a>
    </div>
    <div class="footer">
      <p>You received this because you have email notifications enabled in ChronAI.</p>
    </div>
  </div>
</body>
</html>"""

        msg = MIMEMultipart("alternative")
        msg["to"] = user_email
        msg["subject"] = f"ChronAI Reminder: {task_title}"
        msg.attach(MIMEText(nudge_message, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()

        service.users().messages().send(
            userId="me", body={"raw": raw}
        ).execute()

        logger.info(f"Nudge email sent to {user_email} for task '{task_title}'")
        return True
    except Exception as e:
        logger.error(f"Failed to send nudge email to {user_email}: {e}")
        return False


async def _check_user_deadlines(
    user_id: str, manager: ConnectionManager
) -> list[dict]:
    """Check a single user's tasks for approaching deadlines and send nudges.

    When the user is connected via WebSocket, pushes notifications directly.
    When the user is offline, falls back to sending a Gmail email (respecting
    the user's notification_preferences).

    Args:
        user_id: The user ID to check tasks for.
        manager: ConnectionManager instance for pushing notifications.

    Returns:
        List of nudge summary dicts that were generated.
    """
    nudges_sent = []

    try:
        tasks = await TaskRepository.list_by_user(user_id)
    except Exception:
        logger.warning(f"Failed to fetch tasks for user {user_id}")
        return nudges_sent

    now = datetime.now(timezone.utc)

    for task in tasks:
        if not task.deadline:
            continue

        # Skip completed tasks
        if task.status in ("completed", "done"):
            continue

        deadline = task.deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)

        # Only process tasks with deadlines within 24 hours
        remaining = deadline - now
        if remaining > timedelta(hours=24) or remaining.total_seconds() <= 0:
            continue

        urgency = classify_urgency(deadline)
        time_remaining = _format_time_remaining(deadline)

        # Generate nudge message
        nudge_message = await generate_nudge(task.title, urgency, time_remaining)

        # Push notification to connected user
        notification = {
            "type": "notification",
            "content": nudge_message,
            "agent": "notification",
            "metadata": {
                "task_id": task.id,
                "task_title": task.title,
                "urgency": urgency,
                "time_remaining": time_remaining,
                "deadline": deadline.isoformat(),
            },
        }

        sent_count = await manager.send_to_user(user_id, notification)

        # If user is NOT connected via WebSocket, try sending email
        email_sent = False
        if not manager.is_connected(user_id):
            try:
                user = await UserRepository.get_by_id(user_id)
                if user and user.email and user.google_tokens:
                    prefs = user.notification_preferences
                    email_enabled = prefs.get("email_notifications", True)
                    urgent_only = prefs.get("email_for_urgent_only", False)

                    # Respect notification preferences
                    should_send = email_enabled and (
                        not urgent_only or urgency in ("critical", "urgent")
                    )

                    if should_send:
                        email_sent = await _send_nudge_email(
                            user.email, nudge_message, task.title, user.google_tokens
                        )
            except Exception as e:
                logger.error(f"Error sending email fallback for user {user_id}: {e}")

        nudges_sent.append({
            "user_id": user_id,
            "task_title": task.title,
            "urgency": urgency,
            "time_remaining": time_remaining,
            "delivered": sent_count > 0,
            "email_sent": email_sent,
        })

        logger.info(
            f"Nudge sent to user {user_id}: '{task.title}' "
            f"({urgency}, {time_remaining}), delivered to {sent_count} connections, "
            f"email_sent={email_sent}"
        )

    return nudges_sent


async def run_nudge_check(manager: ConnectionManager, user_id: Optional[str] = None) -> list[dict]:
    """Run a nudge check for all users or a specific user.

    Args:
        manager: ConnectionManager instance for pushing notifications.
        user_id: Optional specific user ID to check. If None, checks all users.

    Returns:
        List of all nudge summaries generated during this check.
    """
    all_nudges = []

    if user_id:
        nudges = await _check_user_deadlines(user_id, manager)
        all_nudges.extend(nudges)
    else:
        try:
            users = await UserRepository.list_all()
        except Exception:
            logger.error("Failed to fetch users for nudge check")
            return all_nudges

        for user in users:
            if not user.id:
                continue
            nudges = await _check_user_deadlines(user.id, manager)
            all_nudges.extend(nudges)

    return all_nudges


async def _scheduler_loop(manager: ConnectionManager) -> None:
    """Main scheduler loop that runs periodically.

    Args:
        manager: ConnectionManager instance for pushing notifications.
    """
    interval_seconds = settings.NUDGE_INTERVAL_MINUTES * 60
    logger.info(
        f"Proactive scheduler started. Checking every {settings.NUDGE_INTERVAL_MINUTES} minutes."
    )

    while True:
        try:
            await run_nudge_check(manager)
        except Exception:
            logger.exception("Error during proactive nudge check")

        await asyncio.sleep(interval_seconds)


def start_proactive_scheduler(manager: ConnectionManager) -> asyncio.Task:
    """Start the proactive scheduler as a background asyncio task.

    Args:
        manager: ConnectionManager instance for pushing notifications.

    Returns:
        The asyncio.Task running the scheduler loop.
    """
    task = asyncio.create_task(_scheduler_loop(manager))
    logger.info("Proactive scheduler task created.")
    return task


def stop_proactive_scheduler(task: asyncio.Task) -> None:
    """Stop the proactive scheduler background task.

    Args:
        task: The asyncio.Task to cancel.
    """
    task.cancel()
    logger.info("Proactive scheduler task cancelled.")
