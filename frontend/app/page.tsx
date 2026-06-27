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
    gradient: "from-indigo-500/20 to-violet-500/20",
  },
  {
    title: "Smart Scheduling",
    description:
      "Automatically optimizes your calendar around energy levels, priorities, and deep work windows.",
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
    gradient: "from-cyan-500/20 to-blue-500/20",
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
    gradient: "from-emerald-500/20 to-teal-500/20",
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
    gradient: "from-amber-500/20 to-orange-500/20",
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

function FloatingOrb({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        scale: [1, 1.05, 1],
        opacity: [0.4, 0.7, 0.4],
      }}
      transition={{
        duration: 8,
        ease: "easeInOut",
        repeat: Infinity,
        delay,
      }}
    />
  );
}

function FeatureCard({
  title,
  description,
  icon,
  gradient,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  index: number;
}) {
  return (
    <motion.div
      variants={cardVariant}
      transition={{ ...spring, delay: index * 0.08 }}
      whileHover={{ y: -8, scale: 1.02, transition: { ...spring } }}
      className="group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 transition-colors duration-300 hover:border-accent-400/30 hover:bg-[var(--surface-hover)]"
    >
      {/* Hover gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400 transition-all duration-300 group-hover:bg-accent-500/20 group-hover:shadow-glow-sm">
          {icon}
        </div>
        <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          {description}
        </p>
      </div>

      {/* Corner accent */}
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-accent-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative mx-auto mt-32 w-full max-w-5xl px-6">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={spring}
        className="mb-12 text-center"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Everything you need, nothing you don&apos;t
        </h2>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Powered by AI that learns your rhythm and adapts to your style.
        </p>
      </motion.div>

      {/* Cards grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2"
      >
        {features.map((f, i) => (
          <FeatureCard key={f.title} {...f} index={i} />
        ))}
      </motion.div>
    </section>
  );
}

function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={spring}
      className="mx-auto mt-24 flex w-full max-w-md flex-col items-center px-6 text-center"
    >
      <div className="mb-4 flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-success-500"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <span className="text-sm font-medium text-[var(--text-primary)]">
          Private by design
        </span>
      </div>
      <p className="text-sm text-[var(--text-tertiary)]">
        Your data stays on your devices. We never sell or share personal
        information.
      </p>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Landing Page                                                        */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[var(--bg)]">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Gradient mesh */}
        <div className="absolute -top-[30%] left-[20%] h-[600px] w-[600px] rounded-full bg-accent-500/[0.07] blur-[120px] animate-breathe" />
        <div className="absolute -bottom-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-accent-700/[0.05] blur-[100px] animate-float" />
        <div className="absolute top-[40%] -left-[10%] h-[400px] w-[400px] rounded-full bg-violet-500/[0.04] blur-[80px] animate-float" />

        {/* Floating orbs */}
        <FloatingOrb
          className="top-[15%] right-[25%] h-2 w-2 bg-accent-400/40 blur-[2px]"
          delay={0}
        />
        <FloatingOrb
          className="top-[35%] left-[15%] h-1.5 w-1.5 bg-violet-400/30 blur-[1px]"
          delay={2}
        />
        <FloatingOrb
          className="bottom-[30%] right-[35%] h-2.5 w-2.5 bg-accent-300/25 blur-[2px]"
          delay={4}
        />
        <FloatingOrb
          className="top-[60%] left-[40%] h-1.5 w-1.5 bg-indigo-400/30 blur-[1px]"
          delay={6}
        />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_50%_40%,black,transparent_70%)]" />
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
            <motion.span
              className="h-2 w-2 rounded-full bg-accent-500"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-[var(--text-tertiary)]">
              ChronAI
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            transition={spring}
            className="max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Your day, intelligently{" "}
            <span className="gradient-text">orchestrated</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            transition={spring}
            className="mt-6 max-w-lg text-balance text-lg leading-relaxed text-[var(--text-secondary)]"
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
              className="gap-3 rounded-full px-8 py-4 text-[15px] shadow-glow hover:shadow-glow-lg transition-shadow duration-300"
            >
              <GoogleIcon />
              Continue with Google
            </Button>
          </motion.div>

          {/* Trust badge */}
          <motion.div
            variants={fadeUp}
            transition={spring}
            className="mt-8 flex items-center gap-2"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--text-tertiary)]"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p className="font-mono text-[11px] tracking-wide text-[var(--text-tertiary)]">
              Private by design
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <FeaturesSection />

      {/* Trust */}
      <TrustSection />

      {/* Footer */}
      <footer className="relative z-10 mt-32 pb-12 text-center">
        <div className="mx-auto mb-6 h-px w-16 bg-[var(--border-subtle)]" />
        <p className="text-xs text-[var(--text-tertiary)]">
          Built with care. Your data stays yours.
        </p>
        <p className="mt-2 font-mono text-[10px] text-[var(--text-tertiary)] opacity-60">
          ChronAI {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
