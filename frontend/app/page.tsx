"use client";

import { signIn } from "next-auth/react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/* Constants                                                            */
/* ------------------------------------------------------------------ */

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const features = [
  {
    title: "AI Assistant",
    description:
      "Your intelligent companion that understands context, anticipates needs, and helps you stay on track effortlessly.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
        <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4Z" />
        <circle cx="12" cy="6" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Smart Scheduling",
    description:
      "Automatically optimizes your calendar around your energy levels, priorities, and deep work windows.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <circle cx="12" cy="15" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Task Management",
    description:
      "Organize, prioritize, and complete tasks with AI-powered suggestions and natural language input.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: "Habit Tracking",
    description:
      "Build lasting habits with streak tracking, gentle reminders, and progress insights powered by AI.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Animations                                                          */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      variants={cardVariant}
      transition={spring}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 transition-colors duration-200 hover:border-accent-400/30 hover:bg-[var(--surface-hover)]"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400 transition-colors group-hover:bg-accent-500/15">
        {icon}
      </div>
      <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>
    </motion.div>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="mx-auto mt-32 grid w-full max-w-4xl grid-cols-1 gap-4 px-6 sm:grid-cols-2"
    >
      {features.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Landing Page                                                        */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[var(--bg)]">
      {/* Gradient mesh background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[30%] left-[20%] h-[600px] w-[600px] rounded-full bg-accent-500/[0.07] blur-[120px] animate-breathe" />
        <div className="absolute -bottom-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-accent-700/[0.05] blur-[100px] animate-float" />
        <div className="absolute top-[40%] -left-[10%] h-[400px] w-[400px] rounded-full bg-accent-400/[0.04] blur-[80px] animate-float" />
      </div>

      {/* Hero */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center text-center"
        >
          {/* Brand badge */}
          <motion.div
            variants={fadeUp}
            transition={spring}
            className="mb-8 flex items-center gap-2.5"
          >
            <span className="h-2 w-2 rounded-full bg-accent-500 shadow-glow-sm" />
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-[var(--text-tertiary)]">
              ChronAI
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            transition={spring}
            className="max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Your day, intelligently{" "}
            <span className="gradient-text">orchestrated</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            transition={spring}
            className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--text-secondary)]"
          >
            An intelligent companion for your time, tasks, and intentions.
            Quiet until you need it, present when you do.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} transition={spring} className="mt-10">
            <Button
              variant="primary"
              size="lg"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="gap-3 rounded-full px-7 py-3.5 text-[15px] shadow-glow hover:shadow-glow-lg"
            >
              <GoogleIcon />
              Continue with Google
            </Button>
          </motion.div>

          {/* Trust badge */}
          <motion.p
            variants={fadeUp}
            transition={spring}
            className="mt-8 font-mono text-[11px] tracking-wide text-[var(--text-tertiary)]"
          >
            Private by design
          </motion.p>
        </motion.div>
      </section>

      {/* Features */}
      <FeaturesSection />

      {/* Footer */}
      <footer className="relative z-10 mt-32 pb-12 text-center">
        <p className="text-xs text-[var(--text-tertiary)]">
          Built with care. Your data stays yours.
        </p>
      </footer>
    </main>
  );
}
