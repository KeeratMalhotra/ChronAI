"""Tests for Habit Tracking Agent and Planner complete_task action.

Tests cover: create habit, list habits, check-in (streak increment),
delete habit, and planner complete_task via MCP.
"""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


class TestHabitAgent:
    """Tests for the HabitAgent."""

    @pytest.fixture(autouse=True)
    def setup_habit_agent(self, mock_vertexai_model, mock_mcp_client):
        """Set up the habit agent with mocked dependencies."""
        from app.agents.base import AgentRegistry

        AgentRegistry._agents.clear()

        with patch("app.agents.habits.vertexai.init"), \
             patch("app.agents.habits.GenerativeModel", return_value=mock_vertexai_model):
            from app.agents.habits import HabitAgent

            self.agent = HabitAgent(mcp_client=mock_mcp_client)
            self.mock_model = mock_vertexai_model
            yield
            AgentRegistry._agents.clear()

    async def test_create_habit(self):
        """Test creating a new habit via the HabitAgent."""
        self.mock_model.generate_content.return_value = MagicMock(
            text=json.dumps({
                "action": "create_habit",
                "habit_name": "meditation",
                "frequency": "daily",
                "target_days": 7,
            })
        )

        result = await self.agent.execute({
            "message": "I want to start tracking meditation",
            "auth_token": "test-token",
            "user_id": "user123",
        })

        assert result["action"] == "create_habit"
        assert "meditation" in result["content"]
        assert "tracking" in result["content"].lower() or "started" in result["content"].lower()
        assert result["agent"] == "habits"

    async def test_list_habits(self):
        """Test listing habits when user has some tracked habits."""
        # Pre-create a habit in the mock firestore
        from app.db.repositories import HabitRepository
        from app.db.models import Habit

        habit = Habit(
            user_id="user123",
            name="gym",
            frequency="daily",
            target_days=7,
            streak=5,
        )
        await HabitRepository.create(habit)

        self.mock_model.generate_content.return_value = MagicMock(
            text=json.dumps({
                "action": "list_habits",
                "habit_name": "",
                "frequency": "daily",
                "target_days": 7,
            })
        )

        result = await self.agent.execute({
            "message": "How are my habits?",
            "auth_token": "test-token",
            "user_id": "user123",
        })

        assert result["action"] == "list_habits"
        assert "gym" in result["content"]
        assert "5" in result["content"]  # streak count
        assert result["agent"] == "habits"

    async def test_list_habits_empty(self):
        """Test listing habits when user has no tracked habits."""
        self.mock_model.generate_content.return_value = MagicMock(
            text=json.dumps({
                "action": "list_habits",
                "habit_name": "",
                "frequency": "daily",
                "target_days": 7,
            })
        )

        result = await self.agent.execute({
            "message": "Show my habits",
            "auth_token": "test-token",
            "user_id": "user456",
        })

        assert result["action"] == "list_habits"
        assert "not tracking" in result["content"].lower()
        assert result["agent"] == "habits"

    async def test_check_in_increments_streak(self):
        """Test that checking in to a habit increments the streak."""
        from app.db.repositories import HabitRepository
        from app.db.models import Habit

        habit = Habit(
            user_id="user123",
            name="gym",
            frequency="daily",
            target_days=7,
            streak=3,
        )
        created = await HabitRepository.create(habit)

        self.mock_model.generate_content.return_value = MagicMock(
            text=json.dumps({
                "action": "check_in",
                "habit_name": "gym",
                "frequency": "daily",
                "target_days": 7,
            })
        )

        result = await self.agent.execute({
            "message": "I went to the gym today",
            "auth_token": "test-token",
            "user_id": "user123",
        })

        assert result["action"] == "check_in"
        assert result["streak"] == 4
        assert "gym" in result["content"]
        assert result["agent"] == "habits"

        # Verify the streak was persisted
        updated = await HabitRepository.get_by_id(created.id)
        assert updated is not None
        assert updated.streak == 4

    async def test_check_in_habit_not_found(self):
        """Test checking in to a habit that does not exist."""
        self.mock_model.generate_content.return_value = MagicMock(
            text=json.dumps({
                "action": "check_in",
                "habit_name": "swimming",
                "frequency": "daily",
                "target_days": 7,
            })
        )

        result = await self.agent.execute({
            "message": "I went swimming",
            "auth_token": "test-token",
            "user_id": "user123",
        })

        assert result["action"] == "check_in"
        assert "couldn't find" in result["content"].lower()

    async def test_delete_habit(self):
        """Test deleting a tracked habit."""
        from app.db.repositories import HabitRepository
        from app.db.models import Habit

        habit = Habit(
            user_id="user123",
            name="running",
            frequency="daily",
            target_days=5,
            streak=10,
        )
        created = await HabitRepository.create(habit)

        self.mock_model.generate_content.return_value = MagicMock(
            text=json.dumps({
                "action": "delete_habit",
                "habit_name": "running",
                "frequency": "daily",
                "target_days": 7,
            })
        )

        result = await self.agent.execute({
            "message": "Stop tracking running",
            "auth_token": "test-token",
            "user_id": "user123",
        })

        assert result["action"] == "delete_habit"
        assert "running" in result["content"]
        assert "10" in result["content"]  # showed the streak they had
        assert result["agent"] == "habits"

        # Verify the habit was deleted
        deleted = await HabitRepository.get_by_id(created.id)
        assert deleted is None


