"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import EntityCanvas from "@/components/entity/EntityCanvas";
import ChatPanel from "@/components/chat/ChatPanel";
import HudLabels from "@/components/entity/HudLabels";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <main className="relative w-screen h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a]">
      {/* Top Nav Bar */}
      <nav className="flex items-center justify-between px-6 py-3 border-b border-dark-600 bg-dark-900/50 backdrop-blur-sm z-10">
        <span className="text-lg font-bold text-white">ChronAI</span>
        <div className="flex items-center gap-3">
          {/* Settings gear icon */}
          <Link
            href="/settings"
            className="text-gray-400 hover:text-neon-cyan transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
          {/* User avatar */}
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="User"
              className="w-8 h-8 rounded-full border border-dark-600"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center">
              <span className="text-xs text-gray-400">
                {session?.user?.name?.[0] || "U"}
              </span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Entity Area */}
        <div className="flex-1 relative">
          <EntityCanvas />
          <HudLabels isActive={true} />
        </div>

        {/* Chat Panel Sidebar */}
        <aside className="w-[400px] h-full border-l border-dark-600 bg-dark-800/80 backdrop-blur-sm">
          <ChatPanel />
        </aside>
      </div>
    </main>
  );
}
