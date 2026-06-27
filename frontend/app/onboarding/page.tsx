"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  Rocket,
  Palette,
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";
import { postOnboarding } from "@/lib/api";
import { Button } from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/* Types & constants                                                    */
/* ------------------------------------------------------------------ */

const ROLES = [
  { id: "professional", label: "Professional", icon: Briefcase },
  { id: "student", label: "Student", icon: GraduationCap },
  { id: "entrepreneur", label: "Entrepreneur", icon: Rocket },
  { id: "freelancer", label: "Freelancer", icon: Palette },
  { id: "other", label: "Other", icon: User },
] as const;

const PRIORITIES = [
  "Deep Work",
  "Meetings",
  "Exercise",
  "Learning",
  "Family Time",
  "Side Projects",
  "Health",
  "Networking",
  "Creative Work",
  "Rest & Recovery",
] as const;

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return { value: i, label: `${h}:00` };
});

const totalSteps = 4;

/* ------------------------------------------------------------------ */
/* Animation variants                                                  */
/* ------------------------------------------------------------------ */

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -100 : 100,
    opacity: 0,
    scale: 0.96,
  }),
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const accessToken =
    ((session as Record<string, unknown> | null)?.accessToken as string) || "";

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Form state
  const [role, setRole] = useState("");
  const [occupation, setOccupation] = useState("");
  const [workStart, setWorkStart] = useState(9);
  const [workEnd, setWorkEnd] = useState(17);
  const [wakeTime, setWakeTime] = useState(7);
  const [sleepTime, setSleepTime] = useState(23);
  const [dailyRoutine, setDailyRoutine] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [goals, setGoals] = useState("");

  const next = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const togglePriority = (p: string) => {
    setPriorities((cur) =>
      cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await postOnboarding(accessToken, {
        role,
        occupation,
        work_hours_start: workStart,
        work_hours_end: workEnd,
        wake_time: wakeTime,
        sleep_time: sleepTime,
        daily_routine: dailyRoutine,
        priorities,
        goals: goals
          .split("\n")
          .map((g) => g.trim())
          .filter(Boolean),
        onboarding_complete: true,
      });
      router.push("/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to save profile. Please try again."
      );
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Progress Bar                                                      */
  /* ---------------------------------------------------------------- */

  const ProgressBar = () => (
    <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 px-6 py-6">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="relative flex items-center">
            <div className="relative h-1.5 overflow-hidden rounded-full bg-[var(--border-subtle)]"
              style={{ width: i === step ? "2.5rem" : "1rem" }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-accent-500"
                initial={{ width: "0%" }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={spring}
              />
            </div>
          </div>
        ))}
      </div>
      <span className="ml-3 font-mono text-xs text-[var(--text-tertiary)]">
        {step + 1}/{totalSteps}
      </span>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* Step 0: Role                                                      */
  /* ---------------------------------------------------------------- */

  const renderStep0 = () => (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="mb-10 text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          What best describes you?
        </h2>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          This helps ChronAI understand your workflow.
        </p>
      </motion.div>

      <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
        {ROLES.map((r, i) => {
          const Icon = r.icon;
          const active = role === r.id;
          return (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring, delay: i * 0.06 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setRole(r.id)}
              className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition-colors duration-150 ${
                active
                  ? "border-accent-500/60 bg-accent-500/10 text-[var(--text-primary)] shadow-glow-sm"
                  : "border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{r.label}</span>
              {active && (
                <motion.div
                  layoutId="role-check"
                  className="absolute -top-1 -right-1"
                  transition={spring}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.3 }}
        className="mt-8 w-full max-w-md"
      >
        <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
          Your occupation or field
        </label>
        <input
          type="text"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          placeholder="e.g. Software Engineer, Marketing Manager"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-all duration-200 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20"
        />
      </motion.div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* Step 1: Schedule                                                   */
  /* ---------------------------------------------------------------- */

  const renderStep1 = () => (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="mb-10 text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          Tell us about your schedule
        </h2>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          We will use this to time suggestions and structure your day.
        </p>
      </motion.div>

      <div className="w-full max-w-md space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Work starts
            </label>
            <select
              value={workStart}
              onChange={(e) => setWorkStart(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20"
            >
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Work ends
            </label>
            <select
              value={workEnd}
              onChange={(e) => setWorkEnd(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20"
            >
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Wake time
            </label>
            <select
              value={wakeTime}
              onChange={(e) => setWakeTime(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20"
            >
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Sleep time
            </label>
            <select
              value={sleepTime}
              onChange={(e) => setSleepTime(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20"
            >
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.3 }}
        >
          <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Describe your typical daily routine{" "}
            <span className="text-[var(--text-tertiary)]">(optional)</span>
          </label>
          <textarea
            value={dailyRoutine}
            onChange={(e) => setDailyRoutine(e.target.value)}
            rows={3}
            placeholder="e.g. Morning run, deep work 9-12, meetings after lunch..."
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-all focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20"
          />
        </motion.div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* Step 2: Priorities & Goals                                        */
  /* ---------------------------------------------------------------- */

  const renderStep2 = () => (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="mb-10 text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          What matters most to you?
        </h2>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Select your priorities so we can focus on what counts.
        </p>
      </motion.div>

      <div className="w-full max-w-md space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2.5"
        >
          {PRIORITIES.map((p, i) => {
            const active = priorities.includes(p);
            return (
              <motion.button
                key={p}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: i * 0.04 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => togglePriority(p)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "border-accent-500/60 bg-accent-500/15 text-accent-300 shadow-glow-sm"
                    : "border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {active && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={spring}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </motion.span>
                )}
                {p}
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.3 }}
        >
          <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Your goals{" "}
            <span className="text-[var(--text-tertiary)]">(one per line)</span>
          </label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={4}
            placeholder={
              "Ship my side project by March\nExercise 4x per week\nRead 2 books per month"
            }
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-all focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20"
          />
        </motion.div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* Step 3: Summary                                                   */
  /* ---------------------------------------------------------------- */

  const renderStep3 = () => (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="mb-10 text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          You are all set!
        </h2>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Here is a summary of your profile. You can always update this later.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring}
        className="w-full max-w-md space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6"
      >
        <SummaryRow label="Role" value={role || "Not set"} />
        <SummaryRow label="Occupation" value={occupation || "Not set"} />
        <SummaryRow
          label="Work hours"
          value={`${workStart.toString().padStart(2, "0")}:00 - ${workEnd.toString().padStart(2, "0")}:00`}
        />
        <SummaryRow
          label="Wake / Sleep"
          value={`${wakeTime.toString().padStart(2, "0")}:00 / ${sleepTime.toString().padStart(2, "0")}:00`}
        />
        <SummaryRow
          label="Priorities"
          value={
            priorities.length > 0 ? priorities.join(", ") : "None selected"
          }
        />
        <SummaryRow label="Goals" value={goals.trim() || "None set"} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.2 }}
        className="mt-8 w-full max-w-md"
      >
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-accent-gradient px-6 py-4 text-base font-semibold text-white shadow-glow transition-shadow duration-300 hover:shadow-glow-lg disabled:opacity-50"
        >
          {/* Sparkle glow effect */}
          <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </span>
          <Sparkles className="relative h-4.5 w-4.5" />
          <span className="relative">
            {submitting ? "Setting up..." : "Start using ChronAI"}
          </span>
        </button>
      </motion.div>

      {submitError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-sm text-danger-400"
        >
          {submitError}
        </motion.p>
      )}
    </div>
  );

  const steps = [renderStep0, renderStep1, renderStep2, renderStep3];

  /* ---------------------------------------------------------------- */
  /* Main Render                                                       */
  /* ---------------------------------------------------------------- */

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg)]">
      {/* Subtle animated gradient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[25%] left-[30%] h-[500px] w-[500px] rounded-full bg-accent-500/[0.06] blur-[100px] animate-breathe" />
        <div className="absolute -bottom-[15%] right-[20%] h-[400px] w-[400px] rounded-full bg-accent-700/[0.04] blur-[80px] animate-float" />
      </div>

      <ProgressBar />

      {/* Step content */}
      <div className="relative z-10 flex w-full max-w-2xl flex-1 items-center justify-center px-6 py-24">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={spring}
            className="w-full"
          >
            {steps[step]()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg)]/80 px-6 py-4 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="md"
          onClick={prev}
          disabled={step === 0}
          className={step === 0 ? "invisible" : ""}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {step < totalSteps - 1 && (
          <Button variant="secondary" size="md" onClick={next}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponents                                                        */
/* ------------------------------------------------------------------ */

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-3 last:border-0 last:pb-0">
      <span className="shrink-0 text-sm font-medium text-[var(--text-tertiary)]">
        {label}
      </span>
      <span className="text-right text-sm text-[var(--text-primary)]">
        {value}
      </span>
    </div>
  );
}
