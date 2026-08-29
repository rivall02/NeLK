import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import FilesClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Files - NeLK",
};

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
    size: "Unknown", // we don't store size yet
    type: d.title.toLowerCase().endsWith(".pdf") ? "pdf" : "text",
    date: new Date(d.createdAt).toLocaleDateString(),
    fileUrl: d.fileUrl,
  }));

  return <FilesClient initialFiles={mappedDocs} />;
}
