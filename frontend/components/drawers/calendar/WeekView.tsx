"use client";

import type { CalendarEvent } from "@/lib/api";
import type { CalendarViewProps } from "./types";
import EventCard from "./EventCard";

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  start.setDate(start.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((ev) => {
    const evDate = new Date(ev.start);
    return evDate.toDateString() === day.toDateString();
  });
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeekView({
  events,
  currentDate,
  onSelectDate,
  onSelectEvent,
  onDeleteEvent,
}: CalendarViewProps) {
  const weekDays = getWeekDays(currentDate);
  const todayStr = new Date().toDateString();

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[480px] grid-cols-7 gap-1">
        {/* Header row */}
        {weekDays.map((day, i) => {
          const isToday = day.toDateString() === todayStr;
          return (
            <button
              key={i}
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center rounded-xl p-2 transition-colors ${
                isToday
                  ? "bg-white/[0.06] ring-1 ring-accent-cyan/30"
                  : "hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                {DAY_LABELS[i]}
              </span>
              <span
                className={`mt-0.5 font-mono text-sm ${
                  isToday ? "text-accent-cyan" : "text-white/80"
                }`}
              >
                {day.getDate()}
              </span>
            </button>
          );
        })}

        {/* Event columns */}
        {weekDays.map((day, i) => {
          const dayEvents = getEventsForDay(events, day);
          const isToday = day.toDateString() === todayStr;
          return (
            <div
              key={`col-${i}`}
              className={`min-h-[200px] rounded-xl p-1 ${
                isToday ? "bg-white/[0.02]" : ""
              }`}
            >
              {dayEvents.slice(0, 4).map((ev) => (
                <EventCard
                  key={ev.id || ev.summary}
                  event={ev}
                  onDelete={onDeleteEvent}
                  compact
                />
              ))}
              {dayEvents.length > 4 && (
                <p className="mt-1 text-center text-[10px] text-white/30">
                  +{dayEvents.length - 4} more
                </p>
              )}
              {dayEvents.length === 0 && (
                <div className="flex h-full min-h-[60px] items-center justify-center">
                  <div className="h-1 w-1 rounded-full bg-white/10" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
