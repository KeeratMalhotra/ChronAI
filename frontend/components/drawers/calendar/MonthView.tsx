"use client";

import type { CalendarEvent } from "@/lib/api";
import type { CalendarViewProps } from "./types";

function getMonthGrid(date: Date): (Date | null)[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const grid: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) grid.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    grid.push(new Date(year, month, d));
  }
  // Fill remaining to complete grid
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function getEventDotsForDay(events: CalendarEvent[], day: Date): number {
  return events.filter((ev) => {
    const evDate = new Date(ev.start);
    return evDate.toDateString() === day.toDateString();
  }).length;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function MonthView({
  events,
  currentDate,
  onSelectDate,
}: CalendarViewProps) {
  const grid = getMonthGrid(currentDate);
  const todayStr = new Date().toDateString();

  return (
    <div className="space-y-2">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-medium uppercase tracking-wider text-white/30"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="h-10" />;
          }

          const isToday = day.toDateString() === todayStr;
          const isCurrentMonth =
            day.getMonth() === currentDate.getMonth();
          const eventCount = getEventDotsForDay(events, day);

          return (
            <button
              key={`day-${i}`}
              onClick={() => onSelectDate(day)}
              className={`flex h-10 flex-col items-center justify-center rounded-lg transition-colors ${
                isToday
                  ? "bg-accent-gradient text-white shadow-glow"
                  : isCurrentMonth
                    ? "text-white/70 hover:bg-white/[0.05]"
                    : "text-white/25"
              }`}
            >
              <span className="font-mono text-[12px]">{day.getDate()}</span>
              {eventCount > 0 && (
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(eventCount, 3) }).map(
                    (_, dotIdx) => (
                      <div
                        key={dotIdx}
                        className={`h-1 w-1 rounded-full ${
                          isToday ? "bg-white/80" : "bg-accent-cyan/60"
                        }`}
                      />
                    )
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
