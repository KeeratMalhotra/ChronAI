"""Tests for weekly review agent and proactive email notifications."""

import json
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.agents.review import ReviewAgent, generate_weekly_review
from app.db.models import User, Task, Habit
from app.scheduler.proactive import _check_user_deadlines, _send_nudge_email


# ---------------------------------------------------------------------------
# ReviewAgent / generate_weekly_review tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_generate_weekly_review_with_data(mock_mcp_client):
    """Test generate_weekly_review returns Gemini-generated markdown."""
    # Configure mock MCP to return sample data
    mock_mcp_client.call_tool = AsyncMock(side_effect=[
        # First call: calendar events
        [{"summary": "Team standup", "start": "2024-01-15T10:00:00Z"}],
        # Second call: tasks
        [
            {"title": "Write report", "status": "completed"},
            {"title": "Review PR", "status": "pending"},
        ],
    ])

    # Configure Gemini to return a review
    review_text = "# Weekly Review\n\nGreat week! You completed 1 out of 2 tasks."
    mock_model = MagicMock()
    mock_model.generate_content = MagicMock(return_value=MagicMock(text=review_text))

    with patch("app.agents.review.vertexai"), \
         patch("app.agents.review.GenerativeModel", return_value=mock_model):
        result = await generate_weekly_review("user123", "test-token", mock_mcp_client)

    assert "Weekly Review" in result
    assert mock_mcp_client.call_tool.call_count == 2


@pytest.mark.asyncio
async def test_generate_weekly_review_no_mcp():
    """Test generate_weekly_review works without MCP client (fallback review)."""
    review_text = "# Weekly Review\n\nHere's your week summary."
    mock_model = MagicMock()
    mock_model.generate_content = MagicMock(return_value=MagicMock(text=review_text))

    with patch("app.agents.review.vertexai"), \
         patch("app.agents.review.GenerativeModel", return_value=mock_model):
        result = await generate_weekly_review("user123", "", None)

    assert "Weekly Review" in result


@pytest.mark.asyncio
async def test_generate_weekly_review_gemini_fails(mock_mcp_client):
    """Test fallback review is returned when Gemini fails."""
    mock_mcp_client.call_tool = AsyncMock(return_value=[])
    mock_model = MagicMock()
    mock_model.generate_content = MagicMock(side_effect=Exception("API error"))

    with patch("app.agents.review.vertexai"), \
         patch("app.agents.review.GenerativeModel", return_value=mock_model):
        result = await generate_weekly_review("user123", "test-token", mock_mcp_client)

    # Should get fallback review
    assert "Weekly Review" in result
    assert "Summary" in result


@pytest.mark.asyncio
async def test_review_agent_execute(mock_vertexai_model, mock_mcp_client):
    """Test ReviewAgent.execute returns weekly review content."""
    review_text = "# Your Weekly Review\n\nYou had a productive week!"
    mock_model = MagicMock()
    mock_model.generate_content = MagicMock(return_value=MagicMock(text=review_text))
    mock_mcp_client.call_tool = AsyncMock(return_value=[])

    with patch("app.agents.review.vertexai"), \
         patch("app.agents.review.GenerativeModel", return_value=mock_model):
        agent = ReviewAgent(mcp_client=mock_mcp_client)
        result = await agent.execute({
            "message": "How was my week?",
            "auth_token": "test-token",
            "user_id": "user123",
        })

    assert result["agent"] == "review"
    assert result["action"] == "weekly_review"
    assert "Weekly Review" in result["content"]


