"""Google Gmail MCP Server.

Provides tools for interacting with Google Gmail API:
- list_emails: List recent emails from inbox
- read_email: Read a specific email by ID
- send_email: Send an email
- draft_email: Create a draft email
- search_emails: Search emails with Gmail query syntax
"""

import base64
import json
from email.mime.text import MIMEText
from typing import Any

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool


server = Server("google-gmail")


def get_gmail_service(auth_token: str):
    """Create a Google Gmail API service instance.

    Args:
        auth_token: OAuth2 access token for authentication.

    Returns:
        Google Gmail API service resource.
    """
    credentials = Credentials(token=auth_token)
    return build("gmail", "v1", credentials=credentials)


@server.list_tools()
async def list_tools() -> list[Tool]:
    """List all available Gmail tools."""
    return [
        Tool(
            name="list_emails",
            description="List recent emails from inbox with optional filters",
            inputSchema={
                "type": "object",
                "properties": {
                    "auth_token": {
                        "type": "string",
                        "description": "Google OAuth access token",
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of emails to return (default: 10)",
                        "default": 10,
                    },
                    "label_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Label IDs to filter by (default: ['INBOX'])",
                        "default": ["INBOX"],
                    },
                },
                "required": ["auth_token"],
            },
        ),
        Tool(
            name="read_email",
            description="Read a specific email by its ID, returning subject, from, to, date, and body",
            inputSchema={
                "type": "object",
                "properties": {
                    "auth_token": {
                        "type": "string",
                        "description": "Google OAuth access token",
                    },
                    "email_id": {
                        "type": "string",
                        "description": "The ID of the email to read",
                    },
                },
                "required": ["auth_token", "email_id"],
            },
        ),
        Tool(
            name="send_email",
            description="Send an email to a recipient",
            inputSchema={
                "type": "object",
                "properties": {
                    "auth_token": {
                        "type": "string",
                        "description": "Google OAuth access token",
                    },
                    "to": {
                        "type": "string",
                        "description": "Recipient email address",
                    },
                    "subject": {
                        "type": "string",
                        "description": "Email subject line",
                    },
                    "body": {
                        "type": "string",
                        "description": "Email body text",
                    },
                },
                "required": ["auth_token", "to", "subject", "body"],
            },
        ),
        Tool(
            name="draft_email",
            description="Create a draft email without sending it",
            inputSchema={
                "type": "object",
                "properties": {
                    "auth_token": {
                        "type": "string",
                        "description": "Google OAuth access token",
                    },
                    "to": {
                        "type": "string",
                        "description": "Recipient email address",
                    },
                    "subject": {
                        "type": "string",
                        "description": "Email subject line",
                    },
                    "body": {
                        "type": "string",
                        "description": "Email body text",
                    },
                },
                "required": ["auth_token", "to", "subject", "body"],
            },
        ),
        Tool(
            name="search_emails",
            description="Search emails using Gmail query syntax (e.g., 'from:user@example.com', 'subject:meeting', 'is:unread')",
            inputSchema={
                "type": "object",
                "properties": {
                    "auth_token": {
                        "type": "string",
                        "description": "Google OAuth access token",
                    },
                    "query": {
                        "type": "string",
                        "description": "Gmail search query string",
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return (default: 10)",
                        "default": 10,
                    },
                },
                "required": ["auth_token", "query"],
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

    if name == "list_emails":
        result = await _list_emails(
            auth_token,
            max_results=arguments.get("max_results", 10),
            label_ids=arguments.get("label_ids", ["INBOX"]),
        )
    elif name == "read_email":
        result = await _read_email(auth_token, arguments.get("email_id", ""))
    elif name == "send_email":
        result = await _send_email(
            auth_token,
            to=arguments.get("to", ""),
            subject=arguments.get("subject", ""),
            body=arguments.get("body", ""),
        )
    elif name == "draft_email":
        result = await _draft_email(
            auth_token,
            to=arguments.get("to", ""),
            subject=arguments.get("subject", ""),
            body=arguments.get("body", ""),
        )
    elif name == "search_emails":
        result = await _search_emails(
            auth_token,
            query=arguments.get("query", ""),
            max_results=arguments.get("max_results", 10),
        )
    else:
        result = {"error": f"Unknown tool: {name}"}

    return [TextContent(type="text", text=json.dumps(result, default=str))]


def _get_header_value(headers: list[dict], name: str) -> str:
    """Extract a header value from a list of email headers.

    Args:
        headers: List of header dictionaries with 'name' and 'value' keys.
        name: The header name to look for (case-insensitive).

    Returns:
        The header value, or empty string if not found.
    """
    for header in headers:
        if header.get("name", "").lower() == name.lower():
            return header.get("value", "")
    return ""


def _decode_body(payload: dict) -> str:
    """Decode the email body from a Gmail message payload.

    Args:
        payload: The message payload dictionary from Gmail API.

    Returns:
        Decoded body text.
    """
    # Check if body data is directly in payload
    body_data = payload.get("body", {}).get("data", "")
    if body_data:
        return base64.urlsafe_b64decode(body_data).decode("utf-8", errors="replace")

    # Check parts for text/plain content
    parts = payload.get("parts", [])
    for part in parts:
        mime_type = part.get("mimeType", "")
        if mime_type == "text/plain":
            data = part.get("body", {}).get("data", "")
            if data:
                return base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")

    # Fallback: check for text/html
    for part in parts:
        mime_type = part.get("mimeType", "")
        if mime_type == "text/html":
            data = part.get("body", {}).get("data", "")
            if data:
                return base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")

    # Check nested parts (multipart messages)
    for part in parts:
        nested_parts = part.get("parts", [])
        if nested_parts:
            result = _decode_body(part)
            if result:
                return result

    return ""


async def _list_emails(
    auth_token: str, max_results: int = 10, label_ids: list[str] | None = None
) -> list[dict]:
    """List recent emails from the inbox.

    Args:
        auth_token: Google OAuth access token.
        max_results: Maximum number of emails to return.
        label_ids: Label IDs to filter by.

    Returns:
        List of email summary dictionaries.
    """
    if label_ids is None:
        label_ids = ["INBOX"]

    try:
        service = get_gmail_service(auth_token)
        results = (
            service.users()
            .messages()
            .list(userId="me", maxResults=max_results, labelIds=label_ids)
            .execute()
        )

        messages = results.get("messages", [])
        emails = []

        for msg_ref in messages:
            msg = (
                service.users()
                .messages()
                .get(userId="me", id=msg_ref["id"], format="metadata",
                     metadataHeaders=["Subject", "From", "Date"])
                .execute()
            )

            headers = msg.get("payload", {}).get("headers", [])
            emails.append({
                "id": msg.get("id", ""),
                "thread_id": msg.get("threadId", ""),
                "subject": _get_header_value(headers, "Subject"),
                "from": _get_header_value(headers, "From"),
                "date": _get_header_value(headers, "Date"),
                "snippet": msg.get("snippet", ""),
                "label_ids": msg.get("labelIds", []),
            })

        return emails
    except Exception as e:
        return [{"error": str(e)}]


async def _read_email(auth_token: str, email_id: str) -> dict:
    """Read a specific email by its ID.

    Args:
        auth_token: Google OAuth access token.
        email_id: The ID of the email to read.

    Returns:
        Email details including subject, from, to, date, and body.
    """
    if not email_id:
        return {"error": "email_id is required"}

    try:
        service = get_gmail_service(auth_token)
        msg = (
            service.users()
            .messages()
            .get(userId="me", id=email_id, format="full")
            .execute()
        )

        headers = msg.get("payload", {}).get("headers", [])
        body = _decode_body(msg.get("payload", {}))

        return {
            "id": msg.get("id", ""),
            "thread_id": msg.get("threadId", ""),
            "subject": _get_header_value(headers, "Subject"),
            "from": _get_header_value(headers, "From"),
            "to": _get_header_value(headers, "To"),
            "date": _get_header_value(headers, "Date"),
            "body": body,
            "label_ids": msg.get("labelIds", []),
        }
    except Exception as e:
        return {"error": str(e)}


async def _send_email(auth_token: str, to: str, subject: str, body: str) -> dict:
    """Send an email.

    Args:
        auth_token: Google OAuth access token.
        to: Recipient email address.
        subject: Email subject line.
        body: Email body text.

    Returns:
        Sent message details or error.
    """
    if not to or not subject:
        return {"error": "Both 'to' and 'subject' are required"}

    try:
        service = get_gmail_service(auth_token)

        message = MIMEText(body)
        message["to"] = to
        message["subject"] = subject

        raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
        send_body = {"raw": raw}

        sent = (
            service.users()
            .messages()
            .send(userId="me", body=send_body)
            .execute()
        )

        return {
            "id": sent.get("id", ""),
            "thread_id": sent.get("threadId", ""),
            "label_ids": sent.get("labelIds", []),
            "status": "sent",
        }
    except Exception as e:
        return {"error": str(e)}


async def _draft_email(auth_token: str, to: str, subject: str, body: str) -> dict:
    """Create a draft email.

    Args:
        auth_token: Google OAuth access token.
        to: Recipient email address.
        subject: Email subject line.
        body: Email body text.

    Returns:
        Draft details or error.
    """
    if not to or not subject:
        return {"error": "Both 'to' and 'subject' are required"}

    try:
        service = get_gmail_service(auth_token)

        message = MIMEText(body)
        message["to"] = to
        message["subject"] = subject

        raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
        draft_body = {"message": {"raw": raw}}

        draft = (
            service.users()
            .drafts()
            .create(userId="me", body=draft_body)
            .execute()
        )

        return {
            "id": draft.get("id", ""),
            "message_id": draft.get("message", {}).get("id", ""),
            "status": "draft_created",
        }
    except Exception as e:
        return {"error": str(e)}


async def _search_emails(auth_token: str, query: str, max_results: int = 10) -> list[dict]:
    """Search emails using Gmail query syntax.

    Args:
        auth_token: Google OAuth access token.
        query: Gmail search query string.
        max_results: Maximum number of results to return.

    Returns:
        List of matching email summaries.
    """
    if not query:
        return [{"error": "query is required"}]

    try:
        service = get_gmail_service(auth_token)
        results = (
            service.users()
            .messages()
            .list(userId="me", q=query, maxResults=max_results)
            .execute()
        )

        messages = results.get("messages", [])
        emails = []

        for msg_ref in messages:
            msg = (
                service.users()
                .messages()
                .get(userId="me", id=msg_ref["id"], format="metadata",
                     metadataHeaders=["Subject", "From", "Date"])
                .execute()
            )

            headers = msg.get("payload", {}).get("headers", [])
            emails.append({
                "id": msg.get("id", ""),
                "thread_id": msg.get("threadId", ""),
                "subject": _get_header_value(headers, "Subject"),
                "from": _get_header_value(headers, "From"),
                "date": _get_header_value(headers, "Date"),
                "snippet": msg.get("snippet", ""),
            })

        return emails
    except Exception as e:
        return [{"error": str(e)}]


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
