import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CoursesClient from "./client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Belajar - NeLK",
};

export default async function CoursesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [courses, notes] = await Promise.all([
    prisma.course.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.note.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        visibility: true,
        updatedAt: true,
        courseId: true,
      },
    }),
  ]);

  // Transform notes for client
  const formattedNotes = notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content || "",
    preview: n.content ? n.content.slice(0, 100) : "",
    subject: "Umum",
    visibility: (n.visibility as "public" | "private") || "private",
    updatedAt: new Date(n.updatedAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    courseId: n.courseId,
  }));

  return <CoursesClient initialCourses={courses} initialNotes={formattedNotes} />;
}
