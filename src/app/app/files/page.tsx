import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import FilesClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dokumen & Modul - NeLK",
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

  // Fetch documents from DB
  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const mappedDocs = documents.map((d) => ({
    id: d.id,
    name: d.title,
    size: formatBytes(d.fileSize),
    type: d.title.toLowerCase().endsWith(".pdf") ? "pdf" : "text",
    date: new Date(d.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    downloadUrl: `/api/documents/${d.id}/download`,
  }));

  return <FilesClient initialFiles={mappedDocs} />;
}
