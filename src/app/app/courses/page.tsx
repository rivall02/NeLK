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

  // Get active session ID for filtering
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeSessionId: true },
  });
  const activeSessionId = user?.activeSessionId ?? null;

  const [courses, notes] = await Promise.all([
    prisma.course.findMany({
      where: {
        userId: session.user.id,
        ...(activeSessionId ? { sessionId: activeSessionId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        documents: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            fileUrl: true,
            mimeType: true,
            fileSize: true,
            classroomId: true,
            classroomUrl: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.note.findMany({
      where: {
        userId: session.user.id,
        ...(activeSessionId ? { sessionId: activeSessionId } : {}),
      },
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

  // Format courses with document count
  const formattedCourses = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    courseId: c.courseId, // Google Classroom course ID (if synced)
    createdAt: c.createdAt,
    documentCount: c.documents.length,
    documents: c.documents.map((d) => ({
      id: d.id,
      title: d.title,
      fileUrl: d.fileUrl,
      mimeType: d.mimeType,
      fileSize: d.fileSize,
      classroomId: d.classroomId,
      classroomUrl: d.classroomUrl,
      createdAt: d.createdAt,
      createdAtFormatted: new Date(d.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    })),
  }));

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

  return <CoursesClient initialCourses={formattedCourses} initialNotes={formattedNotes} />;
}
