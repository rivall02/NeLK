import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import NotesClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Catatan - NeLK",
};

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch notes with full content
  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  const mappedNotes = notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content || "",
    preview: n.content ? n.content.slice(0, 100) : "",
    subject: "Umum",
    visibility: n.visibility as "public" | "private",
    updatedAt: new Date(n.updatedAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return <NotesClient initialNotes={mappedNotes} />;
}
