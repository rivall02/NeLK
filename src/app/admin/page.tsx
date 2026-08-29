import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (user?.role !== "ADMIN") {
    redirect("/app");
  }

  const userCount = await prisma.user.count();
  const taskCount = await prisma.task.count();
  const noteCount = await prisma.note.count();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)]">Total Users</h3>
            <p className="text-4xl font-bold text-[var(--color-primary)] mt-2">{userCount}</p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)]">Total Tasks</h3>
            <p className="text-4xl font-bold text-[var(--color-accent-lime)] mt-2">{taskCount}</p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)]">Total Notes</h3>
            <p className="text-4xl font-bold text-[var(--color-accent-pink)] mt-2">{noteCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
