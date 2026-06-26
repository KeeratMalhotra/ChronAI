"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Square, Timer } from "lucide-react";

const DURATION_OPTIONS = [25, 45, 60, 90, 120] as const;

interface FocusModeProps {
  active: boolean;
  taskName?: string;
  initialDuration?: number; // minutes
  onStop: () => void;
}

/**
 * FocusMode
 * Full-screen overlay with a circular countdown ring, task name,
 * large timer, and Pause/Resume/Stop controls.
 */
export default function FocusMode({
  active,
  taskName,
  initialDuration = 90,
  onStop,
}: FocusModeProps) {
  const [duration, setDuration] = useState(initialDuration);
  const [secondsLeft, setSecondsLeft] = useState(initialDuration * 60);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when activated
  useEffect(() => {
    if (active) {
      setDuration(initialDuration);
      setSecondsLeft(initialDuration * 60);
      setPaused(false);
      setFinished(false);
      setStarted(false);
    }
  }, [active, initialDuration]);

  // Timer tick
  useEffect(() => {
    if (!active || !started || paused || finished) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, started, paused, finished]);

  const handleStart = useCallback(
    (mins: number) => {
      setDuration(mins);
      setSecondsLeft(mins * 60);
      setStarted(true);
      setPaused(false);
      setFinished(false);
    },
    []
  );

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  const totalSeconds = duration * 60;
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  // SVG ring dimensions
  const size = 280;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Ambient gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-base-950 via-purple-950/40 to-base-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative z-10 flex flex-col items-center gap-8"
          >
            {/* Completion state */}
            {finished && (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="text-5xl">🎉</div>
                <h2 className="text-2xl font-semibold text-white">
                  Nice work!
                </h2>
                <p className="max-w-sm text-lg text-white/70">
                  {duration} minutes of focused work
                  {taskName ? ` on '${taskName}'` : ""}
                </p>
                <button
                  onClick={onStop}
                  className="mt-4 rounded-full bg-white/10 px-8 py-3 text-sm font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20"
                >
                  Done
                </button>
              </div>
            )}

            {/* Duration selection (before starting) */}
            {!started && !finished && (
              <div className="flex flex-col items-center gap-6">
                {taskName && (
                  <p className="text-lg text-white/60">
                    Focus: {taskName}
                  </p>
                )}
                <h2 className="text-2xl font-semibold text-white">
                  Choose duration
                </h2>
                <div className="flex gap-3">
                  {DURATION_OPTIONS.map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleStart(mins)}
                      className={`rounded-full px-5 py-2.5 text-sm font-medium transition ring-1 ring-white/20 ${
                        mins === initialDuration
                          ? "bg-white/15 text-white"
                          : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <button
                  onClick={onStop}
                  className="mt-4 text-sm text-white/40 hover:text-white/70 transition"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Active timer */}
            {started && !finished && (
              <>
                {/* Task name */}
                {taskName && (
                  <p className="text-base text-white/60">
                    Focus: {taskName}
                  </p>
                )}

                {/* Circular countdown ring */}
                <div className="relative flex items-center justify-center">
                  <svg
                    width={size}
                    height={size}
                    className="-rotate-90"
                  >
                    {/* Background ring */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={stroke}
                    />
                    {/* Progress ring */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="url(#focusGradient)"
                      strokeWidth={stroke}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                    />
                    <defs>
                      <linearGradient
                        id="focusGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Timer text inside the ring */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-light tabular-nums text-white">
                      {String(minutes).padStart(2, "0")}:
                      {String(seconds).padStart(2, "0")}
                    </span>
                    <span className="mt-1 text-sm text-white/40">
                      {paused ? "Paused" : "remaining"}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePause}
                    className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
                    aria-label={paused ? "Resume" : "Pause"}
                  >
                    {paused ? (
                      <Play size={20} />
                    ) : (
                      <Pause size={20} />
                    )}
                  </button>
                  <button
                    onClick={onStop}
                    className="grid h-12 w-12 place-items-center rounded-full bg-red-500/20 text-red-300 ring-1 ring-red-500/30 transition hover:bg-red-500/30"
                    aria-label="Stop"
                  >
                    <Square size={18} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
