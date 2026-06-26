"use client";

import { useState, useEffect, useCallback } from "react";
import { Flame, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Drawer from "./Drawer";
import {
  fetchHabits,
  checkinHabit,
  createHabit,
  type HabitItem,
} from "@/lib/api";

interface HabitsDrawerProps {
  open: boolean;
  onClose: () => void;
  accessToken: string;
}

// Frequency options for the add-habit form
const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "daily", days: 7 },
  { label: "6x / week", value: "6x_week", days: 6 },
  { label: "5x / week", value: "5x_week", days: 5 },
  { label: "4x / week", value: "4x_week", days: 4 },
  { label: "3x / week", value: "3x_week", days: 3 },
  { label: "2x / week", value: "2x_week", days: 2 },
];

/**
 * Compute which of the last 7 days have a completion entry.
 * Returns an array of 7 booleans (index 0 = 6 days ago, index 6 = today).
 */
function getLast7DaysDots(history: { completed_at: string }[]): boolean[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dots: boolean[] = [];

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const dayStr = day.toISOString().slice(0, 10);
    const completed = history.some(
      (h) => h.completed_at && h.completed_at.slice(0, 10) === dayStr
    );
    dots.push(completed);
  }
  return dots;
}

/**
 * Compute completions in the current week (last 7 days).
 */
function getWeeklyCompletions(history: { completed_at: string }[]): number {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  return history.filter((h) => {
    const d = new Date(h.completed_at);
    return d >= weekAgo && d <= today;
  }).length;
}

/**
 * StreakRing - circular SVG progress indicator.
 */
function StreakRing({
  completions,
  target,
}: {
  completions: number;
  target: number;
}) {
  const radius = 16;
  const stroke = 3;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(completions / target, 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      className="shrink-0"
      aria-label={`${Math.round(pct * 100)}% weekly goal`}
    >
      {/* Background circle */}
      <circle
        cx={20}
        cy={20}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      {/* Progress arc */}
      <circle
        cx={20}
        cy={20}
        r={radius}
        fill="none"
        stroke="url(#ring-gradient)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 20 20)"
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-magenta, #e040fb)" />
          <stop offset="100%" stopColor="var(--accent-cyan, #00e5ff)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * HabitsDrawer - shows real habits from API with streak rings,
 * 7-day completion dots, check-in with animation, and add-habit form.
 */
export default function HabitsDrawer({
  open,
  onClose,
  accessToken,
}: HabitsDrawerProps) {
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Add-habit form state
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFrequency, setNewFrequency] = useState(FREQUENCY_OPTIONS[0]);
  const [creating, setCreating] = useState(false);

  const loadHabits = useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    fetchHabits(accessToken)
      .then((data) => setHabits(data))
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    if (open && accessToken) {
      loadHabits();
    }
  }, [open, accessToken, loadHabits]);

  const handleCheckin = async (habitId: string) => {
    setError(null);
    try {
      const updated = await checkinHabit(accessToken, habitId);
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? updated : h))
      );
      setCheckedIn((prev) => new Set(prev).add(habitId));
      // Clear animation flag after a short delay
      setTimeout(() => {
        setCheckedIn((prev) => {
          const next = new Set(prev);
          next.delete(habitId);
          return next;
        });
      }, 800);
    } catch {
      setError("Failed to check in. Please try again.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const habit = await createHabit(
        accessToken,
        newName.trim(),
        newFrequency.value,
        newFrequency.days
      );
      setHabits((prev) => [...prev, habit]);
      setNewName("");
      setShowForm(false);
    } catch {
      setError("Failed to create habit. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Habits"
      subtitle="Small things, kept"
      icon={<Flame size={18} />}
    >
      <div className="flex flex-col gap-3">
        {/* Error banner */}
        {error && (
          <div className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400 ring-1 ring-red-500/20">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && habits.length === 0 && (
          <div className="py-8 text-center text-sm text-white/40">
            Loading habits...
          </div>
        )}

        {/* Empty state */}
        {!loading && habits.length === 0 && (
          <div className="py-8 text-center text-sm text-white/40">
            No habits yet. Add one below to start tracking.
          </div>
        )}

        {/* Habit cards */}
        <AnimatePresence mode="popLayout">
          {habits.map((habit) => {
            const dots = getLast7DaysDots(habit.history || []);
            const weeklyCompletions = getWeeklyCompletions(
              habit.history || []
            );
            const justCheckedIn = checkedIn.has(habit.id);

            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: justCheckedIn ? [1, 1.03, 1] : 1,
                }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl p-4 ring-1 transition-colors ${
                  justCheckedIn
                    ? "bg-accent-magenta/10 ring-accent-magenta/30"
                    : "bg-white/[0.03] ring-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Streak ring */}
                  <StreakRing
                    completions={weeklyCompletions}
                    target={habit.target_days}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-medium text-white/90 truncate">
                        {habit.name}
                      </p>
                      <span className="flex items-center gap-1 text-xs text-accent-magenta shrink-0 ml-2">
                        <Flame size={13} /> {habit.streak}
                      </span>
                    </div>

                    {/* 7-day dots */}
                    <div className="mt-2 flex gap-1.5">
                      {dots.map((completed, i) => (
                        <span
                          key={i}
                          className={`h-5 flex-1 rounded-md ${
                            completed
                              ? "bg-gradient-to-br from-accent-magenta/70 to-accent-cyan/70"
                              : "bg-white/[0.05]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Check-in button */}
                  <motion.button
                    onClick={() => handleCheckin(habit.id)}
                    whileTap={{ scale: 0.9 }}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-white/60 ring-1 ring-white/10 transition-colors hover:bg-accent-magenta/20 hover:text-accent-magenta hover:ring-accent-magenta/30"
                    aria-label={`Check in ${habit.name}`}
                  >
                    <Check size={16} />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add habit section */}
        <div className="mt-2">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 py-3 text-sm text-white/40 transition-colors hover:border-white/20 hover:text-white/60"
            >
              <Plus size={15} />
              Add habit
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreate}
              className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]"
            >
              <input
                type="text"
                placeholder="Habit name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mb-3 w-full rounded-xl bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/[0.08] focus:ring-accent-cyan/40"
                autoFocus
              />
              <div className="mb-3 flex items-center gap-2">
                <label className="text-xs text-white/40">Frequency:</label>
                <select
                  value={newFrequency.value}
                  onChange={(e) => {
                    const opt = FREQUENCY_OPTIONS.find(
                      (o) => o.value === e.target.value
                    );
                    if (opt) setNewFrequency(opt);
                  }}
                  className="rounded-lg bg-white/[0.04] px-2 py-1.5 text-xs text-white/80 outline-none ring-1 ring-white/[0.08] focus:ring-accent-cyan/40"
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="flex-1 rounded-xl bg-accent-magenta/20 px-3 py-2 text-sm font-medium text-accent-magenta transition-colors hover:bg-accent-magenta/30 disabled:opacity-40"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setNewName("");
                  }}
                  className="rounded-xl px-3 py-2 text-sm text-white/40 transition-colors hover:text-white/60"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </Drawer>
  );
}
