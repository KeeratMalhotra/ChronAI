"""Google Tasks MCP Server.

Provides tools for interacting with Google Tasks API:
- list_tasks: List all tasks in a task list
- create_task: Create a new task with title, notes, and due date
- update_task: Update an existing task's fields
- complete_task: Mark a task as completed
- delete_task: Delete a task by ID
"""

import json
from datetime import datetime, timedelta
from typing import Any

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool


server = Server("google-tasks")


def get_tasks_service(auth_token: str):
    """Create a Google Tasks API service instance.

    Args:
        auth_token: OAuth2 access token for authentication.

    Returns:
        Google Tasks API service resource.
    """
    credentials = Credentials(token=auth_token)
    return build("tasks", "v1", credentials=credentials)


@server.list_tools()
async def list_tools() -> list[Tool]:
    """List all available task tools."""
    return [
        Tool(
            name="list_tasks",
            description="List all tasks in the default task list",
            inputSchema={
                "type": "object",
                "properties": {
                    "auth_token": {
                        "type": "string",
                        "description": "Google OAuth access token",
                    },
                    "task_list_id": {
                        "type": "string",
                        "description": "Task list ID (default: '@default')",
                        "default": "@default",
                    },
                    "show_completed": {
                        "type": "boolean",
                        "description": "Whether to include completed tasks",
                        "default": False,
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of tasks to return (default: 50)",
                        "default": 50,
                    },
                },
                "required": ["auth_token"],
            },
        ),
        Tool(
            name="create_task",
            description="Create a new task with title, notes, and optional due date",
            inputSchema={
                "type": "object",
                "properties": {
                    "auth_token": {
                        "type": "string",
                        "description": "Google OAuth access token",
                    },
                    "title": {
                        "type": "string",
                        "description": "Task title",
                    },
                    "notes": {
                        "type": "string",
                        "description": "Task notes/description",
                        "default": "",
                    },
                    "due_days_from_now": {
                        "type": "integer",
                        "description": "Due date as days from now (default: 7)",
                        "default": 7,
                    },
                    "task_list_id": {
                        "type": "string",
                        "description": "Task list ID (default: '@default')",
                        "default": "@default",
                    },
                },
                "required": ["auth_token", "title"],
            },
        ),
        Tool(
            name="update_task",
            description="Update an existing task's fields (title, notes, due date)",
            inputSchema={
                "type": "object",
                "properties": {
                    "auth_token": {
                        "type": "string",
                        "description": "Google OAuth access token",
                    },
                    "task_id": {
                        "type": "string",
                        "description": "ID of the task to update",
                    },
                    "title": {
                        "type": "string",
                        "description": "New task title (optional)",
                    },
                    "notes": {
                        "type": "string",
                        "description": "New task notes (optional)",
                    },
                    "due_date": {
                        "type": "string",
                        "description": "New due date in ISO format (optional)",
                    },
                    "task_list_id": {
                        "type": "string",
                        "description": "Task list ID (default: '@default')",
                        "default": "@default",
                    },
                },
                "required": ["auth_token", "task_id"],
            },
        ),
        Tool(
            name="complete_task",
            description="Mark a task as completed",
            inputSchema={
                "type": "object",
                "properties": {
                    "auth_token": {
                        "type": "string",
                        "description": "Google OAuth access token",
                    },
                    "task_id": {
                        "type": "string",
                        "description": "ID of the task to complete",
                    },
                    "task_list_id": {
                        "type": "string",
                        "description": "Task list ID (default: '@default')",
                        "default": "@default",
                    },
                },
                "required": ["auth_token", "task_id"],
            },
        ),
        Tool(
            name="delete_task",
            description="Delete a task by its ID",
            inputSchema={
                "type": "object",
                "properties": {
                    "auth_token": {
                        "type": "string",
                        "description": "Google OAuth access token",
                    },
                    "task_id": {
                        "type": "string",
                        "description": "ID of the task to delete",
                    },
                    "task_list_id": {
                        "type": "string",
                        "description": "Task list ID (default: '@default')",
                        "default": "@default",
                    },
                },
                "required": ["auth_token", "task_id"],
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """Handle tool execution requests.

    Args:
        name: The tool name to execute.
        arguments: Tool arguments dictionary.

    Returns:
        List of TextContent with the result.
    """
    auth_token = arguments.get("auth_token", "")

    if name == "list_tasks":
        result = await _list_tasks(
            auth_token,
            task_list_id=arguments.get("task_list_id", "@default"),
            show_completed=arguments.get("show_completed", False),
            max_results=arguments.get("max_results", 50),
        )
    elif name == "create_task":
        result = await _create_task(auth_token, arguments)
    elif name == "update_task":
        result = await _update_task(auth_token, arguments)
    elif name == "complete_task":
        result = await _complete_task(
            auth_token,
            task_id=arguments.get("task_id", ""),
            task_list_id=arguments.get("task_list_id", "@default"),
        )
    elif name == "delete_task":
        result = await _delete_task(
            auth_token,
            task_id=arguments.get("task_id", ""),
            task_list_id=arguments.get("task_list_id", "@default"),
        )
    else:
        result = {"error": f"Unknown tool: {name}"}

    return [TextContent(type="text", text=json.dumps(result, default=str))]


async def _list_tasks(
    auth_token: str,
    task_list_id: str = "@default",
    show_completed: bool = False,
    max_results: int = 50,
) -> list[dict]:
    """List tasks from a task list.

    Args:
        auth_token: Google OAuth access token.
        task_list_id: The task list to query.
        show_completed: Whether to include completed tasks.
        max_results: Maximum number of tasks to return.

    Returns:
        List of task dictionaries.
    """
    try:
        service = get_tasks_service(auth_token)

        params = {
            "tasklist": task_list_id,
            "maxResults": max_results,
            "showCompleted": show_completed,
        }

        results = service.tasks().list(**params).execute()
        tasks = results.get("items", [])

        return [
            {
                "id": task.get("id", ""),
                "title": task.get("title", ""),
                "notes": task.get("notes", ""),
                "due": task.get("due", ""),
                "status": task.get("status", "needsAction"),
                "completed": task.get("status") == "completed",
                "updated": task.get("updated", ""),
            }
            for task in tasks
        ]
    except Exception as e:
        return [{"error": str(e)}]


async def _create_task(auth_token: str, arguments: dict) -> dict:
    """Create a new task.

    Args:
        auth_token: Google OAuth access token.
        arguments: Task details (title, notes, due_days_from_now).

    Returns:
        Created task data or error.
    """
    try:
        service = get_tasks_service(auth_token)
        task_list_id = arguments.get("task_list_id", "@default")

        task_body = {
            "title": arguments.get("title", ""),
            "notes": arguments.get("notes", ""),
        }

        # Calculate due date
        due_days = arguments.get("due_days_from_now", 7)
        due_date = datetime.utcnow() + timedelta(days=due_days)
        task_body["due"] = due_date.strftime("%Y-%m-%dT00:00:00.000Z")

        result = (
            service.tasks()
            .insert(tasklist=task_list_id, body=task_body)
            .execute()
        )

        return {
            "id": result.get("id", ""),
            "title": result.get("title", ""),
            "notes": result.get("notes", ""),
            "due": result.get("due", ""),
            "status": result.get("status", "needsAction"),
        }
    except Exception as e:
        return {"error": str(e)}


async def _update_task(auth_token: str, arguments: dict) -> dict:
    """Update an existing task.

    Args:
        auth_token: Google OAuth access token.
        arguments: Update details (task_id, title, notes, due_date).

    Returns:
        Updated task data or error.
    """
    task_id = arguments.get("task_id", "")
    if not task_id:
        return {"error": "task_id is required"}

    try:
        service = get_tasks_service(auth_token)
        task_list_id = arguments.get("task_list_id", "@default")

        # Get current task
        task = (
            service.tasks().get(tasklist=task_list_id, task=task_id).execute()
        )

        # Update fields if provided
        if "title" in arguments:
            task["title"] = arguments["title"]
        if "notes" in arguments:
            task["notes"] = arguments["notes"]
        if "due_date" in arguments:
            task["due"] = arguments["due_date"]

        result = (
            service.tasks()
            .update(tasklist=task_list_id, task=task_id, body=task)
            .execute()
        )

        return {
            "id": result.get("id", ""),
            "title": result.get("title", ""),
            "notes": result.get("notes", ""),
            "due": result.get("due", ""),
            "status": result.get("status", ""),
        }
    except Exception as e:
        return {"error": str(e)}


async def _complete_task(
    auth_token: str, task_id: str, task_list_id: str = "@default"
) -> dict:
    """Mark a task as completed.

    Args:
        auth_token: Google OAuth access token.
        task_id: The task ID to complete.
        task_list_id: The task list containing the task.

    Returns:
        Updated task data or error.
    """
    if not task_id:
        return {"error": "task_id is required"}

    try:
        service = get_tasks_service(auth_token)

        # Get current task
        task = (
            service.tasks().get(tasklist=task_list_id, task=task_id).execute()
        )

        # Mark as completed
        task["status"] = "completed"

        result = (
            service.tasks()
            .update(tasklist=task_list_id, task=task_id, body=task)
            .execute()
        )

        return {
            "id": result.get("id", ""),
            "title": result.get("title", ""),
            "status": "completed",
            "completed": True,
        }
    except Exception as e:
        return {"error": str(e)}


async def _delete_task(
    auth_token: str, task_id: str, task_list_id: str = "@default"
) -> dict:
    """Delete a task.

    Args:
        auth_token: Google OAuth access token.
        task_id: The task ID to delete.
        task_list_id: The task list containing the task.

    Returns:
        Success status or error.
    """
    if not task_id:
        return {"error": "task_id is required"}

    try:
        service = get_tasks_service(auth_token)
        service.tasks().delete(tasklist=task_list_id, task=task_id).execute()
        return {"success": True, "deleted_task_id": task_id}
    except Exception as e:
        return {"error": str(e)}


async def main():
    """Run the MCP server using stdio transport."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
