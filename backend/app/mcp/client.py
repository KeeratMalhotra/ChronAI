"""MCP Client - Manages connections to MCP servers.

Connects to MCP servers via stdio transport, discovers tools,
and executes tool calls on behalf of agents.
"""

import asyncio
import sys
from contextlib import AsyncExitStack
from typing import Any, Optional

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


class MCPClient:
    """Client that manages MCP server lifecycle and tool execution.

    Handles connecting to multiple MCP servers via stdio transport,
    discovering their available tools, and executing tool calls.
    """

    def __init__(self):
        """Initialize the MCP client with empty server state."""
        self._servers: dict[str, MCPServerConnection] = {}
        self._exit_stack = AsyncExitStack()

    async def start(self) -> None:
        """Start the MCP client and initialize the exit stack."""
        await self._exit_stack.__aenter__()

    async def stop(self) -> None:
        """Stop all MCP servers and clean up resources."""
        await self._exit_stack.__aexit__(None, None, None)
        self._servers.clear()

    async def connect_server(
        self, name: str, command: str, args: list[str], env: Optional[dict[str, str]] = None
    ) -> None:
        """Connect to an MCP server via stdio transport.

        Args:
            name: Unique name for this server connection.
            command: The command to execute (e.g., "python").
            args: Arguments for the command (e.g., ["server.py"]).
            env: Optional environment variables for the server process.
        """
        server_params = StdioServerParameters(
            command=command,
            args=args,
            env=env,
        )

        # Create stdio transport
        stdio_transport = await self._exit_stack.enter_async_context(
            stdio_client(server_params)
        )

        read_stream, write_stream = stdio_transport

        # Create and initialize session
        session = await self._exit_stack.enter_async_context(
            ClientSession(read_stream, write_stream)
        )
        await session.initialize()

        # Discover available tools
        tools_response = await session.list_tools()
        tools = {
            tool.name: {
                "name": tool.name,
                "description": tool.description or "",
                "parameters": tool.inputSchema if hasattr(tool, "inputSchema") else {},
            }
            for tool in tools_response.tools
        }

        self._servers[name] = MCPServerConnection(
            name=name,
            session=session,
            tools=tools,
        )

    async def disconnect_server(self, name: str) -> None:
        """Disconnect from an MCP server.

        Args:
            name: Name of the server to disconnect.
        """
        self._servers.pop(name, None)

    def list_servers(self) -> list[str]:
        """List all connected server names.

        Returns:
            List of connected server names.
        """
        return list(self._servers.keys())

    def list_tools(self, server_name: Optional[str] = None) -> dict[str, dict]:
        """List available tools, optionally filtered by server.

        Args:
            server_name: If provided, only list tools from this server.

        Returns:
            Dictionary mapping tool names to their schema definitions.
        """
        if server_name:
            server = self._servers.get(server_name)
            if not server:
                return {}
            return server.tools

        # All tools across all servers
        all_tools: dict[str, dict] = {}
        for server in self._servers.values():
            all_tools.update(server.tools)
        return all_tools

    async def call_tool(
        self, server_name: str, tool_name: str, arguments: dict[str, Any]
    ) -> Any:
        """Execute a tool call on a specific MCP server.

        Args:
            server_name: Name of the server hosting the tool.
            tool_name: Name of the tool to call.
            arguments: Tool arguments as a dictionary.

        Returns:
            The tool's result.

        Raises:
            ValueError: If server or tool is not found.
            RuntimeError: If tool execution fails.
        """
        server = self._servers.get(server_name)
        if not server:
            raise ValueError(
                f"Server '{server_name}' not found. "
                f"Available: {self.list_servers()}"
            )

        if tool_name not in server.tools:
            raise ValueError(
                f"Tool '{tool_name}' not found on server '{server_name}'. "
                f"Available tools: {list(server.tools.keys())}"
            )

        result = await server.session.call_tool(tool_name, arguments)

        # Extract content from the result
        if result.content:
            # MCP tools return content as a list of content blocks
            text_parts = []
            for block in result.content:
                if hasattr(block, "text"):
                    text_parts.append(block.text)
            combined = "\n".join(text_parts)
            # Try to parse as JSON
            try:
                import json
                return json.loads(combined)
            except (json.JSONDecodeError, ValueError):
                return combined

        return None


class MCPServerConnection:
    """Represents a connection to a single MCP server."""

    def __init__(self, name: str, session: ClientSession, tools: dict[str, dict]):
        """Initialize server connection.

        Args:
            name: The server's name.
            session: The MCP client session.
            tools: Dictionary of available tools and their schemas.
        """
        self.name = name
        self.session = session
        self.tools = tools
