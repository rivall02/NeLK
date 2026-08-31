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

import { env } from "@/lib/env";

/**
 * Refresh Google OAuth token using refresh_token
 */
export async function refreshGoogleToken(account: any) {
  if (!account.refresh_token) {
    throw new Error("No refresh token available");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: account.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Google token");
  }

  const tokens = await response.json();
  
  // Update account in database
  const updatedAccount = await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: tokens.access_token,
      expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
      ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
    },
  });

  return updatedAccount;
}

/**
 * Get valid access token (refreshes if expired)
 */
export async function getValidGoogleToken(account: any) {
  const isExpired = !account.expires_at || account.expires_at < Math.floor(Date.now() / 1000) + 60; // 60s buffer
  if (isExpired && account.refresh_token) {
    try {
      const updated = await refreshGoogleToken(account);
      return updated.access_token;
    } catch (e) {
      logger.error("Failed to refresh Google token automatically", e);
      return null;
    }
  }
  return account.access_token;
}
