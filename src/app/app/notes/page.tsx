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

  // Fetch notes from DB
  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  // Map to the format expected by the client
  const mappedNotes = notes.map((n) => ({
    id: n.id,
    title: n.title,
    preview: n.content ? n.content.substring(0, 50) : "",
    subject: "Umum",
    updatedAt: new Date(n.updatedAt).toLocaleString("id-ID"),
  }));

  return <NotesClient initialNotes={mappedNotes} />;
}
