"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Motion helpers — snappy, slightly stepped pixel reveals             */
/* ------------------------------------------------------------------ */

const EASE_CALM = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_CALM },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

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
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE_CALM, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Wordmark — chunky pixel "H" badge                                   */
/* ------------------------------------------------------------------ */

function PixelLogo({ size = 28 }: { size?: number }) {
  return (
    <span
      className="pixelated grid place-items-center bg-gradient-to-br from-warm-300 to-warm-600 shadow-pixel-sm"
      style={{ width: size, height: size, imageRendering: "pixelated" }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 8 8"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <g fill="#3a2418">
          <rect x="1" y="1" width="2" height="6" />
          <rect x="5" y="1" width="2" height="6" />
          <rect x="3" y="3" width="2" height="2" />
        </g>
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* The AI caretaker sprite — a glowing pixel companion with eyes       */
/* ------------------------------------------------------------------ */

function AiSprite({
  size = 56,
  className = "",
  float = true,
}: {
  size?: number;
  className?: string;
  float?: boolean;
}) {
  return (
    <div
      className={`pixelated relative ${float ? "animate-pixel-bob" : ""} ${className}`}
      style={{ width: size, height: size, imageRendering: "pixelated" }}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 bg-accent-400/30 blur-xl animate-pixel-flicker" />
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        shapeRendering="crispEdges"
        role="img"
        aria-label="Haven, the AI caretaker sprite"
      >
        <g>
          <rect x="5" y="2" width="6" height="1" fill="#a5b4fc" />
          <rect x="4" y="3" width="8" height="1" fill="#a5b4fc" />
          <rect x="3" y="4" width="10" height="8" fill="#818cf8" />
          <rect x="4" y="12" width="8" height="1" fill="#6366f1" />
          <rect x="5" y="13" width="6" height="1" fill="#6366f1" />
          <rect x="4" y="4" width="3" height="3" fill="#c7d2fe" />
        </g>
        <g
          fill="#1e1b4b"
          className="animate-pixel-blink"
          style={{ transformOrigin: "8px 8px" }}
        >
          <rect x="5" y="7" width="2" height="3" />
          <rect x="9" y="7" width="2" height="3" />
        </g>
        <rect
          x="7"
          y="0"
          width="2"
          height="2"
          fill="#fcd34d"
          className="animate-pixel-twinkle"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Google icon + Pixel CTA                                             */
/* ------------------------------------------------------------------ */

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}

function GetStartedButton({
  size = "lg",
  label = "Enter Haven",
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const pad =
    size === "lg"
      ? "px-7 py-3.5 text-base"
      : size === "md"
        ? "px-5 py-2.5 text-sm"
        : "px-4 py-2 text-xs";
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className={`pixel-press pixel-corners group relative inline-flex items-center gap-3 border-[3px] border-[#3a2418] bg-gradient-to-br from-warm-300 to-warm-500 font-pixel font-semibold tracking-wide text-[#3a2418] shadow-pixel focus-ring ${pad}`}
    >
      <span className="grid h-5 w-5 place-items-center border border-[#3a2418]/40 bg-white/95">
        <GoogleIcon />
      </span>
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Hero scene — a cozy pixel cottage at dusk, framed like a window     */
/* ------------------------------------------------------------------ */

function PixelCottage() {
  const roof = [
    { x: 150, w: 20 },
    { x: 142, w: 36 },
    { x: 134, w: 52 },
    { x: 126, w: 68 },
    { x: 118, w: 84 },
    { x: 110, w: 100 },
    { x: 102, w: 116 },
  ];

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute -inset-10 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-warm-500/20 blur-[90px] animate-pixel-flicker" />
      </div>

      {/* Cozy window frame */}
      <div className="pixel-corners border-[5px] border-[#5e3a26] bg-[#3a2418] p-2 shadow-pixel-lg">
        <div className="pixel-scanlines relative overflow-hidden border-[3px] border-[#2a1a10] bg-[#221d38]">
          <svg
            viewBox="0 0 320 200"
            className="pixelated relative block w-full"
            shapeRendering="crispEdges"
            role="img"
            aria-label="A cozy pixel-art cottage glowing at dusk, watched over by Haven"
            style={{ imageRendering: "pixelated" }}
          >
            {/* dusk sky */}
            <rect x="0" y="0" width="320" height="34" fill="#221d38" />
            <rect x="0" y="34" width="320" height="28" fill="#3b2f52" />
            <rect x="0" y="62" width="320" height="26" fill="#5e4360" />
            <rect x="0" y="88" width="320" height="24" fill="#8a5158" />
            <rect x="0" y="112" width="320" height="22" fill="#b9705a" />
            <rect x="0" y="134" width="320" height="22" fill="#e3936a" />

            {/* stars */}
            <g fill="#fff0d0">
              <rect x="36" y="18" width="2" height="2" className="animate-pixel-twinkle" />
              <rect x="78" y="10" width="2" height="2" className="animate-pixel-twinkle" style={{ animationDelay: "0.6s" }} />
              <rect x="120" y="24" width="2" height="2" className="animate-pixel-twinkle" style={{ animationDelay: "1.1s" }} />
              <rect x="210" y="14" width="2" height="2" className="animate-pixel-twinkle" style={{ animationDelay: "0.3s" }} />
              <rect x="262" y="28" width="2" height="2" className="animate-pixel-twinkle" style={{ animationDelay: "1.4s" }} />
              <rect x="292" y="12" width="2" height="2" className="animate-pixel-twinkle" style={{ animationDelay: "0.9s" }} />
              <rect x="156" y="8" width="2" height="2" className="animate-pixel-twinkle" style={{ animationDelay: "1.8s" }} />
            </g>

            {/* moon */}
            <g>
              <rect x="246" y="30" width="24" height="24" fill="#ffeccb" />
              <rect x="242" y="34" width="4" height="16" fill="#ffeccb" />
              <rect x="270" y="34" width="4" height="16" fill="#ffeccb" />
              <rect x="250" y="26" width="16" height="4" fill="#ffeccb" />
              <rect x="250" y="54" width="16" height="4" fill="#ffeccb" />
              <rect x="252" y="38" width="4" height="4" fill="#f1d6a8" />
              <rect x="260" y="44" width="3" height="3" fill="#f1d6a8" />
            </g>

            {/* hills + grass */}
            <rect x="0" y="148" width="320" height="52" fill="#3a5a40" />
            <rect x="0" y="142" width="120" height="8" fill="#3a5a40" />
            <rect x="200" y="138" width="120" height="12" fill="#3a5a40" />
            <rect x="0" y="158" width="320" height="42" fill="#48703f" />

            {/* left pine */}
            <g>
              <rect x="44" y="150" width="6" height="14" fill="#5a3b27" />
              <rect x="34" y="140" width="26" height="8" fill="#2f5132" />
              <rect x="38" y="130" width="18" height="10" fill="#356039" />
              <rect x="42" y="122" width="10" height="8" fill="#3a6b3e" />
            </g>

            {/* right bush */}
            <g>
              <rect x="276" y="150" width="30" height="12" fill="#356039" />
              <rect x="282" y="144" width="18" height="8" fill="#3a6b3e" />
            </g>

            {/* the cottage */}
            <g>
              {roof.map((r, i) => (
                <rect
                  key={i}
                  x={r.x}
                  y={56 + i * 8}
                  width={r.w}
                  height={8}
                  fill={i % 2 === 0 ? "#9c3f2f" : "#bb4f37"}
                />
              ))}
              <rect x="102" y="112" width="116" height="4" fill="#7a2f24" />

              {/* chimney + smoke */}
              <rect x="184" y="64" width="14" height="22" fill="#7a4a3a" />
              <rect x="182" y="62" width="18" height="4" fill="#5e372b" />
              <g fill="#cdbfe0">
                <rect x="188" y="56" width="5" height="5" className="animate-pixel-smoke" />
                <rect x="190" y="52" width="4" height="4" className="animate-pixel-smoke" style={{ animationDelay: "1.3s" }} />
                <rect x="187" y="48" width="4" height="4" className="animate-pixel-smoke" style={{ animationDelay: "2.6s" }} />
              </g>

              {/* body */}
              <rect x="108" y="116" width="104" height="60" fill="#e8c79c" />
              <rect x="108" y="116" width="104" height="6" fill="#f2d7af" />
              <rect x="108" y="170" width="104" height="6" fill="#cda878" />
              <rect x="106" y="114" width="108" height="2" fill="#7a5a3a" />
              <rect x="106" y="176" width="108" height="2" fill="#7a5a3a" />
              <rect x="106" y="114" width="2" height="64" fill="#7a5a3a" />
              <rect x="212" y="114" width="2" height="64" fill="#7a5a3a" />

              {/* left window */}
              <g className="animate-pixel-flicker">
                <rect x="120" y="128" width="24" height="24" fill="#3a2a1c" />
                <rect x="123" y="131" width="18" height="18" fill="#ffd27a" />
                <rect x="123" y="131" width="18" height="8" fill="#ffe2a3" />
                <rect x="131" y="131" width="2" height="18" fill="#3a2a1c" />
                <rect x="123" y="139" width="18" height="2" fill="#3a2a1c" />
              </g>

              {/* right window */}
              <g className="animate-pixel-flicker" style={{ animationDelay: "0.8s" }}>
                <rect x="176" y="128" width="24" height="24" fill="#3a2a1c" />
                <rect x="179" y="131" width="18" height="18" fill="#ffd27a" />
                <rect x="179" y="131" width="18" height="8" fill="#ffe2a3" />
                <rect x="187" y="131" width="2" height="18" fill="#3a2a1c" />
                <rect x="179" y="139" width="18" height="2" fill="#3a2a1c" />
              </g>

              {/* door + light pool */}
              <rect x="150" y="142" width="20" height="34" fill="#8a4a2a" />
              <rect x="152" y="144" width="16" height="32" fill="#a85a32" />
              <rect x="150" y="176" width="20" height="2" fill="#5e3320" />
              <rect x="164" y="158" width="3" height="3" fill="#ffd27a" />
              <rect x="146" y="176" width="28" height="6" fill="#e8a87c" opacity="0.5" />
            </g>

            {/* AI sprite hovering by the cottage */}
            <g className="animate-pixel-bob">
              <rect x="232" y="124" width="14" height="14" fill="#818cf8" />
              <rect x="234" y="122" width="10" height="2" fill="#a5b4fc" />
              <rect x="234" y="138" width="10" height="2" fill="#6366f1" />
              <rect x="233" y="126" width="3" height="3" fill="#c7d2fe" />
              <g fill="#1e1b4b" className="animate-pixel-blink">
                <rect x="235" y="129" width="2" height="3" />
                <rect x="241" y="129" width="2" height="3" />
              </g>
              <rect x="238" y="118" width="2" height="2" fill="#fcd34d" className="animate-pixel-twinkle" />
            </g>

            {/* fireflies */}
            <g fill="#ffe98a">
              <rect x="70" y="168" width="2" height="2" className="animate-pixel-firefly" />
              <rect x="100" y="178" width="2" height="2" className="animate-pixel-firefly" style={{ animationDelay: "2s" }} />
              <rect x="250" y="172" width="2" height="2" className="animate-pixel-firefly" style={{ animationDelay: "3.5s" }} />
            </g>
          </svg>

          {/* HUD caption strip */}
          <div className="flex items-center justify-between border-t-[3px] border-[#2a1a10] bg-[#1a1614] px-4 py-2">
            <span className="font-terminal text-lg leading-none text-warm-300">
              haven.exe — the porch light is on
            </span>
            <span className="flex items-center gap-1.5 font-terminal text-lg leading-none text-success-400">
              <span className="h-2 w-2 bg-success-400 animate-pixel-twinkle" />
              home
            </span>
          </div>
        </div>
      </div>

      {/* little "welcome home" placard hanging on the frame */}
      <div className="pixel-corners absolute -bottom-4 left-1/2 -translate-x-1/2 border-2 border-[#5e3a26] bg-warm-100 px-4 py-1 shadow-pixel-sm">
        <span className="font-pixel text-sm font-semibold text-[#5e3a26]">
          welcome home
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pixel icons                                                          */
/* ------------------------------------------------------------------ */

function PixelIcon({
  kind,
}: {
  kind: "calendar" | "heart" | "bell" | "key" | "moon" | "leaf";
}) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 16 16",
    shapeRendering: "crispEdges" as const,
    style: { imageRendering: "pixelated" as const },
    fill: "currentColor",
    "aria-hidden": true,
  };
  switch (kind) {
    case "calendar":
      return (
        <svg {...common}>
          <rect x="2" y="3" width="12" height="11" />
          <rect x="3" y="6" width="10" height="7" fill="#1a1614" />
          <rect x="4" y="1" width="2" height="3" />
          <rect x="10" y="1" width="2" height="3" />
          <rect x="5" y="8" width="2" height="2" />
          <rect x="9" y="8" width="2" height="2" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <rect x="2" y="4" width="4" height="2" />
          <rect x="10" y="4" width="4" height="2" />
          <rect x="2" y="6" width="12" height="3" />
          <rect x="3" y="9" width="10" height="2" />
          <rect x="5" y="11" width="6" height="2" />
          <rect x="7" y="13" width="2" height="1" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <rect x="7" y="1" width="2" height="2" />
          <rect x="5" y="3" width="6" height="2" />
          <rect x="4" y="5" width="8" height="6" />
          <rect x="3" y="11" width="10" height="2" />
          <rect x="7" y="13" width="2" height="2" />
        </svg>
      );
    case "key":
      return (
        <svg {...common}>
          <rect x="2" y="3" width="6" height="6" />
          <rect x="4" y="5" width="2" height="2" fill="#1a1614" />
          <rect x="8" y="5" width="6" height="2" />
          <rect x="11" y="7" width="2" height="2" />
          <rect x="13" y="7" width="2" height="3" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <rect x="5" y="2" width="6" height="2" />
          <rect x="3" y="4" width="4" height="8" />
          <rect x="5" y="12" width="6" height="2" />
          <rect x="7" y="4" width="6" height="2" />
          <rect x="9" y="6" width="4" height="6" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="10" height="2" />
          <rect x="3" y="5" width="8" height="2" />
          <rect x="3" y="7" width="6" height="2" />
          <rect x="3" y="9" width="4" height="4" />
        </svg>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

const pillars = [
  {
    icon: "calendar" as const,
    title: "It plans your day",
    body: "Haven quietly shapes your hours around what matters — meetings, deep work, and rest — so you wake up to a day that already makes sense.",
  },
  {
    icon: "heart" as const,
    title: "It learns your rhythm",
    body: "The more you live with Haven, the better it knows your focus hours, your habits, and your pace — and gently adapts to the way you actually work.",
  },
  {
    icon: "bell" as const,
    title: "It speaks up when it matters",
    body: "No noise, no nagging. Haven only reaches out for the moments worth a nudge — a slipping deadline, an overbooked afternoon, a chance to breathe.",
  },
];

const steps = [
  {
    icon: "key" as const,
    n: "01",
    title: "Open the door",
    body: "Sign in and connect your calendar and tasks. Haven moves in, tidies up, and gets to know your world.",
  },
  {
    icon: "moon" as const,
    n: "02",
    title: "Let it keep watch",
    body: "Haven quietly learns your rhythm, plans your days, and watches the edges so nothing slips while you rest.",
  },
  {
    icon: "leaf" as const,
    n: "03",
    title: "Come home to calm",
    body: "Open Haven to a day that already makes sense. Less managing, more living — the home has the rest handled.",
  },
];

const integrations = [
  "Google Calendar",
  "Gmail",
  "Notion",
  "Slack",
  "Spotify",
  "Todoist",
];

const featureDepth = [
  {
    eyebrow: "TASKS",
    title: "Everything on your mind, gently organised",
    body: "Drop in a thought in plain language and Haven turns it into the right task, on the right day, with the right priority. No forms, no friction — just a clear head.",
    art: "tasks" as const,
  },
  {
    eyebrow: "CALENDAR",
    title: "A calendar that protects your time",
    body: "Haven guards your mornings for focus and arranges the rest around your energy. Your week stops feeling like a battle and starts feeling like a plan.",
    art: "calendar" as const,
  },
  {
    eyebrow: "FOCUS",
    title: "A calm room for deep work",
    body: "Slip into a focus session and let the world fade. Soft timing, gentle music, and zero clutter — so the work feels less like effort and more like flow.",
    art: "focus" as const,
  },
  {
    eyebrow: "INTELLIGENCE",
    title: "An assistant that has your back",
    body: "Haven watches the edges of your day so you don't have to. It remembers what you tend to forget and steps in right before things slip.",
    art: "ai" as const,
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

const faqs = [
  {
    q: "Is my data private?",
    a: "Yes. Your tasks, calendar, and habits stay yours. Haven uses them only to plan and protect your day — never sold, never shared. Private by design.",
  },
  {
    q: "Do I have to set everything up manually?",
    a: "No. Connect your calendar and tasks once and Haven settles in on its own — learning your rhythm and organising your days without endless configuration.",
  },
  {
    q: "What does the AI actually do?",
    a: "It plans your day around what matters, reshuffles when life changes, watches for slipping deadlines, and gently nudges you only when it's truly worth it.",
  },
  {
    q: "What can Haven connect to?",
    a: "Google Calendar, Gmail, Notion, Slack, Spotify, Todoist and more — so Haven works inside the tools you already live in, not beside them.",
  },
  {
    q: "Is it free to start?",
    a: "Yep. You can move into Haven for free, no credit card needed. Stay as long as it feels like home.",
  },
];

/* ------------------------------------------------------------------ */
/* Feature mini-art — tiny pixel screens                                */
/* ------------------------------------------------------------------ */

function FeatureArt({ art }: { art: "tasks" | "calendar" | "focus" | "ai" }) {
  return (
    <div className="pixel-scanlines pixel-corners relative aspect-[4/3] w-full overflow-hidden border-[4px] border-[#3a342d] bg-[#1d1a17] shadow-pixel">
      <div className="pixel-grid absolute inset-0 opacity-60" />
      <div className="relative z-[1] flex h-full w-full items-center justify-center p-5">
        {art === "tasks" && (
          <div className="w-full space-y-2.5">
            {[
              { done: true, w: "w-3/4" },
              { done: true, w: "w-2/3" },
              { done: false, w: "w-5/6" },
              { done: false, w: "w-1/2" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className={`pixelated h-4 w-4 border-2 ${
                    row.done
                      ? "border-success-500 bg-success-500/80"
                      : "border-warm-400/60 bg-transparent"
                  }`}
                />
                <span
                  className={`h-2.5 ${row.w} ${
                    row.done ? "bg-warm-400/25" : "bg-warm-300/50"
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {art === "calendar" && (
          <div className="grid w-full grid-cols-5 gap-1.5">
            {Array.from({ length: 20 }).map((_, i) => {
              const busy = [3, 6, 7, 12, 16, 17].includes(i);
              const focus = [8, 13].includes(i);
              return (
                <span
                  key={i}
                  className={`pixelated aspect-square border ${
                    focus
                      ? "border-accent-400 bg-accent-500/50"
                      : busy
                        ? "border-warm-400/50 bg-warm-400/40"
                        : "border-[#3a342d] bg-[#221f1b]"
                  }`}
                />
              );
            })}
          </div>
        )}

        {art === "focus" && (
          <div className="flex flex-col items-center gap-4">
            <div className="pixelated relative grid h-20 w-20 place-items-center border-4 border-warm-400/70 bg-[#221f1b]">
              <span className="font-pixel text-xl text-warm-300">25:00</span>
              <span className="absolute -right-1.5 -top-1.5 h-3 w-3 bg-success-500 animate-pixel-twinkle" />
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 ${i < 4 ? "bg-warm-400" : "bg-warm-400/25"}`}
                />
              ))}
            </div>
          </div>
        )}

        {art === "ai" && (
          <div className="flex flex-col items-center gap-3">
            <AiSprite size={64} />
            <div className="pixel-corners border-2 border-accent-400/50 bg-[#221f1b] px-3 py-1.5">
              <span className="font-terminal text-lg leading-none text-accent-300">
                i moved your 3pm. rest easy.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                             */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-terminal text-xl uppercase tracking-[0.25em] text-warm-400">
      {children}
    </p>
  );
}

function IntegrationsStrip() {
  return (
    <section className="relative z-10 mx-auto mt-24 w-full max-w-4xl px-6">
      <Reveal className="text-center">
        <p className="font-terminal text-xl tracking-[0.15em] text-[var(--text-tertiary)]">
          works inside the tools you already live in
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {integrations.map((name) => (
            <span
              key={name}
              className="pixel-corners flex items-center gap-2 border-2 border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--text-secondary)] shadow-pixel-sm"
            >
              <span className="h-2.5 w-2.5 bg-warm-400" />
              {name}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Pillars() {
  const reduce = useReducedMotion();
  return (
    <section id="features" className="relative z-10 mx-auto mt-32 w-full max-w-5xl scroll-mt-24 px-6">
      <Reveal className="mb-12 text-center">
        <SectionLabel>{"// why haven"}</SectionLabel>
        <h2 className="font-pixel mx-auto max-w-2xl text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
          A quieter way to stay on top of everything
        </h2>
      </Reveal>

      <motion.div
        variants={reduce ? undefined : stagger}
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {pillars.map((p) => (
          <motion.div
            key={p.title}
            variants={reduce ? undefined : fadeUp}
            className="pixel-corners group relative border-[3px] border-[#3a342d] bg-[var(--surface)] p-6 shadow-pixel transition-transform duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <div className="pixelated mb-5 grid h-12 w-12 place-items-center border-[3px] border-warm-400/50 bg-warm-400/12 text-warm-400">
              <PixelIcon kind={p.icon} />
            </div>
            <h3 className="font-pixel mb-2.5 text-xl font-semibold text-[var(--text-primary)]">
              {p.title}
            </h3>
            <p className="text-[15px] leading-[1.75] text-[var(--text-secondary)]">
              {p.body}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section id="how" className="relative z-10 mx-auto mt-36 w-full max-w-5xl scroll-mt-24 px-6">
      <Reveal className="mb-12 text-center">
        <SectionLabel>{"// moving in"}</SectionLabel>
        <h2 className="font-pixel mx-auto max-w-2xl text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
          From chaos to calm in three steps
        </h2>
      </Reveal>

      <motion.div
        variants={reduce ? undefined : stagger}
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {steps.map((s) => (
          <motion.div
            key={s.n}
            variants={reduce ? undefined : fadeUp}
            className="pixel-corners relative border-[3px] border-[#3a342d] bg-[var(--surface)] p-6 shadow-pixel"
          >
            <span className="font-pixel absolute right-4 top-3 text-2xl font-bold text-warm-400/30">
              {s.n}
            </span>
            <div className="pixelated mb-5 grid h-12 w-12 place-items-center border-[3px] border-warm-400/50 bg-warm-400/12 text-warm-400">
              <PixelIcon kind={s.icon} />
            </div>
            <h3 className="font-pixel mb-2.5 text-xl font-semibold text-[var(--text-primary)]">
              {s.title}
            </h3>
            <p className="text-[15px] leading-[1.75] text-[var(--text-secondary)]">
              {s.body}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function FeatureDepth() {
  return (
    <section className="relative z-10 mx-auto mt-36 w-full max-w-4xl px-6">
      <div className="flex flex-col gap-24">
        {featureDepth.map((f, i) => (
          <Reveal key={f.eyebrow}>
            <div
              className={`flex flex-col items-center gap-10 md:flex-row ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1 text-center md:text-left">
                <p className="mb-3 font-terminal text-xl uppercase tracking-[0.2em] text-warm-400">
                  [ {f.eyebrow} ]
                </p>
                <h3 className="font-pixel mb-4 text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
                  {f.title}
                </h3>
                <p className="mx-auto max-w-md text-[15px] leading-[1.75] text-[var(--text-secondary)] md:mx-0">
                  {f.body}
                </p>
              </div>
              <div className="flex-1">
                <FeatureArt art={f.art} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CozyBand() {
  return (
    <section className="relative z-10 mx-auto mt-36 w-full max-w-5xl px-6">
      <Reveal>
        <div className="pixel-corners pixel-dither relative overflow-hidden border-[4px] border-[#5e3a26] bg-gradient-to-br from-warm-200/60 to-clay-200/40 px-8 py-14 text-center shadow-pixel-lg dark:from-warm-500/10 dark:to-clay-500/10">
          <div className="mb-6 flex justify-center">
            <AiSprite size={60} />
          </div>
          <h2 className="font-pixel mx-auto max-w-2xl text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            The home that has your back
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.8] text-[var(--text-secondary)]">
            Haven isn&apos;t another dashboard to manage. It&apos;s a warm,
            lamp-lit place that notices everything — every task, every
            reschedule, every late night — and quietly keeps things in order, so
            you can finally exhale.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="relative z-10 mx-auto mt-36 w-full max-w-5xl px-6">
      <Reveal className="mb-12 text-center">
        <p className="font-pixel text-4xl font-bold text-warm-400 sm:text-5xl">
          Save 45 minutes a day
        </p>
        <p className="mt-4 text-base text-[var(--text-secondary)]">
          That&apos;s how much planning and second-guessing Haven quietly takes
          off your plate.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08}>
            <figure className="pixel-corners relative h-full border-[3px] border-[#3a342d] bg-[var(--surface)] p-6 shadow-pixel">
              <div className="mb-3 flex gap-0.5 text-warm-400">
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} className="h-3 w-3 bg-warm-400" />
                ))}
              </div>
              <blockquote className="text-[15px] leading-[1.75] text-[var(--text-primary)]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="pixelated grid h-9 w-9 place-items-center border-2 border-[#3a2418] bg-gradient-to-br from-warm-300 to-warm-500 font-pixel text-sm font-bold text-[#3a2418]">
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

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative z-10 mx-auto mt-36 w-full max-w-3xl scroll-mt-24 px-6">
      <Reveal className="mb-10 text-center">
        <SectionLabel>{"// before you move in"}</SectionLabel>
        <h2 className="font-pixel text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
          Questions, answered
        </h2>
      </Reveal>

      <div className="flex flex-col gap-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={i * 0.04}>
              <div className="pixel-corners border-[3px] border-[#3a342d] bg-[var(--surface)] shadow-pixel-sm">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-pixel text-lg font-semibold text-[var(--text-primary)]">
                    {f.q}
                  </span>
                  <span
                    className={`pixelated grid h-6 w-6 flex-shrink-0 place-items-center border-2 border-warm-400/60 font-pixel text-warm-400 transition-transform duration-150 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="border-t-2 border-[var(--border)] px-5 py-4 text-[15px] leading-[1.75] text-[var(--text-secondary)]">
                    {f.a}
                  </p>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function EmotionalClose() {
  return (
    <section className="relative z-10 mx-auto mt-36 w-full max-w-3xl px-6 text-center">
      <Reveal>
        <div className="mb-8 flex justify-center">
          <AiSprite size={72} />
        </div>
        <h2 className="font-pixel text-3xl font-bold text-[var(--text-primary)] sm:text-5xl">
          Stop managing your life.
          <br />
          <span className="gradient-text-pixel">Start living it.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-[1.75] text-[var(--text-secondary)]">
          Let Haven hold the logistics of your days, so you can spend your
          attention on the things that actually matter.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <GetStartedButton />
          <p className="font-terminal text-lg tracking-wide text-[var(--text-tertiary)]">
            free to start &middot; private by design
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sticky nav                                                          */
/* ------------------------------------------------------------------ */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={`mx-auto flex w-full max-w-6xl items-center justify-between px-6 transition-all duration-200 ${
          scrolled
            ? "my-2 border-2 border-[var(--border)] bg-[var(--surface)]/85 py-2.5 shadow-pixel-sm backdrop-blur-md"
            : "py-5"
        }`}
        style={scrolled ? { borderRadius: 0 } : undefined}
      >
        <a href="#top" className="flex items-center gap-2.5">
          <PixelLogo size={26} />
          <span className="font-pixel text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Haven
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {[
            { label: "features", href: "#features" },
            { label: "how it works", href: "#how" },
            { label: "faq", href: "#faq" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-terminal text-xl text-[var(--text-secondary)] transition-colors hover:text-warm-400"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="hidden font-terminal text-xl text-[var(--text-secondary)] transition-colors hover:text-warm-400 sm:block"
          >
            sign in &gt;
          </button>
          <GetStartedButton size="sm" label="Enter" />
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Landing Page                                                        */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const reduce = useReducedMotion();

  // The app shell locks scrolling globally (body { overflow: hidden }).
  // The landing page is a long marketing page, so unlock the document
  // while it's mounted, then restore the lock for the dashboard.
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prev = {
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      bodyHeight: body.style.height,
      htmlHeight: html.style.height,
    };
    body.style.overflow = "auto";
    html.style.overflow = "auto";
    body.style.height = "auto";
    html.style.height = "auto";
    return () => {
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      body.style.height = prev.bodyHeight;
      html.style.height = prev.htmlHeight;
    };
  }, []);

  return (
    <div id="top" className="relative w-full bg-[var(--bg)]">
      {/* warm ambient background + dither (fixed behind everything) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[20%] left-[10%] h-[640px] w-[640px] rounded-full bg-warm-400/[0.1] blur-[130px] animate-drift" />
        <div className="absolute top-[35%] -right-[8%] h-[520px] w-[520px] rounded-full bg-clay-400/[0.08] blur-[120px] animate-aurora" />
        <div className="absolute bottom-[2%] left-[28%] h-[460px] w-[460px] rounded-full bg-accent-500/[0.06] blur-[110px] animate-float-slow" />
        <div className="pixel-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(circle_at_50%_15%,black,transparent_70%)]" />
      </div>

      <Nav />

      {/* Hero */}
      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-10 text-center">
        <motion.div
          initial={reduce ? undefined : "hidden"}
          animate={reduce ? undefined : "visible"}
          variants={reduce ? undefined : stagger}
          className="flex w-full flex-col items-center"
        >
          <motion.div
            variants={reduce ? undefined : fadeUp}
            className="pixel-corners mb-7 inline-flex items-center gap-2 border-2 border-warm-400/40 bg-warm-400/10 px-3 py-1.5"
          >
            <span className="h-2 w-2 bg-success-500 animate-pixel-twinkle" />
            <span className="font-terminal text-lg leading-none text-warm-300">
              your AI home, always awake
            </span>
          </motion.div>

          <motion.h1
            variants={reduce ? undefined : fadeUp}
            className="font-pixel max-w-3xl text-balance text-4xl font-bold leading-[1.15] text-[var(--text-primary)] sm:text-5xl md:text-6xl"
          >
            Your calm place to{" "}
            <span className="gradient-text-pixel">get things done</span>
          </motion.h1>

          <motion.p
            variants={reduce ? undefined : fadeUp}
            className="mt-6 max-w-xl text-balance text-lg leading-[1.7] text-[var(--text-secondary)]"
          >
            Haven is the AI that plans your day, protects your time, and learns
            your rhythm. Every task, every deadline, quietly watched over — so
            the chaos quiets down and your focus comes home.
          </motion.p>

          <motion.div
            variants={reduce ? undefined : fadeUp}
            className="mt-9 flex flex-col items-center gap-4"
          >
            <GetStartedButton />
            <p className="font-terminal text-lg tracking-wide text-[var(--text-tertiary)]">
              calm in the chaos &middot; no credit card needed
            </p>
          </motion.div>

          <motion.div
            variants={reduce ? undefined : fadeUp}
            className="mb-6 mt-14 w-full max-w-3xl"
          >
            <PixelCottage />
          </motion.div>
        </motion.div>
      </section>

      <IntegrationsStrip />
      <Pillars />
      <HowItWorks />
      <FeatureDepth />
      <CozyBand />
      <SocialProof />
      <Faq />
      <EmotionalClose />

      {/* Footer */}
      <footer className="relative z-10 mt-36 border-t-2 border-[var(--border)] pb-14 pt-14">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-10 px-6 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <PixelLogo size={24} />
              <span className="font-pixel text-base font-semibold tracking-tight text-[var(--text-primary)]">
                Haven
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-[1.7] text-[var(--text-secondary)]">
              The cozy AI home for your tasks, time, and focus. Come home to
              calm.
            </p>
          </div>

          {[
            { title: "Product", links: ["Features", "How it works", "FAQ"] },
            { title: "Company", links: ["About", "Privacy", "Contact"] },
            { title: "Get started", links: ["Sign in", "Enter Haven"] },
          ].map((col) => (
            <div key={col.title}>
              <p className="font-terminal text-lg uppercase tracking-[0.15em] text-warm-400">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                      className="text-sm text-[var(--text-secondary)] transition-colors hover:text-warm-400"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 flex w-full max-w-5xl flex-col items-center justify-between gap-3 border-t-2 border-[var(--border)] px-6 pt-6 sm:flex-row">
          <p className="text-xs text-[var(--text-tertiary)]">
            Built with care. Your day, handled — your data stays yours.
          </p>
          <p className="font-terminal text-base text-[var(--text-tertiary)] opacity-70">
            haven {new Date().getFullYear()} — the porch light is on
          </p>
        </div>
      </footer>
    </div>
  );
}
