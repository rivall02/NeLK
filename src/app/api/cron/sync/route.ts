import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/sync
 *
 * This endpoint is called by Vercel Cron Jobs every hour.
 * It iterates over all users with a linked Google account and
 * refreshes their Classroom tasks + materials automatically in the background.
 *
 * Protected by a secret token stored in CRON_SECRET env variable.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Validate cron secret if set (required in production)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let syncedUsers = 0;
  let totalTasks = 0;
  let totalMaterials = 0;
  const errors: string[] = [];

  try {
    // Get all active Google accounts that have a refresh_token
    const googleAccounts = await prisma.account.findMany({
      where: {
        provider: "google",
        refresh_token: { not: null },
      },
      select: {
        userId: true,
        access_token: true,
        refresh_token: true,
        expires_at: true,
      },
    });

    for (const account of googleAccounts) {
      try {
        let accessToken = account.access_token;

        // Refresh access token if expired (expires_at is a Unix timestamp in seconds)
        const isExpired = account.expires_at
          ? Date.now() / 1000 > account.expires_at - 60
          : true;

        if (isExpired && account.refresh_token) {
          const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID || "",
              client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
              refresh_token: account.refresh_token,
              grant_type: "refresh_token",
            }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            accessToken = refreshData.access_token;
            const newExpiresAt = Math.floor(Date.now() / 1000) + (refreshData.expires_in || 3600);

            // Update stored token
            await prisma.account.updateMany({
              where: { userId: account.userId, provider: "google" },
              data: {
                access_token: accessToken,
                expires_at: newExpiresAt,
              },
            });
          } else {
            errors.push(`Failed to refresh token for user ${account.userId}`);
            continue;
          }
        }

        if (!accessToken) continue;

        // Sync classroom tasks
        const tasksSynced = await syncTasksForUser(account.userId, accessToken);
        totalTasks += tasksSynced;

        // Sync classroom materials
        const materialsSynced = await syncMaterialsForUser(account.userId, accessToken);
        totalMaterials += materialsSynced;

        syncedUsers++;
      } catch (err: any) {
        errors.push(`Error syncing user ${account.userId}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      syncedUsers,
      totalTasks,
      totalMaterials,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

async function syncTasksForUser(userId: string, accessToken: string): Promise<number> {
  let syncedCount = 0;

  const coursesRes = await fetch(
    "https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!coursesRes.ok) return 0;

  const coursesData = await coursesRes.json();
  const courses = coursesData.courses || [];

  for (const course of courses.slice(0, 10)) {
    const cwRes = await fetch(
      `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!cwRes.ok) continue;

    const cwData = await cwRes.json();
    for (const item of (cwData.courseWork || []).slice(0, 10)) {
      // Check submission status
      let isDone = false;
      try {
        const subRes = await fetch(
          `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/${item.id}/studentSubmissions`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (subRes.ok) {
          const subData = await subRes.json();
          const state = subData.studentSubmissions?.[0]?.state;
          if (state === "TURNED_IN" || state === "RETURNED") isDone = true;
        }
      } catch {}

      let dueDate: Date | null = null;
      if (item.dueDate) {
        dueDate = new Date(
          item.dueDate.year,
          (item.dueDate.month || 1) - 1,
          item.dueDate.day || 1
        );
      }

      const existing = await prisma.task.findFirst({
        where: { userId, title: item.title },
      });

      if (!existing) {
        await prisma.task.create({
          data: {
            title: item.title,
            description: item.description?.slice(0, 1000),
            subject: course.name,
            status: isDone ? "DONE" : "TODO",
            priority: "MEDIUM",
            dueDate,
            sourceUrl: item.alternateLink,
            userId,
          },
        });
        syncedCount++;
      } else {
        if (isDone && existing.status !== "DONE") {
          await prisma.task.update({
            where: { id: existing.id },
            data: { status: "DONE", sourceUrl: item.alternateLink || existing.sourceUrl },
          });
          syncedCount++;
        } else if (!existing.sourceUrl && item.alternateLink) {
          await prisma.task.update({
            where: { id: existing.id },
            data: { sourceUrl: item.alternateLink },
          });
        }
      }
    }
  }

  return syncedCount;
}

async function syncMaterialsForUser(userId: string, accessToken: string): Promise<number> {
  let syncedCount = 0;

  const coursesRes = await fetch(
    "https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!coursesRes.ok) return 0;

  const coursesData = await coursesRes.json();
  const courses = coursesData.courses || [];

  for (const course of courses.slice(0, 10)) {
    const matRes = await fetch(
      `https://classroom.googleapis.com/v1/courses/${course.id}/courseWorkMaterials`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!matRes.ok) continue;

    const matData = await matRes.json();
    for (const materialItem of (matData.courseWorkMaterial || []).slice(0, 10)) {
      if (!materialItem.materials || materialItem.materials.length === 0) continue;

      for (const mat of materialItem.materials) {
        let title = "";
        let fileUrl = "";

        if (mat.driveFile?.driveFile) {
          title = mat.driveFile.driveFile.title;
          fileUrl = mat.driveFile.driveFile.alternateLink;
        } else if (mat.link) {
          title = mat.link.title;
          fileUrl = mat.link.url;
        } else if (mat.youtubeVideo) {
          title = mat.youtubeVideo.title;
          fileUrl = mat.youtubeVideo.alternateLink;
        }

        if (!title || !fileUrl) continue;

        const existing = await prisma.document.findFirst({ where: { userId, title } });
        if (!existing) {
          await prisma.document.create({
            data: {
              title,
              content: `Materi dari Google Classroom: ${course.name}`,
              fileUrl,
              userId,
            },
          });
          syncedCount++;
        }
      }
    }
  }

  return syncedCount;
}
