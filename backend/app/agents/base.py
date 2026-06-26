"""Base class for all ChronAI agents."""

import logging
from abc import ABC, abstractmethod
from typing import Any, Optional

logger = logging.getLogger(__name__)


class AgentRegistry:
    """Registry for managing agent instances."""

    _agents: dict[str, "AgentBase"] = {}

    @classmethod
    def register(cls, agent: "AgentBase") -> None:
        """Register an agent in the global registry.

        Args:
            agent: The agent instance to register.
        """
        cls._agents[agent.name] = agent

    @classmethod
    def deregister(cls, agent_name: str) -> None:
        """Remove an agent from the registry.

        Args:
            agent_name: The name of the agent to deregister.
        """
        cls._agents.pop(agent_name, None)

    @classmethod
    def get(cls, agent_name: str) -> Optional["AgentBase"]:
        """Get an agent by name.

        Args:
            agent_name: The name of the agent to retrieve.

        Returns:
            The agent instance, or None if not found.
        """
        return cls._agents.get(agent_name)

    @classmethod
    def list_agents(cls) -> list[str]:
        """List all registered agent names.

        Returns:
            List of registered agent names.
        """
        return list(cls._agents.keys())


class AgentBase(ABC):
    """Abstract base class for all agents.

    All agents must inherit from this class and implement the execute method.
    Agents are automatically registered upon initialization.
    """

    name: str = "base"
    description: str = "Base agent"
    capabilities: list[str] = []

    def __init__(self, mcp_client: Any = None):
        """Initialize the agent and register it.

        Args:
            mcp_client: Optional MCP client for tool access.
        """
        self.mcp_client = mcp_client
        self._tools: dict[str, dict] = {}
        AgentRegistry.register(self)

    @abstractmethod
    async def execute(self, task: dict) -> dict:
        """Execute a task and return the result.

        Args:
            task: Dictionary containing task details. Expected keys vary by agent
                  but typically include 'message', 'user_id', and 'context'.

        Returns:
            Dictionary containing the result. Always includes 'content' key
            with the response text or data, and 'agent' with this agent's name.
        """
        ...

    async def call_mcp_tool(self, server_name: str, tool_name: str, arguments: dict) -> Any:
        """Call an MCP tool through the client.

        Args:
            server_name: Name of the MCP server to call.
            tool_name: Name of the tool to invoke.
            arguments: Tool arguments as a dictionary.

        Returns:
            The tool's return value.

        Raises:
            RuntimeError: If MCP client is not configured.
        """
        if not self.mcp_client:
            raise RuntimeError(f"Agent '{self.name}' has no MCP client configured.")
        logger.info(f"[{self.name}] Calling MCP tool: {server_name}/{tool_name}")
        try:
            return await self.mcp_client.call_tool(server_name, tool_name, arguments)
        except Exception as e:
            logger.error(f"[{self.name}] MCP tool call failed: {server_name}/{tool_name} - {e}", exc_info=True)
            raise

    def bind_tools(self, tool_definitions: dict[str, dict]) -> None:
        """Bind MCP tool definitions to this agent.

        Args:
            tool_definitions: Mapping of tool names to their schema definitions.
        """
        self._tools.update(tool_definitions)

    def get_tool_descriptions(self) -> str:
        """Get formatted tool descriptions for LLM context.

        Returns:
            A string describing all available tools.
        """
        if not self._tools:
            return "No tools available."
        descriptions = []
        for name, schema in self._tools.items():
            desc = schema.get("description", "No description")
            params = schema.get("parameters", {})
            descriptions.append(f"- {name}: {desc}\n  Parameters: {params}")
        return "\n".join(descriptions)

    def __del__(self):
        """Deregister the agent when it is garbage collected."""
        AgentRegistry.deregister(self.name)
