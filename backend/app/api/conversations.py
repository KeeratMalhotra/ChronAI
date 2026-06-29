"""Conversations API router - fetch persistent chat history.

Provides a REST endpoint for the frontend to load the user's past messages
so the conversation thread survives page refreshes and tab closures.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Query, status

from app.auth import verify_google_token
from app.db.repositories import MessageRepository

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


def _extract_token(auth_token: Optional[str], authorization: Optional[str]) -> str:
    """Resolve a bearer token from a query param or Authorization header."""
    token = auth_token
    if not token and authorization:
        token = (
            authorization[7:]
            if authorization.startswith("Bearer ")
            else authorization
        )
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return token


@router.get("/history")
async def get_history(
    auth_token: Optional[str] = Query(default=None),
    authorization: Optional[str] = Header(default=None),
    limit: int = Query(default=50, ge=1, le=200),
):
    """Return the user's recent chat messages for conversation continuity.

    Messages are returned oldest-first so the frontend can render them in
    chronological order.

    Args:
        auth_token: Google OAuth token (query param).
        authorization: Bearer token (header, fallback).
        limit: Maximum number of messages to return (default 50, max 200).

    Returns:
        Dict with 'messages' list, each item has id, role, content, timestamp.
    """
    token = _extract_token(auth_token, authorization)
    user_info = await verify_google_token(token)
    user_id = user_info.get("sub", "")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not determine user identity",
        )

    messages = await MessageRepository.get_history(user_id, limit=limit)
    return {"messages": messages}
