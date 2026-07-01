"""Tests for the concise, grouped prioritization output (Option A).

These verify the static ``_format_priorities`` renderer directly (no Vertex/MCP
needed): high items become short one-liners, stale/low items are grouped under
a shared heading with a single explanation and one bulk-action suggestion, and
reasoning is never repeated per item.
"""

from app.agents.priority import PriorityAgent


RED = "\U0001f534"
YELLOW = "\U0001f7e1"
GREEN = "\U0001f7e2"


def test_high_items_are_short_lines_with_reason():
    data = {
        "summary": "One thing to prep for.",
        "priorities": [
            {"title": "Interview prep", "urgency": "high",
             "reason": "interview prep, due Jul 5", "stale": False},
        ],
    }
    out = PriorityAgent._format_priorities(data)
    assert out.startswith("One thing to prep for.")
    assert RED in out
    assert "Interview prep" in out
    assert "interview prep, due Jul 5" in out
    # A single high item should render as a single short line (summary + 1 line).
    assert len(out.splitlines()) == 2


def test_stale_items_are_grouped_with_single_explanation():
    data = {
        "summary": "Mostly stale.",
        "priorities": [
            {"title": "Buy milk", "urgency": "low",
             "reason": "long overdue", "stale": True,
             "group": "Stale - from Jun 12"},
            {"title": "Water plants", "urgency": "low",
             "reason": "long overdue", "stale": True,
             "group": "Stale - from Jun 12"},
            {"title": "Call plumber", "urgency": "low",
             "reason": "long overdue", "stale": True,
             "group": "Stale - from Jun 12"},
        ],
    }
    out = PriorityAgent._format_priorities(data)

    # All three names on ONE line together.
    assert "Buy milk, Water plants, Call plumber" in out
    # Green indicator + group heading with count.
    assert GREEN in out
    assert "Stale - from Jun 12 (3)" in out
    # A single bulk-action suggestion, not one per item.
    assert out.count("bulk-completing or deleting") == 1
    # The shared explanation appears once, not repeated per item.
    assert out.count("long overdue") == 1


def test_reasoning_not_repeated_across_stale_items():
    """Regression for Option A: no wall-of-text repeated justifications."""
    items = [
        {"title": f"Task {i}", "urgency": "low",
         "reason": "no recent activity", "stale": True,
         "group": "Stale tasks"}
        for i in range(7)
    ]
    out = PriorityAgent._format_priorities({"summary": "s", "priorities": items})
    # Seven stale tasks collapse into a compact block, not 7 paragraphs.
    assert out.count("no recent activity") == 1
    assert "Stale tasks (7)" in out
    # Compact: summary + blank + heading + names + suggestion == 5 lines.
    assert len(out.splitlines()) == 5


def test_mixed_active_and_stale_layout():
    data = {
        "summary": "Focus here.",
        "priorities": [
            {"title": "Ship release", "urgency": "high",
             "reason": "due in 2h", "stale": False},
            {"title": "Review PR", "urgency": "medium",
             "reason": "due tomorrow", "stale": False},
            {"title": "Old errand", "urgency": "low",
             "reason": "overdue", "stale": True},
        ],
    }
    out = PriorityAgent._format_priorities(data)
    assert RED in out and YELLOW in out and GREEN in out
    assert "Ship release" in out
    assert "Review PR" in out
    assert "Old errand" in out


def test_empty_state_message():
    out = PriorityAgent._format_priorities({"priorities": [], "summary": "x"})
    assert "all clear" in out.lower()


def test_low_urgency_without_explicit_stale_flag_is_grouped():
    """Low urgency alone (no stale flag) should still be treated as stale/grouped."""
    data = {
        "summary": "s",
        "priorities": [
            {"title": "Someday task", "urgency": "low", "reason": "no deadline"},
        ],
    }
    out = PriorityAgent._format_priorities(data)
    assert GREEN in out
    assert "Someday task" in out
