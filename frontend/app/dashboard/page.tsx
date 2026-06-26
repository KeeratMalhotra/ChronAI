"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AmbientBackground from "@/components/ui/AmbientBackground";
import TopBar from "@/components/layout/TopBar";
import SideDock, { type PanelKey } from "@/components/layout/SideDock";
import ChatExperience from "@/components/chat/ChatExperience";
import CalendarDrawer from "@/components/drawers/CalendarDrawer";
import TasksDrawer from "@/components/drawers/TasksDrawer";
import ScheduleDrawer from "@/components/drawers/ScheduleDrawer";
import HabitsDrawer from "@/components/drawers/HabitsDrawer";
import type { ConnectionState } from "@/hooks/useChatSocket";
import { fetchOnboardingStatus } from "@/lib/api";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const accessToken =
    ((session as Record<string, unknown> | null)?.accessToken as string) || "";
  const user = session?.user;

  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Onboarding gate: redirect to /onboarding if profile is not complete
  useEffect(() => {
    if (status !== "authenticated" || !accessToken) return;
    fetchOnboardingStatus(accessToken).then((data) => {
      if (!data.complete) {
        router.push("/onboarding");
      } else {
        setOnboardingChecked(true);
      }
    });
  }, [status, accessToken, router]);

  const [activePanel, setActivePanel] = useState<PanelKey | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");

  const openPanel = (key: PanelKey) =>
    setActivePanel((cur) => (cur === key ? null : key));
  const close = () => setActivePanel(null);

  // Show loading state until onboarding check resolves
  if (status === "loading" || (status === "authenticated" && !onboardingChecked)) {
    return (
      <main className="relative flex h-screen w-screen items-center justify-center bg-base-950">
        <div className="text-sm text-white/50">Loading...</div>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-base-950">
      <AmbientBackground />

      <TopBar
        name={user?.name}
        email={user?.email}
        image={user?.image}
        connected={connection === "connected"}
        accessToken={accessToken}
      />

      <SideDock active={activePanel} onOpen={openPanel} />

      <div className="relative z-10 h-full pt-16">
        <ChatExperience
          accessToken={accessToken}
          userName={user?.name ?? undefined}
          onConnectionChange={setConnection}
        />
      </div>

      {/* Slide-in drawers */}
      <CalendarDrawer
        open={activePanel === "calendar"}
        onClose={close}
        accessToken={accessToken}
      />
      <TasksDrawer
        open={activePanel === "tasks"}
        onClose={close}
        accessToken={accessToken}
      />
      <ScheduleDrawer open={activePanel === "schedule"} onClose={close} />
      <HabitsDrawer open={activePanel === "habits"} onClose={close} />
    </main>
  );
}
