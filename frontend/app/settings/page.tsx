"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-dark-900 text-white p-6">
      {/* Back button */}
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon-cyan transition-colors mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        {/* User Profile Section */}
        <section className="mb-8 p-6 border border-dark-600 rounded-xl bg-dark-800">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-dark-600"
              />
            )}
            <div>
              <p className="text-white font-medium">
                {session?.user?.name || "User"}
              </p>
              <p className="text-sm text-gray-400">
                {session?.user?.email || "No email"}
              </p>
            </div>
          </div>
        </section>

        {/* Connected Services Section */}
        <section className="mb-8 p-6 border border-dark-600 rounded-xl bg-dark-800">
          <h2 className="text-lg font-semibold mb-4">Connected Services</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-300">Google Calendar</span>
              <span className="text-xs font-mono px-2 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-300">Google Tasks</span>
              <span className="text-xs font-mono px-2 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-300">Gmail</span>
              <span className="text-xs font-mono px-2 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                Connected
              </span>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="mb-8 p-6 border border-dark-600 rounded-xl bg-dark-800">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>

          {/* Working Hours */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Working Hours
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Start</label>
                <input
                  type="time"
                  defaultValue="09:00"
                  className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan/50"
                />
              </div>
              <span className="text-gray-500 mt-5">to</span>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">End</label>
                <input
                  type="time"
                  defaultValue="18:00"
                  className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan/50"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Notifications
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-neon-cyan focus:ring-neon-cyan/50"
                />
                <span className="text-sm text-gray-300">Gentle</span>
                <span className="text-xs text-gray-500">
                  Low priority reminders
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-neon-cyan focus:ring-neon-cyan/50"
                />
                <span className="text-sm text-gray-300">Urgent</span>
                <span className="text-xs text-gray-500">
                  Time-sensitive items
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-neon-cyan focus:ring-neon-cyan/50"
                />
                <span className="text-sm text-gray-300">Critical</span>
                <span className="text-xs text-gray-500">
                  Immediate attention required
                </span>
              </label>
            </div>
          </div>

          {/* Theme */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Theme</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-600 opacity-60 cursor-not-allowed">
                Dark
              </span>
              <span className="text-xs text-gray-600">(Only option)</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
