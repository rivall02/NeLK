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
      {/* Main content area — offset by sidebar on desktop, bottom bar on mobile */}
      <main className="pb-[calc(80px+env(safe-area-inset-bottom))] pt-4 md:pb-0 md:pt-0 md:pl-[var(--sidebar-width)] transition-[padding] duration-250">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
