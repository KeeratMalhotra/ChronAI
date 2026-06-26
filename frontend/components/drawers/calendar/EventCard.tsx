"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, MoreHorizontal, Trash2, Users } from "lucide-react";
import type { CalendarEvent } from "@/lib/api";

interface EventCardProps {
  event: CalendarEvent;
  onDelete: (eventId: string) => void;
  compact?: boolean;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function EventCard({ event, onDelete, compact }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (compact) {
    return (
      <div className="group relative mb-1 overflow-hidden rounded-lg border-l-2 border-l-accent-magenta bg-white/[0.04] px-2 py-1 text-[11px] transition-colors hover:bg-white/[0.07]">
        <p className="truncate text-white/80">{event.summary}</p>
        <p className="font-mono text-[10px] text-white/40">{formatTime(event.start)}</p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl transition-shadow hover:shadow-[0_0_20px_-4px_rgba(255,45,175,0.15)]"
    >
      {/* Gradient left border */}
      <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-accent-magenta to-accent-cyan" />

      <div className="p-4 pl-5">
        <div className="flex items-start justify-between">
          <button
            className="min-w-0 flex-1 text-left"
            onClick={() => setExpanded(!expanded)}
          >
            <p className="truncate text-[14px] font-medium text-white/90">
              {event.summary}
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-white/45">
              <Clock size={11} />
              {formatTime(event.start)} - {formatTime(event.end)}
            </p>
          </button>

          {/* Menu button */}
          <div className="relative ml-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid h-7 w-7 place-items-center rounded-lg text-white/30 opacity-0 transition-all hover:bg-white/[0.06] hover:text-white/70 group-hover:opacity-100"
            >
              <MoreHorizontal size={14} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-xl border border-white/[0.08] bg-base-800 shadow-panel"
                >
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-white/[0.05]"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  ) : (
                    <div className="p-2">
                      <p className="mb-2 text-[11px] text-white/60">
                        Delete this event?
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            if (event.id) onDelete(event.id);
                            setMenuOpen(false);
                            setConfirmDelete(false);
                          }}
                          className="flex-1 rounded-lg bg-red-500/20 px-2 py-1 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/30"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDelete(false);
                            setMenuOpen(false);
                          }}
                          className="flex-1 rounded-lg bg-white/[0.05] px-2 py-1 text-[11px] font-medium text-white/60 transition-colors hover:bg-white/[0.08]"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
                {event.location && (
                  <p className="flex items-center gap-2 text-xs text-white/50">
                    <MapPin size={12} className="text-accent-cyan" />
                    {event.location}
                  </p>
                )}
                {event.description && (
                  <p className="text-xs leading-relaxed text-white/40">
                    {event.description}
                  </p>
                )}
                {event.attendees && event.attendees.length > 0 && (
                  <p className="flex items-center gap-2 text-xs text-white/50">
                    <Users size={12} className="text-accent-magenta" />
                    {event.attendees.join(", ")}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
