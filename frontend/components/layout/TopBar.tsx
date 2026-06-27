"use client";

import { motion } from "framer-motion";
import { Search, Menu } from "lucide-react";
import Image from "next/image";

interface TopBarProps {
  title?: string;
  connected?: boolean;
  userImage?: string | null;
  onMenuClick?: () => void;
}

/**
 * TopBar
 * Notion-style minimal top bar spanning the content area.
 * Shows page title, search trigger (Cmd+K), connection status, and user avatar.
 */
export default function TopBar({
  title = "Dashboard",
  connected,
  userImage,
  onMenuClick,
}: TopBarProps) {
  const connectionColor =
    connected === true
      ? "bg-emerald-400"
      : connected === false
        ? "bg-red-400"
        : "bg-amber-400 animate-pulse";

  const connectionLabel =
    connected === true
      ? "Connected"
      : connected === false
        ? "Disconnected"
        : "Connecting";

  const handleSearchClick = () => {
    // Dispatch Cmd+K keyboard event to open the command palette
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-14 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg)]/80 px-4 backdrop-blur-md md:px-6"
    >
      {/* Left section: mobile menu + page title */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <motion.button
            onClick={onMenuClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] md:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </motion.button>
        )}
        <motion.h1
          key={title}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-base font-semibold text-[var(--text-primary)]"
        >
          {title}
        </motion.h1>
      </div>

      {/* Right section: search, connection, avatar */}
      <div className="flex items-center gap-3">
        {/* Search / Command Palette trigger */}
        <motion.button
          onClick={handleSearchClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-tertiary)] transition-all duration-200 hover:border-[var(--text-tertiary)]/30 hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)] hover:shadow-sm sm:flex"
        >
          <Search size={14} />
          <span>Search</span>
          <kbd className="ml-2 rounded-md bg-[var(--bg-tertiary)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
            &#8984;K
          </kbd>
        </motion.button>

        {/* Connection status indicator */}
        <div
          className="flex items-center gap-1.5 rounded-full px-2 py-1"
          title={connectionLabel}
        >
          <span
            className={`h-2 w-2 rounded-full ${connectionColor} shadow-sm`}
          />
        </div>

        {/* User avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {userImage ? (
            <Image
              src={userImage}
              alt="User avatar"
              width={30}
              height={30}
              className="rounded-full ring-2 ring-[var(--border)] ring-offset-1 ring-offset-[var(--bg)] transition-all hover:ring-accent-500/30"
            />
          ) : (
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-accent-500/15 text-xs font-semibold text-accent-400 ring-2 ring-[var(--border)] ring-offset-1 ring-offset-[var(--bg)]">
              U
            </div>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
}
