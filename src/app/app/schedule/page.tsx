import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ScheduleClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Jadwal & Kalender - NeLK",
};

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get active session ID for filtering
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeSessionId: true },
  });
  const activeSessionId = user?.activeSessionId ?? null;

  // Fetch events & upcoming tasks from DB
  const [events, upcomingTasks] = await Promise.all([
    prisma.event.findMany({
      where: {
        userId: session.user.id,
        ...(activeSessionId ? { sessionId: activeSessionId } : {}),
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.task.findMany({
      where: {
        userId: session.user.id,
        status: { not: "DONE" },
        dueDate: { not: null },
        ...(activeSessionId ? { sessionId: activeSessionId } : {}),
      },
      orderBy: { dueDate: "asc" },
      take: 4,
    }),
  ]);

  const mappedEvents = events.map((e) => {
    const d = new Date(e.date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      id: e.id,
      title: e.title,
      description: e.description || undefined,
      startTime: e.startTime || "",
      endTime: e.endTime || "",
      time: e.startTime && e.endTime ? `${e.startTime} - ${e.endTime}` : e.startTime || "Sepanjang hari",
      type: (e.title.toLowerCase().includes("belajar") || e.title.toLowerCase().includes("study")
        ? "study"
        : "class") as "class" | "study" | "meeting" | "exam",
      date: dateStr,
    };
  });

  const mappedTasks = upcomingTasks.map((t) => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
    priority: t.priority,
  }));

  return <ScheduleClient initialEvents={mappedEvents} initialDeadlines={mappedTasks} />;
}
