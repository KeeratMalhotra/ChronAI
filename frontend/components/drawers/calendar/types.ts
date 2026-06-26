import type { CalendarEvent } from "@/lib/api";

export type CalendarView = "day" | "week" | "month" | "list";

export interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}