class TestPlannerCompleteTask:
    """Tests for the Planner's complete_task action."""

    @pytest.fixture(autouse=True)
    def setup_planner(self, mock_vertexai_model, mock_mcp_client):
        """Set up the planner agent with mocked dependencies."""
        from app.agents.base import AgentRegistry

        AgentRegistry._agents.clear()

        with patch("app.agents.planner.vertexai.init"), \
             patch("app.agents.planner.GenerativeModel", return_value=mock_vertexai_model):
            from app.agents.planner import PlannerAgent

            self.agent = PlannerAgent(mcp_client=mock_mcp_client)
            self.mock_model = mock_vertexai_model
            self.mock_mcp = mock_mcp_client
            yield
            AgentRegistry._agents.clear()

    async def test_complete_task_success(self):
        """Test completing a task via the planner: lists tasks, finds match, calls MCP."""
        # Gemini classifies as complete_task
        self.mock_model.generate_content.return_value = MagicMock(
            text=json.dumps({
                "action": "complete_task",
                "task_name": "buy groceries",
                "tasks": [],
                "response": "Marking task as done.",
            })
        )

        # MCP list_tasks returns tasks including the target
        self.mock_mcp.call_tool = AsyncMock(side_effect=[
            # First call: list_tasks
            [
                {"id": "task1", "title": "Buy groceries", "completed": False},
                {"id": "task2", "title": "Submit report", "completed": False},
            ],
            # Second call: complete_task
            {"status": "completed", "id": "task1"},
        ])

        result = await self.agent.execute({
            "message": "complete_task: buy groceries",
            "auth_token": "test-token",
            "user_id": "user123",
        })

        assert result["action"] == "complete_task"
        assert "Buy groceries" in result["content"]
        assert "completed" in result["content"].lower() or "done" in result["content"].lower()

        # Verify the MCP calls
        calls = self.mock_mcp.call_tool.call_args_list
        assert len(calls) == 2
        # First call is list_tasks
        assert calls[0][0][1] == "list_tasks"
        # Second call is complete_task with correct task_id
        assert calls[1][0][1] == "complete_task"
        assert calls[1][0][2]["task_id"] == "task1"

    async def test_complete_task_not_found(self):
        """Test completing a task that does not exist in the user's list."""
        self.mock_model.generate_content.return_value = MagicMock(
            text=json.dumps({
                "action": "complete_task",
                "task_name": "nonexistent task",
                "tasks": [],
                "response": "Marking task as done.",
            })
        )

        # MCP list_tasks returns tasks that don't match
        self.mock_mcp.call_tool = AsyncMock(return_value=[
            {"id": "task1", "title": "Buy groceries", "completed": False},
        ])

        result = await self.agent.execute({
            "message": "I finished the nonexistent task",
            "auth_token": "test-token",
            "user_id": "user123",
        })

        assert result["action"] == "complete_task"
        assert "couldn't find" in result["content"].lower()

    async def test_complete_task_empty_list(self):
        """Test completing a task when the user has no tasks."""
        self.mock_model.generate_content.return_value = MagicMock(
            text=json.dumps({
                "action": "complete_task",
                "task_name": "something",
                "tasks": [],
                "response": "Marking task as done.",
            })
        )

        self.mock_mcp.call_tool = AsyncMock(return_value=[])

        result = await self.agent.execute({
            "message": "I finished something",
            "auth_token": "test-token",
            "user_id": "user123",
        })

        assert result["action"] == "complete_task"
        assert "empty" in result["content"].lower() or "couldn't find" in result["content"].lower()


