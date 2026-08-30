import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import FilesClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Files & Belajar - NeLK",
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

  const [documents, courses] = await Promise.all([
    prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { flashcards: true },
    }),
  ]);

  const mappedDocs = documents.map((d) => ({
    id: d.id,
    name: d.title,
    size: formatBytes(d.fileSize),
    type: d.title.toLowerCase().endsWith(".pdf") ? "pdf" : "text",
    content: d.content || "",
    date: new Date(d.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    downloadUrl: `/api/documents/${d.id}/download`,
  }));

  const mappedCourses = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description || "",
    flashcardCount: c.flashcards.length,
  }));

  return <FilesClient initialFiles={mappedDocs} initialCourses={mappedCourses} />;
}
