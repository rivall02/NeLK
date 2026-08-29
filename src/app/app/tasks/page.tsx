import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TasksClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Tugas - NeLK",
};

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch tasks from DB
  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Map to the format expected by the client
  const mappedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || undefined,
    due: t.dueDate ? new Date(t.dueDate).toLocaleString("id-ID") : undefined,
    // Provide default mappings for properties not in Prisma model yet
    priority: "medium" as const, 
    status: t.status as "inbox" | "planned" | "completed",
    subject: undefined,
  }));

  return <TasksClient initialTasks={mappedTasks} />;
}
