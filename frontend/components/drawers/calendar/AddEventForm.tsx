"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface AddEventFormProps {
  onSubmit: (data: {
    summary: string;
    start_time: string;
    duration_minutes: number;
  }) => void;
  onCancel: () => void;
  defaultDate?: Date;
}

const DURATIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 hr", value: 60 },
  { label: "1.5 hr", value: 90 },
  { label: "2 hr", value: 120 },
];

export default function AddEventForm({
  onSubmit,
  onCancel,
  defaultDate,
}: AddEventFormProps) {
  const now = defaultDate || new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(dateStr);
  const [time, setTime] = useState(timeStr);
  const [duration, setDuration] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const startTime = `${date}T${time}:00`;
    await onSubmit({ summary: title.trim(), start_time: startTime, duration_minutes: duration });
    setSubmitting(false);
  };

  return (
    <motion.form
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl"
    >
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-medium text-white/80">New Event</h4>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-6 w-6 place-items-center rounded-full text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            autoFocus
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-accent-cyan/40 focus:bg-white/[0.06]"
          />

          {/* Date and Time row */}
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 font-mono text-xs text-white outline-none transition-colors focus:border-accent-cyan/40"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-24 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 font-mono text-xs text-white outline-none transition-colors focus:border-accent-cyan/40"
            />
          </div>

          {/* Duration */}
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white outline-none transition-colors focus:border-accent-cyan/40"
          >
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value} className="bg-base-800 text-white">
                {d.label}
              </option>
            ))}
          </select>

          {/* Submit */}
          <button
            type="submit"
            disabled={!title.trim() || submitting}
            className="w-full rounded-xl bg-accent-gradient px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            {submitting ? "Creating..." : "Create Event"}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