# ---------------------------------------------------------------------------
# Proactive email notification tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_proactive_email_sent_when_user_disconnected(mock_firestore_db):
    """Test that email is sent when user is not connected via WebSocket."""
    # Set up user in Firestore with tokens
    user_data = {
        "email": "test@example.com",
        "name": "Test User",
        "google_tokens": {"access_token": "token123", "refresh_token": "refresh456"},
        "notification_preferences": {"email_notifications": True, "email_for_urgent_only": False},
        "preferences": {},
        "profile": {
            "role": "", "occupation": "", "work_hours_start": 9,
            "work_hours_end": 18, "wake_time": 7, "sleep_time": 23,
            "priorities": [], "daily_routine": "", "goals": [],
            "onboarding_complete": False,
        },
        "created_at": datetime.utcnow().isoformat(),
    }
    mock_firestore_db._data.setdefault("users", {})["user123"] = user_data

    # Set up a task with an approaching deadline
    deadline = datetime.now(timezone.utc) + timedelta(hours=2)
    task_data = {
        "user_id": "user123",
        "title": "Submit report",
        "description": "Important report",
        "subtasks": [],
        "priority": "high",
        "status": "pending",
        "deadline": deadline.isoformat(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    mock_firestore_db._data.setdefault("tasks", {})["task1"] = task_data

    # Mock ConnectionManager (user NOT connected)
    manager = MagicMock()
    manager.send_to_user = AsyncMock(return_value=0)
    manager.is_connected = MagicMock(return_value=False)

    with patch("app.scheduler.proactive._send_nudge_email", new_callable=AsyncMock) as mock_send_email:
        mock_send_email.return_value = True

        nudges = await _check_user_deadlines("user123", manager)

        # Email should have been called
        assert len(nudges) > 0
        assert nudges[0]["email_sent"] is True
        mock_send_email.assert_called_once()
        # Check the email was sent to the correct address
        call_args = mock_send_email.call_args
        assert call_args[0][0] == "test@example.com"


@pytest.mark.asyncio
async def test_proactive_email_not_sent_when_user_connected(mock_firestore_db):
    """Test that email is NOT sent when user is connected via WebSocket."""
    # Set up a task with an approaching deadline
    deadline = datetime.now(timezone.utc) + timedelta(hours=2)
    task_data = {
        "user_id": "user123",
        "title": "Submit report",
        "description": "",
        "subtasks": [],
        "priority": "high",
        "status": "pending",
        "deadline": deadline.isoformat(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    mock_firestore_db._data.setdefault("tasks", {})["task1"] = task_data

    # Mock ConnectionManager (user IS connected)
    manager = MagicMock()
    manager.send_to_user = AsyncMock(return_value=1)
    manager.is_connected = MagicMock(return_value=True)

    with patch("app.scheduler.proactive._send_nudge_email", new_callable=AsyncMock) as mock_send_email:
        nudges = await _check_user_deadlines("user123", manager)

        # Email should NOT have been called
        mock_send_email.assert_not_called()
        assert len(nudges) > 0
        assert nudges[0]["email_sent"] is False


@pytest.mark.asyncio
async def test_proactive_email_respects_urgent_only_preference(mock_firestore_db):
    """Test that email_for_urgent_only preference is respected."""
    # Set up user with email_for_urgent_only=True
    user_data = {
        "email": "test@example.com",
        "name": "Test User",
        "google_tokens": {"access_token": "token123", "refresh_token": "refresh456"},
        "notification_preferences": {"email_notifications": True, "email_for_urgent_only": True},
        "preferences": {},
        "profile": {
            "role": "", "occupation": "", "work_hours_start": 9,
            "work_hours_end": 18, "wake_time": 7, "sleep_time": 23,
            "priorities": [], "daily_routine": "", "goals": [],
            "onboarding_complete": False,
        },
        "created_at": datetime.utcnow().isoformat(),
    }
    mock_firestore_db._data.setdefault("users", {})["user123"] = user_data

    # Set up a task with deadline in 20 hours (NOT urgent - should classify as "medium")
    deadline = datetime.now(timezone.utc) + timedelta(hours=20)
    task_data = {
        "user_id": "user123",
        "title": "Low priority task",
        "description": "",
        "subtasks": [],
        "priority": "low",
        "status": "pending",
        "deadline": deadline.isoformat(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    mock_firestore_db._data.setdefault("tasks", {})["task2"] = task_data

    # Mock ConnectionManager (user NOT connected)
    manager = MagicMock()
    manager.send_to_user = AsyncMock(return_value=0)
    manager.is_connected = MagicMock(return_value=False)

    with patch("app.scheduler.proactive._send_nudge_email", new_callable=AsyncMock) as mock_send_email:
        mock_send_email.return_value = True

        nudges = await _check_user_deadlines("user123", manager)

        # The urgency for 20 hours remaining should not be critical/high,
        # so email should NOT be sent when urgent_only is True
        if nudges:
            # If classify_urgency returns "medium" or "low" for 20h, email should be skipped
            assert nudges[0]["email_sent"] is False
            mock_send_email.assert_not_called()


@pytest.mark.asyncio
async def test_proactive_email_disabled_in_preferences(mock_firestore_db):
    """Test that email is not sent when email_notifications=False."""
    # Set up user with email_notifications=False
    user_data = {
        "email": "test@example.com",
        "name": "Test User",
        "google_tokens": {"access_token": "token123", "refresh_token": "refresh456"},
        "notification_preferences": {"email_notifications": False, "email_for_urgent_only": False},
        "preferences": {},
        "profile": {
            "role": "", "occupation": "", "work_hours_start": 9,
            "work_hours_end": 18, "wake_time": 7, "sleep_time": 23,
            "priorities": [], "daily_routine": "", "goals": [],
            "onboarding_complete": False,
        },
        "created_at": datetime.utcnow().isoformat(),
    }
    mock_firestore_db._data.setdefault("users", {})["user123"] = user_data

    # Set up a task with an approaching deadline (2 hours - should be urgent)
    deadline = datetime.now(timezone.utc) + timedelta(hours=2)
    task_data = {
        "user_id": "user123",
        "title": "Urgent task",
        "description": "",
        "subtasks": [],
        "priority": "high",
        "status": "pending",
        "deadline": deadline.isoformat(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    mock_firestore_db._data.setdefault("tasks", {})["task3"] = task_data

    # Mock ConnectionManager (user NOT connected)
    manager = MagicMock()
    manager.send_to_user = AsyncMock(return_value=0)
    manager.is_connected = MagicMock(return_value=False)

    with patch("app.scheduler.proactive._send_nudge_email", new_callable=AsyncMock) as mock_send_email:
        nudges = await _check_user_deadlines("user123", manager)

        # Email should NOT be sent because email_notifications=False
        mock_send_email.assert_not_called()
        if nudges:
            assert nudges[0]["email_sent"] is False


@pytest.mark.asyncio
async def test_send_nudge_email_function():
    """Test _send_nudge_email builds and sends email correctly."""
    with patch("app.scheduler.proactive.build") as mock_build:
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        mock_service.users.return_value.messages.return_value.send.return_value.execute.return_value = {
            "id": "msg123"
        }

        with patch("app.scheduler.proactive.Credentials") as mock_creds_cls:
            mock_creds_cls.return_value = MagicMock()

            result = await _send_nudge_email(
                user_email="test@example.com",
                nudge_message="Your task 'Submit report' is due in 2 hours!",
                task_title="Submit report",
                google_tokens={"access_token": "token", "refresh_token": "refresh"},
            )

            assert result is True
            mock_build.assert_called_once_with("gmail", "v1", credentials=mock_creds_cls.return_value)
            mock_service.users.return_value.messages.return_value.send.assert_called_once()
