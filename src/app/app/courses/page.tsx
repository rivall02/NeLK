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

  const courses = await prisma.course.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return <CoursesClient initialCourses={courses} />;
}
