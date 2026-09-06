import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getValidGoogleToken } from "@/lib/classroom";
import { writeFileSync, existsSync, unlinkSync } from "fs";

export async function POST(request: Request) {
  const logPath = "C:/Users/user/Documents/Computer Programming/by Rhys/NeLK/debug-sync.log";
  const log = (msg: string) => {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    try { writeFileSync(logPath, line, { flag: "a" }); } catch {}
    console.log(msg);
  };

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
    log(`courseIds received: ${JSON.stringify(courseIds)}`);

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
      log(`Processing course: ${classroomCourseId}`);

      const courseRes = await fetch(
        `https://classroom.googleapis.com/v1/courses/${classroomCourseId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!courseRes.ok) {
        log(`Course fetch failed: ${courseRes.status}`);
        continue;
      }

      const classroomCourse = await courseRes.json();
      log(`Course name: ${classroomCourse.name}`);

      const course = await prisma.course.upsert({
        where: {
          id: `${session.user.id}-${classroomCourseId}`,
          userId: session.user.id,
        },
        create: {
          id: `${session.user.id}-${classroomCourseId}`,
          title: classroomCourse.name,
          description: classroomCourse.description || null,
          userId: session.user.id,
          sessionId: activeSessionId,
          courseId: classroomCourseId,
        },
        update: {
          title: classroomCourse.name,
          description: classroomCourse.description || null,
        },
      });

      syncedCourses++;
      log(`Course upserted: ${course.id}`);

      // ========== Fetch courseWorkMaterials (materials) ==========
      const allMaterials: any[] = [];
      let pageToken: string | undefined;

      do {
        let url = `https://classroom.googleapis.com/v1/courses/${classroomCourseId}/courseWorkMaterials`;
        if (pageToken) url += `?pageToken=${pageToken}`;

        const materialsRes = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!materialsRes.ok) {
          const errBody = await materialsRes.text();
          log(`Materials API error: ${errBody.slice(0, 300)}`);
          break;
        }

        const materialsData = await materialsRes.json();
        if (materialsData.courseWorkMaterial) {
          allMaterials.push(...materialsData.courseWorkMaterial);
        }
        pageToken = materialsData.nextPageToken;
        log(`courseWorkMaterials page: ${materialsData.courseWorkMaterial?.length || 0}, nextPageToken: ${pageToken || 'none'}`);
      } while (pageToken);

      // ========== Also fetch courseWork (assignments) as materials ==========
      let cwPageToken: string | undefined;
      log(`Fetching courseWork for course ${classroomCourseId}...`);
      do {
        let url = `https://classroom.googleapis.com/v1/courses/${classroomCourseId}/courseWork`;
        if (cwPageToken) url += `?pageToken=${cwPageToken}`;

        const cwRes = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        log(`courseWork API status: ${cwRes.status}`);
        if (cwRes.ok) {
          const cwData = await cwRes.json();
          log(`courseWork keys: ${Object.keys(cwData).join(", ")}`);
          if (cwData.courseWork) {
            allMaterials.push(...cwData.courseWork);
            log(`courseWork page: ${cwData.courseWork.length} items, nextPageToken: ${cwData.nextPageToken || 'none'}`);
          } else {
            log(`courseWork: no items in this page`);
          }
          cwPageToken = cwData.nextPageToken;
        } else {
          const errBody = await cwRes.text();
          log(`courseWork API error: ${errBody.slice(0, 300)}`);
          break;
        }
      } while (cwPageToken);

      for (const material of allMaterials.slice(0, 200)) {
        const materialItems = material.materials || [];
        log(`material id=${material.id}, items count=${materialItems.length}, keys=${Object.keys(material).join(", ")}`);

        for (const mat of materialItems) {
          const matKeys = Object.keys(mat);
          log(`mat keys: ${matKeys.join(", ")}`);

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
            if (material.creationTime) {
              creationDate = new Date(material.creationTime);
            }
          } else if (mat.link) {
            title = mat.link.title || "Link";
            fileUrl = mat.link.url || "";
          } else if (mat.youtubeVideo) {
            title = mat.youtubeVideo.title || "YouTube Video";
            fileUrl = mat.youtubeVideo.alternateLink || "";
          }

          if (!title || !fileUrl) {
            log(`Skipping: no title="${title}" or no fileUrl="${fileUrl}"`);
            continue;
          }

          const classroomMaterialId = material.id || `${classroomCourseId}-${title}`;

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
                createdAt: creationDate || new Date(),
              },
            });
            syncedDocuments++;
            log(`Created doc: ${title}`);
          } else {
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

    log(`Sync complete: ${syncedDocuments} documents, ${syncedCourses} courses`);
    return NextResponse.json({
      success: true,
      message: `Berhasil menyinkronkan ${syncedDocuments} materi dari ${syncedCourses} kelas.`,
      syncedCourses,
      syncedDocuments,
    });
  } catch (error) {
    log(`ERROR: ${error}`);
    console.error("Classroom sync materials error:", error);
    return NextResponse.json({ error: "Failed to sync materials" }, { status: 500 });
  }
}
