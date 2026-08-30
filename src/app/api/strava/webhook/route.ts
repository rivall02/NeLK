import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

// Webhook subscription verification endpoint (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = env.STRAVA_VERIFY_TOKEN;

  if (mode === "subscribe" && token === expectedToken) {
    logger.info("Strava webhook verified successfully");
    return NextResponse.json({ "hub.challenge": challenge }, { status: 200 });
  } else {
    logger.warn("Strava webhook verification failed", { mode });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

// Webhook event endpoint (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    logger.info("Strava webhook event received", {
      object_type: body.object_type,
      aspect_type: body.aspect_type,
    });

    // Handle new activity creation
    if (body.object_type === "activity" && body.aspect_type === "create") {
      const ownerId = String(body.owner_id);

      const account = await prisma.account.findFirst({
        where: { provider: "strava", providerAccountId: ownerId },
      });

      if (account) {
        // Award XP for logging a real fitness activity
        await prisma.user.update({
          where: { id: account.userId },
          data: { xp: { increment: 30 } },
        });
        logger.info("Awarded fitness XP to user", { userId: account.userId });
      }
    }

    return NextResponse.json({ message: "EVENT_RECEIVED" }, { status: 200 });
  } catch (e) {
    logger.error("Error processing Strava webhook", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
