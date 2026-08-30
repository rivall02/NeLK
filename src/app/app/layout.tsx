import { Sidebar } from "@/components/app/sidebar";
import { CommandCenter } from "@/components/app/command-center";

import { NotificationBell } from "@/components/app/notification-bell";
import { Toaster } from "sonner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)]">
      <Sidebar />
      <CommandCenter />

      <NotificationBell />
      <Toaster position="top-right" />
      {/* Main content area — offset by top header & bottom bar on mobile, sidebar on desktop */}
      <main className="pb-[calc(110px+env(safe-area-inset-bottom))] pt-[calc(var(--topbar-height)+12px)] md:pb-8 md:pt-4 md:pl-[var(--sidebar-width)] transition-[padding] duration-250">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-8 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
