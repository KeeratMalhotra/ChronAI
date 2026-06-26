"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarView } from "./types";

interface DateNavProps {
  currentDate: Date;
  view: CalendarView;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

function formatHeader(date: Date, view: CalendarView): string {
  if (view === "day") {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
  if (view === "week") {
    const start = new Date(date);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const startStr = start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const endStr = end.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    return `${startStr} - ${endStr}`;
  }
  if (view === "month") {
    return date.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }
  return "Upcoming";
}

export default function DateNav({
  currentDate,
  view,
  onPrev,
  onNext,
  onToday,
}: DateNavProps) {
  const isToday =
    new Date().toDateString() === currentDate.toDateString();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="grid h-7 w-7 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={onNext}
          className="grid h-7 w-7 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <ChevronRight size={16} />
        </button>
        <h3 className="ml-1 text-sm font-medium text-white/90">
          {formatHeader(currentDate, view)}
        </h3>
      </div>
      {!isToday && (
        <button
          onClick={onToday}
          className="rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
        >
          Today
        </button>
      )}
    </div>
  );
}
