"use client";

import { useSession } from "next-auth/react";
import AppShell from "@/components/layout/AppShell";
import SpotifyMiniPlayer from "@/components/SpotifyMiniPlayer";
import {
  ConnectionProvider,
  useConnectionState,
} from "@/components/chat/ConnectionContext";
import { AIContextProvider } from "@/components/ai/AIContextProvider";
import AIToast from "@/components/ai/AIToast";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

function NotificationSocketListener() {
  useNotificationSocket();
  return null;
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { connection } = useConnectionState();
  const userImage = session?.user?.image ?? null;

  const connected =
    connection === "connected"
      ? true
      : connection === "disconnected"
        ? false
        : undefined;

  return (
    <AppShell connected={connected} userImage={userImage}>
      <AIContextProvider>
        <NotificationSocketListener />
        {children}
        <AIToast />
      </AIContextProvider>
      <SpotifyMiniPlayer />
    </AppShell>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConnectionProvider>
      <DashboardShell>{children}</DashboardShell>
    </ConnectionProvider>
  );
}
