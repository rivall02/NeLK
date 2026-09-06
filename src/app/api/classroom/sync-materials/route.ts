import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getValidGoogleToken } from "@/lib/classroom";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const googleAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" },
  });

  if (!googleAccount) {
    return NextResponse.json({ error: "Google account not connected" }, { status: 400 });
  }

  const accessToken = await getValidGoogleToken(googleAccount);
  if (!accessToken) {
    return NextResponse.json({ error: "Google token expired" }, { status: 401 });
  }

  try {
    const { courseIds } = await request.json();
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ error: "No courses selected" }, { status: 400 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeSessionId: true },
    });
    const activeSessionId = userData?.activeSessionId ?? null;
    let syncedCourses = 0;
    let syncedDocuments = 0;

    for (const classroomCourseId of courseIds.slice(0, 10)) {
      // Fetch course info
      const courseRes = await fetch(
        `https://classroom.googleapis.com/v1/courses/${classroomCourseId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!courseRes.ok) continue;

      const classroomCourse = await courseRes.json();

      // Create or update course in NeLK
      const course = await prisma.course.upsert({
        where: {
          id: `${session.user.id}-${classroomCourseId}`, // deterministic ID based on user + classroom ID
          userId: session.user.id,
        },
        create: {
          id: `${session.user.id}-${classroomCourseId}`,
          title: classroomCourse.name,
          description: classroomCourse.description || null,
          userId: session.user.id,
          sessionId: activeSessionId,
          courseId: classroomCourseId, // Google Classroom course ID
        },
        update: {
          title: classroomCourse.name,
          description: classroomCourse.description || null,
        },
      });

      syncedCourses++;

      // Fetch courseWorkMaterials from this course
      const materialsRes = await fetch(
        `https://classroom.googleapis.com/v1/courses/${classroomCourseId}/courseWorkMaterials?orderBy=creationTime desc`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!materialsRes.ok) continue;

      const materialsData = await materialsRes.json();
      const materials = materialsData.courseWorkMaterial || [];

      for (const material of materials.slice(0, 50)) {
        // Extract materials from each item
        const materialItems = material.materials || [];

        for (const mat of materialItems) {
          let title = "";
          let fileUrl = "";
          let mimeType = "application/octet-stream";
          let fileSize: number | null = null;
          let creationDate: Date | null = null;

          if (mat.driveFile?.driveFile) {
            title = mat.driveFile.driveFile.title || "";
            fileUrl = mat.driveFile.driveFile.alternateLink || "";
            mimeType = mat.driveFile.driveFile.mimeType || "application/octet-stream";
            fileSize = mat.driveFile.driveFile.size ? parseInt(mat.driveFile.driveFile.size) : null;
            // creationDate from Classroom
            if (material.creationDate) {
              creationDate = new Date(material.creationDate);
            }
          } else if (mat.link) {
            title = mat.link.title || "Link";
            fileUrl = mat.link.url || "";
          } else if (mat.youtubeVideo) {
            title = mat.youtubeVideo.title || "YouTube Video";
            fileUrl = mat.youtubeVideo.alternateLink || "";
          }

          if (!title || !fileUrl) continue;

          // Use classroom material ID for deduplication
          const classroomMaterialId = material.id || `${classroomCourseId}-${title}`;

          // Create or update document
          const existingDoc = await prisma.document.findFirst({
            where: {
              userId: session.user.id,
              classroomId: classroomMaterialId,
            },
          });

          if (!existingDoc) {
            await prisma.document.create({
              data: {
                title,
                content: `Materi dari Google Classroom: ${classroomCourse.name}`,
                fileUrl,
                mimeType,
                fileSize,
                userId: session.user.id,
                courseId: course.id,
                classroomId: classroomMaterialId,
                classroomUrl: fileUrl,
                // Use creationDate from Classroom, or fallback to now
                createdAt: creationDate || new Date(),
              },
            });
            syncedDocuments++;
          } else {
            // Update if fileUrl changed
            await prisma.document.update({
              where: { id: existingDoc.id },
              data: {
                fileUrl,
                mimeType,
                fileSize,
                classroomUrl: fileUrl,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menyinkronkan ${syncedDocuments} materi dari ${syncedCourses} kelas.`,
      syncedCourses,
      syncedDocuments,
    });
  } catch (error) {
    console.error("Classroom sync materials error:", error);
    return NextResponse.json({ error: "Failed to sync materials" }, { status: 500 });
  }
}
