"use client";

import { signIn } from "next-auth/react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Motion helpers                                                       */
/* ------------------------------------------------------------------ */

const EASE_CALM = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Slow, low-velocity reveal used for every scroll-triggered section. */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_CALM },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

/**
 * Reveal — wraps content in a calm, scroll-triggered fade/rise.
 * Respects prefers-reduced-motion by rendering content statically.
 */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.9, ease: EASE_CALM, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Icons                                                                */
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

/* ------------------------------------------------------------------ */
/* Warm CTA                                                             */
/* ------------------------------------------------------------------ */

function GetStartedButton({
  size = "lg",
  label = "Get Started Free",
}: {
  size?: "md" | "lg";
  label?: string;
}) {
  const pad = size === "lg" ? "px-8 py-4 text-[15px]" : "px-6 py-3 text-sm";
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-br from-warm-300 to-warm-500 font-medium text-[#3a2418] shadow-[0_8px_30px_-8px_rgba(221,138,90,0.5)] transition-all duration-150 hover:shadow-[0_10px_38px_-8px_rgba(221,138,90,0.65)] focus-ring ${pad}`}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
      </span>
      <span className="relative flex items-center gap-2.5">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white/90">
          <GoogleIcon />
        </span>
        {label}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Cozy signature scene — a warm window at dusk (CSS/SVG)               */
/* ------------------------------------------------------------------ */

function CozyScene() {
  return (
    <div className="relative w-full">
      {/* Soft warm glow pooling behind the scene */}
      <div className="pointer-events-none absolute -inset-10 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-warm-400/20 blur-[90px] animate-glow-pulse" />
      </div>

      <div className="grain relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_30px_80px_-30px_rgba(40,28,18,0.55)]">
        <svg
          viewBox="0 0 480 360"
          className="relative z-[1] block w-full"
          role="img"
          aria-label="A cozy desk beside a window glowing with warm dusk light"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#26203a" />
              <stop offset="42%" stopColor="#5b4660" />
              <stop offset="72%" stopColor="#b56b58" />
              <stop offset="100%" stopColor="#e8a87c" />
            </linearGradient>
            <radialGradient id="moon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffeccb" />
              <stop offset="60%" stopColor="#ffdca0" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffdca0" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="hillBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7a4a5e" />
              <stop offset="100%" stopColor="#5e3a52" />
            </linearGradient>
            <linearGradient id="hillFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3f2a44" />
              <stop offset="100%" stopColor="#2c1e35" />
            </linearGradient>
            <linearGradient id="room" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a211c" />
              <stop offset="100%" stopColor="#191310" />
            </linearGradient>
            <radialGradient id="lamp" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd79a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffd79a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="mug" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d98a63" />
              <stop offset="100%" stopColor="#b5673f" />
            </linearGradient>
          </defs>

          {/* Window opening */}
          <rect x="40" y="28" width="400" height="232" rx="14" fill="url(#sky)" />

          {/* Moon + halo */}
          <circle cx="338" cy="92" r="64" fill="url(#moon)" />
          <circle cx="338" cy="92" r="24" fill="#fff3d8" />

          {/* Distant stars */}
          <g fill="#fff0d0">
            <circle cx="92" cy="70" r="1.6" opacity="0.8" />
            <circle cx="140" cy="52" r="1.2" opacity="0.6" />
            <circle cx="196" cy="84" r="1.4" opacity="0.7" />
            <circle cx="250" cy="58" r="1" opacity="0.5" />
            <circle cx="408" cy="74" r="1.3" opacity="0.6" />
          </g>

          {/* Rolling hills */}
          <path
            d="M40 196 C 120 150, 200 178, 280 160 C 350 145, 410 172, 440 158 L440 260 L40 260 Z"
            fill="url(#hillBack)"
            opacity="0.85"
          />
          <path
            d="M40 224 C 110 196, 190 216, 268 204 C 340 193, 392 214, 440 202 L440 260 L40 260 Z"
            fill="url(#hillFront)"
          />

          {/* Window frame + muntins */}
          <rect
            x="40"
            y="28"
            width="400"
            height="232"
            rx="14"
            fill="none"
            stroke="#0f0b08"
            strokeWidth="10"
          />
          <line x1="240" y1="32" x2="240" y2="256" stroke="#0f0b08" strokeWidth="7" />
          <line x1="44" y1="150" x2="436" y2="150" stroke="#0f0b08" strokeWidth="7" />

          {/* Interior / desk surface */}
          <rect x="0" y="252" width="480" height="108" fill="url(#room)" />
          <rect x="0" y="284" width="480" height="76" fill="#241a14" />

          {/* Warm lamp pool of light */}
          <ellipse
            cx="120"
            cy="296"
            rx="120"
            ry="60"
            fill="url(#lamp)"
            className="animate-breathe-slow"
            style={{ transformOrigin: "120px 296px" }}
          />

          {/* Potted plant */}
          <g>
            <path d="M392 300 h40 l-5 26 h-30 z" fill="#9c5a3c" />
            <path
              d="M412 300 C 404 280, 396 274, 392 262 C 404 270, 410 282, 412 292 C 414 280, 420 268, 432 260 C 426 276, 418 286, 412 300 Z"
              fill="#5f7d54"
            />
            <path
              d="M412 300 C 414 286, 420 280, 430 276 C 424 286, 418 294, 412 300 Z"
              fill="#728f63"
            />
          </g>

          {/* Coffee mug + steam */}
          <g>
            <rect x="92" y="286" width="44" height="30" rx="7" fill="url(#mug)" />
            <path
              d="M136 292 h8 a8 8 0 0 1 0 16 h-8"
              fill="none"
              stroke="#b5673f"
              strokeWidth="5"
            />
            <g stroke="#ffe8c8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55">
              <path d="M106 280 c -4 -6, 4 -10, 0 -16" className="animate-float-slow" />
              <path
                d="M120 278 c -4 -6, 4 -10, 0 -16"
                className="animate-float-slow"
                style={{ animationDelay: "1.4s" }}
              />
            </g>
          </g>

          {/* Floating dust motes in the warm light */}
          <g fill="#ffdfa8">
            <circle cx="170" cy="240" r="2" opacity="0.7" className="animate-float-slow" />
            <circle
              cx="220"
              cy="276"
              r="1.6"
              opacity="0.6"
              className="animate-float-slow"
              style={{ animationDelay: "2s" }}
            />
            <circle
              cx="78"
              cy="262"
              r="1.8"
              opacity="0.5"
              className="animate-float-slow"
              style={{ animationDelay: "3.2s" }}
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pillar + feature data                                                */
/* ------------------------------------------------------------------ */

const pillars = [
  {
    title: "It plans your day",
    body: "Haven quietly shapes your hours around what matters — meetings, deep work, and rest — so you wake up to a day that already makes sense.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <path d="M3 9h18M8 2v4M16 2v4" />
        <path d="M8 14h4" />
      </svg>
    ),
  },
  {
    title: "It learns your rhythm",
    body: "The more you live with Haven, the better it knows your focus hours, your habits, and your pace — and gently adapts to fit the way you actually work.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a4 4 0 0 0-4 4 4 4 0 0 0-1 7.5V18a3 3 0 0 0 5 2 3 3 0 0 0 5-2v-3.5A4 4 0 0 0 16 7a4 4 0 0 0-4-4Z" />
        <path d="M12 3v18" />
      </svg>
    ),
  },
  {
    title: "It speaks up when it matters",
    body: "No noise, no nagging. Haven only reaches out for the moments worth a nudge — a slipping deadline, an overbooked afternoon, a chance to breathe.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    ),
  },
];

const featureDepth = [
  {
    eyebrow: "Tasks",
    title: "Everything on your mind, gently organised",
    body: "Drop in a thought in plain language and Haven turns it into the right task, on the right day, with the right priority. No forms, no friction — just a clear head.",
  },
  {
    eyebrow: "Calendar",
    title: "A calendar that protects your time",
    body: "Haven guards your mornings for focus and arranges the rest around your energy. Your week stops feeling like a battle and starts feeling like a plan.",
  },
  {
    eyebrow: "Focus",
    title: "A calm room for deep work",
    body: "Slip into a focus session and let the world fade. Soft timing, gentle music, and zero clutter — so the work feels less like effort and more like flow.",
  },
  {
    eyebrow: "Intelligence",
    title: "An assistant that has your back",
    body: "Haven watches the edges of your day so you don't have to. It remembers what you tend to forget and steps in right before things slip.",
  },
];

const testimonials = [
  {
    quote:
      "It feels less like an app and more like a calm friend who keeps my day from falling apart. I finally stopped dreading my mornings.",
    name: "Maya R.",
    role: "Product Designer",
  },
  {
    quote:
      "Haven quietly handles the planning I used to spend an hour on. I just show up and the day already makes sense.",
    name: "Daniel K.",
    role: "Founder",
  },
  {
    quote:
      "The nudges are never annoying — they arrive exactly when I need them. It's the first tool that actually respects my attention.",
    name: "Priya S.",
    role: "Researcher",
  },
];

/* ------------------------------------------------------------------ */
/* Sections                                                             */
/* ------------------------------------------------------------------ */

function Pillars() {
  const reduce = useReducedMotion();
  return (
    <section className="relative z-10 mx-auto mt-40 w-full max-w-5xl px-6">
      <Reveal className="mb-14 text-center">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.35em] text-warm-500">
          Why Haven
        </p>
        <h2 className="text-display mx-auto max-w-2xl text-3xl text-[var(--text-primary)] sm:text-4xl">
          A quieter way to stay on top of everything
        </h2>
      </Reveal>

      <motion.div
        variants={reduce ? undefined : stagger}
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-1 gap-5 md:grid-cols-3"
      >
        {pillars.map((p) => (
          <motion.div
            key={p.title}
            variants={reduce ? undefined : fadeUp}
            className="grain relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 transition-colors duration-150 hover:border-warm-300/40"
          >
            <div className="relative z-[1]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-400/12 text-warm-500">
                <span className="h-6 w-6">{p.icon}</span>
              </div>
              <h3 className="mb-2.5 text-lg font-medium text-[var(--text-primary)]">
                {p.title}
              </h3>
              <p className="text-[15px] leading-[1.75] text-[var(--text-secondary)]">
                {p.body}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function FeatureDepth() {
  return (
    <section className="relative z-10 mx-auto mt-40 w-full max-w-4xl px-6">
      <div className="flex flex-col gap-28">
        {featureDepth.map((f, i) => (
          <Reveal key={f.eyebrow}>
            <div
              className={`flex flex-col items-center gap-10 md:flex-row ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Copy */}
              <div className="flex-1 text-center md:text-left">
                <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-warm-500">
                  {f.eyebrow}
                </p>
                <h3 className="text-display mb-4 text-2xl text-[var(--text-primary)] sm:text-3xl">
                  {f.title}
                </h3>
                <p className="mx-auto max-w-md text-[15px] leading-[1.75] text-[var(--text-secondary)] md:mx-0">
                  {f.body}
                </p>
              </div>

              {/* Soft visual panel */}
              <div className="flex-1">
                <div className="grain relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--bg-secondary)] shadow-[0_24px_60px_-30px_rgba(40,28,18,0.4)]">
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="h-28 w-28 rounded-full bg-warm-400/15 blur-2xl animate-breathe-slow" />
                  </div>
                  <div className="absolute inset-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]/60 backdrop-blur-sm" />
                  <div className="absolute inset-x-9 top-9 space-y-3">
                    <div className="h-2.5 w-2/3 rounded-full bg-warm-300/30" />
                    <div className="h-2.5 w-1/2 rounded-full bg-[var(--border)]" />
                    <div className="h-2.5 w-4/5 rounded-full bg-[var(--border)]" />
                    <div className="mt-6 h-2.5 w-3/5 rounded-full bg-accent-400/25" />
                    <div className="h-2.5 w-2/5 rounded-full bg-[var(--border)]" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="relative z-10 mx-auto mt-40 w-full max-w-5xl px-6">
      <Reveal className="mb-14 text-center">
        <p className="text-display text-4xl text-warm-500 sm:text-5xl">
          Save 45 minutes a day
        </p>
        <p className="mt-4 text-base text-[var(--text-secondary)]">
          That&apos;s how much planning and second-guessing Haven quietly takes
          off your plate.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08}>
            <figure className="grain relative h-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7">
              <blockquote className="relative z-[1] text-[15px] leading-[1.75] text-[var(--text-primary)]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="relative z-[1] mt-6 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-warm-300 to-warm-500 text-sm font-medium text-[#3a2418]">
                  {t.name.charAt(0)}
                </span>
                <span className="text-sm">
                  <span className="block font-medium text-[var(--text-primary)]">
                    {t.name}
                  </span>
                  <span className="block text-[var(--text-tertiary)]">
                    {t.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function EmotionalClose() {
  return (
    <section className="relative z-10 mx-auto mt-40 w-full max-w-3xl px-6 text-center">
      <Reveal>
        <h2 className="text-display text-3xl text-[var(--text-primary)] sm:text-5xl">
          Stop managing your life.
          <br />
          <span className="gradient-text-cozy">Start living it.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-[1.75] text-[var(--text-secondary)]">
          Let Haven hold the logistics of your days, so you can spend your
          attention on the things that actually matter.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <GetStartedButton />
          <p className="font-mono text-[11px] tracking-wide text-[var(--text-tertiary)]">
            Free to start &middot; Private by design
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Landing Page                                                        */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[var(--bg)]">
      {/* Warm ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[25%] left-[12%] h-[640px] w-[640px] rounded-full bg-warm-400/[0.12] blur-[130px] animate-drift" />
        <div className="absolute top-[35%] -right-[8%] h-[520px] w-[520px] rounded-full bg-clay-400/[0.1] blur-[120px] animate-aurora" />
        <div className="absolute bottom-[2%] left-[28%] h-[460px] w-[460px] rounded-full bg-accent-500/[0.06] blur-[110px] animate-float-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(180,140,90,0.04)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(circle_at_50%_30%,black,transparent_72%)]" />
      </div>

      {/* Page-wide grain for warmth */}
      <div className="grain-fixed" aria-hidden="true" />

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 pb-20 pt-24">
        <motion.div
          initial={reduce ? undefined : "hidden"}
          animate={reduce ? undefined : "visible"}
          variants={reduce ? undefined : stagger}
          className="flex w-full flex-col items-center text-center"
        >
          {/* Wordmark */}
          <motion.div
            variants={reduce ? undefined : fadeUp}
            className="mb-8 flex items-center gap-2.5"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-warm-300 to-warm-500 text-[13px] font-bold text-[#3a2418] shadow-sm">
              H
            </span>
            <span className="text-base font-medium tracking-tight text-[var(--text-primary)]">
              Haven
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={reduce ? undefined : fadeUp}
            className="text-display max-w-3xl text-balance text-4xl text-[var(--text-primary)] sm:text-5xl md:text-6xl"
          >
            Your calm place to{" "}
            <span className="gradient-text-cozy">get things done</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={reduce ? undefined : fadeUp}
            className="mt-6 max-w-xl text-balance text-lg leading-[1.7] text-[var(--text-secondary)]"
          >
            Haven is the AI that plans your day, protects your time, and learns
            your rhythm — so the chaos quiets down and your focus comes home.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={reduce ? undefined : fadeUp}
            className="mt-10 flex flex-col items-center gap-4"
          >
            <GetStartedButton />
            <p className="font-mono text-[11px] tracking-wide text-[var(--text-tertiary)]">
              Calm in the chaos &middot; No credit card needed
            </p>
          </motion.div>

          {/* Signature cozy scene */}
          <motion.div
            variants={reduce ? undefined : fadeUp}
            className="mt-16 w-full max-w-3xl"
          >
            <CozyScene />
          </motion.div>
        </motion.div>
      </section>

      {/* Three pillars */}
      <Pillars />

      {/* Feature depth */}
      <FeatureDepth />

      {/* Social proof */}
      <SocialProof />

      {/* Emotional close */}
      <EmotionalClose />

      {/* Footer */}
      <footer className="relative z-10 mt-40 pb-14 text-center">
        <div className="mx-auto mb-7 h-px w-16 bg-[var(--border)]" />
        <div className="flex items-center justify-center gap-2.5">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-warm-300 to-warm-500 text-[11px] font-bold text-[#3a2418]">
            H
          </span>
          <span className="text-sm font-medium tracking-tight text-[var(--text-primary)]">
            Haven
          </span>
        </div>
        <p className="mt-4 text-xs text-[var(--text-tertiary)]">
          Built with care. Your day, handled — your data stays yours.
        </p>
        <p className="mt-2 font-mono text-[10px] text-[var(--text-tertiary)] opacity-60">
          Haven {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
