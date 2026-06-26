"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CalendarEvent } from "@/lib/api";
import type { CalendarViewProps } from "./types";
import EventCard from "./EventCard";

function groupByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  for (const event of sorted) {
    const dateKey = new Date(event.start).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(event);
  }
  return groups;
}

export default function ListView({
  events,
  onSelectEvent,
  onDeleteEvent,
}: CalendarViewProps) {
  const grouped = groupByDate(events);

  if (events.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="bg-accent-gradient bg-clip-text text-sm font-medium text-transparent">
          No upcoming events
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AnimatePresence mode="popLayout">
        {Array.from(grouped.entries()).map(([date, dayEvents]) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <h4 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-white/40">
              {date}
            </h4>
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <EventCard
                  key={event.id || event.summary}
                  event={event}
                  onDelete={onDeleteEvent}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
