"use client";

import { motion } from "framer-motion";
import type { CalendarView } from "./types";

const TABS: { id: CalendarView; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "list", label: "List" },
];

interface ViewTabsProps {
  active: CalendarView;
  onChange: (view: CalendarView) => void;
}

export default function ViewTabs({ active, onChange }: ViewTabsProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-white/[0.04] p-1 ring-1 ring-white/[0.06]">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="relative flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
        >
          {active === tab.id && (
            <motion.div
              layoutId="cal-tab-pill"
              className="absolute inset-0 rounded-lg bg-white/[0.08]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span
            className={`relative z-10 ${
              active === tab.id ? "text-white" : "text-white/50"
            }`}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