class TestHabitRoutes:
    """Tests for the habit REST API routes."""

    @pytest.fixture
    async def client(self, mock_firestore_db):
        """Provide an httpx.AsyncClient connected to the FastAPI app."""
        from contextlib import asynccontextmanager

        from httpx import ASGITransport, AsyncClient

        from app.agents.base import AgentRegistry

        AgentRegistry._agents.clear()

        @asynccontextmanager
        async def test_lifespan(app):
            yield

        from app import main as app_module

        original_lifespan = app_module.app.router.lifespan_context
        app_module.app.router.lifespan_context = test_lifespan

        transport = ASGITransport(app=app_module.app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield client

        app_module.app.router.lifespan_context = original_lifespan
        AgentRegistry._agents.clear()

    async def test_get_habits_empty(self, client):
        """Test GET /api/habits returns empty list for new user."""
        response = await client.get("/api/habits", params={"auth_token": "test-token"})
        assert response.status_code == 200
        data = response.json()
        assert "habits" in data
        assert data["habits"] == []

    async def test_create_habit_route(self, client):
        """Test POST /api/habits creates a habit and returns it."""
        response = await client.post("/api/habits", json={
            "auth_token": "test-token",
            "name": "meditation",
            "frequency": "daily",
            "target_days": 7,
        })
        assert response.status_code == 200
        data = response.json()
        assert "habit" in data
        assert data["habit"]["name"] == "meditation"
        assert data["habit"]["frequency"] == "daily"
        assert data["habit"]["target_days"] == 7
        assert data["habit"]["streak"] == 0

    async def test_checkin_habit_route(self, client):
        """Test POST /api/habits/checkin records completion."""
        from app.db.repositories import HabitRepository
        from app.db.models import Habit

        habit = Habit(user_id="user123", name="gym", frequency="daily", target_days=7, streak=2)
        created = await HabitRepository.create(habit)

        response = await client.post("/api/habits/checkin", json={
            "auth_token": "test-token",
            "habit_id": created.id,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["habit"]["streak"] == 3

    async def test_delete_habit_route(self, client):
        """Test DELETE /api/habits/{id} removes a habit."""
        from app.db.repositories import HabitRepository
        from app.db.models import Habit

        habit = Habit(user_id="user123", name="reading", frequency="daily", target_days=5, streak=1)
        created = await HabitRepository.create(habit)

        response = await client.delete(
            f"/api/habits/{created.id}",
            params={"auth_token": "test-token"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "deleted"

        # Verify it's actually gone
        deleted = await HabitRepository.get_by_id(created.id)
        assert deleted is None

    async def test_get_habits_unauthorized(self, client):
        """Test GET /api/habits without auth returns 401."""
        response = await client.get("/api/habits")
        assert response.status_code == 401
