import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import FilesClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Belajar - NeLK",
};

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes === 0) return "Ukuran bervariasi";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default async function FilesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [documents, courses, notes] = await Promise.all([
    prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { flashcards: true },
    }),
    prisma.note.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const mappedDocs = documents.map((d) => ({
    id: d.id,
    name: d.title,
    size: formatBytes(d.fileSize),
    type: d.title.toLowerCase().endsWith(".pdf") ? "pdf" : "text",
    content: d.content || "",
    createdAt: d.createdAt,
    date: new Date(d.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    downloadUrl: d.fileUrl || `/api/documents/${d.id}/download`,
  }));

  const mappedNotes = notes.map((n) => ({
    id: n.id,
    name: n.title || "Catatan Tanpa Judul",
    size: "Catatan",
    type: "text",
    content: n.content || "",
    createdAt: n.createdAt,
    date: new Date(n.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    downloadUrl: undefined,
  }));

  const allDocs = [...mappedDocs, ...mappedNotes].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).map(({ createdAt, ...rest }) => rest);

  const mappedCourses = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description || "",
    flashcardCount: c.flashcards.length,
  }));

  return <FilesClient initialFiles={allDocs} initialCourses={mappedCourses} />;
}
