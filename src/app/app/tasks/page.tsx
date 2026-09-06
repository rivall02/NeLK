import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TasksClient from "./client";
import { redirect } from "next/navigation";
import { normalizeTaskStatus, normalizeTaskPriority } from "@/lib/validations";

export const metadata = {
  title: "Tugas - NeLK",
};

export default async function TasksPage() {
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

  // Fetch tasks from DB
  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      ...(activeSessionId ? { sessionId: activeSessionId } : {}),
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  // Map to canonical format for client
  const mappedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || undefined,
    due: t.dueDate ? t.dueDate.toISOString() : undefined,
    priority: normalizeTaskPriority(t.priority),
    status: normalizeTaskStatus(t.status),
    subject: t.subject || undefined,
  }));

  return <TasksClient initialTasks={mappedTasks} />;
}
