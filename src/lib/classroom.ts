import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Sync Google Classroom courses for a given user.
 */
export async function syncClassroomCourses(userId: string, accessToken: string) {
  try {
    const response = await fetch(
      "https://classroom.googleapis.com/v1/courses",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch courses");
    }

    const data = await response.json();
    const courses = data.courses || [];

    // Sync each course
    for (const course of courses) {
      await prisma.course.upsert({
        where: {
          id: `gc-${course.id}`,
        },
        create: {
          id: `gc-${course.id}`,
          title: course.name || "Untitled Course",
          description: course.description || null,
          userId: userId,
        },
        update: {
          title: course.name || "Untitled Course",
          description: course.description || null,
        },
      });
    }

    return { synced: courses.length };
  } catch (error) {
    logger.error("Error syncing classroom courses", error);
    throw error;
  }
}
