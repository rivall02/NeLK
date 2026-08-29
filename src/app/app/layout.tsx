import { Sidebar } from "@/components/app/sidebar";
import { CommandCenter } from "@/components/app/command-center";
import { AIChat } from "@/components/app/ai-chat";
import { NotificationBell } from "@/components/app/notification-bell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)]">
      <Sidebar />
      <CommandCenter />
      <AIChat />
      <NotificationBell />
      {/* Main content area — offset by sidebar on desktop, topbar on mobile */}
      <main className="pt-[var(--topbar-height)] md:pt-0 md:pl-[var(--sidebar-width)] transition-[padding] duration-250">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
