"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type { CalendarEvent } from "@/lib/api";
import type { CalendarViewProps } from "./types";
import EventCard from "./EventCard";

const START_HOUR = 7;
const END_HOUR = 23;
const HOUR_HEIGHT = 60; // px per hour

function getEventPosition(event: CalendarEvent) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const top = ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMinutes - startMinutes) / 60) * HOUR_HEIGHT, 24);
  return { top, height };
}

export default function DayView({
  events,
  currentDate,
  onSelectEvent,
  onDeleteEvent,
}: CalendarViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dayEvents = events.filter((ev) => {
    const evDate = new Date(ev.start);
    return evDate.toDateString() === currentDate.toDateString();
  });

  const isToday = new Date().toDateString() === currentDate.toDateString();
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const timeLineTop = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;

  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => i + START_HOUR
  );

  const handleDragStart = useCallback(
    (eventId: string) => {
      setDraggingId(eventId);
      setDragOffset(0);
    },
    []
  );

  const handleDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!draggingId) return;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const y = clientY - rect.top + containerRef.current.scrollTop;
        setDragOffset(y);
      }
    },
    [draggingId]
  );

  const handleDragEnd = useCallback(() => {
    if (draggingId && dragOffset > 0) {
      const minutes = Math.round(
        (dragOffset / HOUR_HEIGHT) * 60 + START_HOUR * 60
      );
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      console.log(
        `[CalendarDrag] Event ${draggingId} moved to ${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
      );
    }
    setDraggingId(null);
    setDragOffset(0);
  }, [draggingId, dragOffset]);

  return (
    <div
      ref={containerRef}
      className="relative max-h-[calc(100vh-280px)] overflow-y-auto"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <div
        className="relative"
        style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
      >
        {/* Hour lines */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 flex items-start"
            style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
          >
            <span className="w-12 shrink-0 font-mono text-[11px] text-white/30">
              {hour === 0
                ? "12 AM"
                : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                    ? "12 PM"
                    : `${hour - 12} PM`}
            </span>
            <div className="mt-[6px] flex-1 border-t border-white/[0.05]" />
          </div>
        ))}

        {/* Current time indicator */}
        {isToday &&
          timeLineTop > 0 &&
          timeLineTop < (END_HOUR - START_HOUR) * HOUR_HEIGHT && (
            <div
              className="absolute left-12 right-0 z-10 flex items-center"
              style={{ top: `${timeLineTop}px` }}
            >
              <div className="relative h-2.5 w-2.5 rounded-full bg-red-500">
                <div className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-50" />
              </div>
              <div className="flex-1 border-t border-red-500" />
            </div>
          )}

        {/* Event blocks */}
        {dayEvents.map((event) => {
          const pos = getEventPosition(event);
          const isDragging = draggingId === event.id;
          const displayTop = isDragging && dragOffset > 0 ? dragOffset : pos.top;

          return (
            <motion.div
              key={event.id || event.summary}
              className="absolute left-14 right-2 z-[5] cursor-grab active:cursor-grabbing"
              style={{
                top: `${displayTop}px`,
                height: `${pos.height}px`,
              }}
              layout={!isDragging}
              onMouseDown={() => event.id && handleDragStart(event.id)}
              onTouchStart={() => event.id && handleDragStart(event.id)}
            >
              <div
                className="group relative h-full overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl transition-shadow hover:shadow-[0_0_16px_-4px_rgba(255,45,175,0.2)]"
                onClick={() => onSelectEvent(event)}
              >
                <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-accent-magenta to-accent-cyan" />
                <div className="p-2 pl-3">
                  <p className="truncate text-[12px] font-medium text-white/90">
                    {event.summary}
                  </p>
                  <p className="font-mono text-[10px] text-white/40">
                    {new Date(event.start).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {dayEvents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="bg-accent-gradient bg-clip-text text-sm font-medium text-transparent">
            No events today
          </p>
        </div>
      )}
    </div>
  );
}
