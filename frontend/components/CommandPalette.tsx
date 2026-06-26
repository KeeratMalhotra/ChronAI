"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ListTodo,
  Flame,
  MessageSquare,
  Sparkles,
  Timer,
  Search,
  BarChart3,
} from "lucide-react";
import type { PanelKey } from "@/components/layout/SideDock";

interface CommandPaletteProps {
  onSendChat: (message: string) => void;
  onOpenPanel: (key: PanelKey) => void;
  onFocusMode: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  group: string;
  action: () => void;
}

/**
 * CommandPalette
 * Global Cmd+K / Ctrl+K command palette using cmdk.
 * Glass panel, dark, centered modal with keyboard navigation.
 */
export default function CommandPalette({
  onSendChat,
  onOpenPanel,
  onFocusMode,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const actions: QuickAction[] = [
    {
      id: "add-event",
      label: "Add event...",
      icon: <CalendarDays size={16} />,
      group: "Actions",
      action: () => {
        onSendChat("Add event: ");
        setOpen(false);
      },
    },
    {
      id: "add-task",
      label: "Add task...",
      icon: <ListTodo size={16} />,
      group: "Actions",
      action: () => {
        onSendChat("Add task: ");
        setOpen(false);
      },
    },
    {
      id: "check-habit",
      label: "Check in habit...",
      icon: <Flame size={16} />,
      group: "Actions",
      action: () => {
        onSendChat("Check in habit");
        setOpen(false);
      },
    },
    {
      id: "whats-next",
      label: "What's next?",
      icon: <Sparkles size={16} />,
      group: "Chat",
      action: () => {
        onSendChat("What's next?");
        setOpen(false);
      },
    },
    {
      id: "weekly-review",
      label: "Weekly review",
      icon: <BarChart3 size={16} />,
      group: "Chat",
      action: () => {
        onSendChat("Weekly review");
        setOpen(false);
      },
    },
    {
      id: "focus-mode",
      label: "Focus mode",
      icon: <Timer size={16} />,
      group: "Mode",
      action: () => {
        onFocusMode();
        setOpen(false);
      },
    },
    {
      id: "open-calendar",
      label: "Open Calendar",
      icon: <CalendarDays size={16} />,
      group: "Navigation",
      action: () => {
        onOpenPanel("calendar");
        setOpen(false);
      },
    },
    {
      id: "open-habits",
      label: "Open Habits",
      icon: <Flame size={16} />,
      group: "Navigation",
      action: () => {
        onOpenPanel("habits");
        setOpen(false);
      },
    },
    {
      id: "open-tasks",
      label: "Open Tasks",
      icon: <ListTodo size={16} />,
      group: "Navigation",
      action: () => {
        onOpenPanel("tasks");
        setOpen(false);
      },
    },
  ];

  // Group actions by category
  const groups = Array.from(new Set(actions.map((a) => a.group)));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[91] flex items-start justify-center pt-[20vh]"
          >
            <Command
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-base-950/90 shadow-2xl backdrop-blur-xl"
              loop
            >
              {/* Search input */}
              <div className="flex items-center gap-2 border-b border-white/10 px-4">
                <Search size={16} className="text-white/40" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className="h-12 w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                />
              </div>

              {/* Results list */}
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="px-4 py-8 text-center text-sm text-white/40">
                  No results found.
                </Command.Empty>

                {groups.map((group) => (
                  <Command.Group
                    key={group}
                    heading={group}
                    className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-white/30"
                  >
                    {actions
                      .filter((a) => a.group === group)
                      .map((item) => (
                        <Command.Item
                          key={item.id}
                          value={item.label}
                          onSelect={item.action}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 transition data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-white"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-white/60">
                            {item.icon}
                          </span>
                          {item.label}
                        </Command.Item>
                      ))}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer hint */}
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-2">
                <span className="text-xs text-white/30">
                  Navigate with arrow keys
                </span>
                <span className="text-xs text-white/30">
                  <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">
                    Esc
                  </kbd>{" "}
                  to close
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
