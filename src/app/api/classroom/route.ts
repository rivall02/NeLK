import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  switch (action) {
    case "connect": {
      try {
        // Build Google OAuth URL directly without external library
        const redirectUrl = `${env.NEXTAUTH_URL}/api/classroom/callback`;
        const scope = [
          "https://www.googleapis.com/auth/classroom.courses.readonly",
          "https://www.googleapis.com/auth/classroom.coursework.readonly",
          "https://www.googleapis.com/auth/classroom.announcements.readonly",
        ].join(" ");

        const params = new URLSearchParams({
          client_id: env.GOOGLE_CLIENT_ID,
          redirect_uri: redirectUrl,
          response_type: "code",
          scope,
          access_type: "offline",
          prompt: "consent",
        });

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

        return NextResponse.json({ authUrl });
      } catch (error) {
        logger.error("Classroom connect error", error);
        return NextResponse.json(
          { error: "Failed to generate auth URL" },
          { status: 500 }
        );
      }
    }

    case "callback": {
      const code = searchParams.get("code");

      if (!code) {
        return NextResponse.json(
          { error: "Authorization code not provided" },
          { status: 400 }
        );
      }

      try {
        // Exchange code for tokens
        const tokenResponse = await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: env.GOOGLE_CLIENT_ID,
              client_secret: env.GOOGLE_CLIENT_SECRET,
              code,
              grant_type: "authorization_code",
              redirect_uri: `${env.NEXTAUTH_URL}/api/classroom/callback`,
            }),
          }
        );

        if (!tokenResponse.ok) {
          throw new Error("Failed to exchange code for tokens");
        }

        const tokens = await tokenResponse.json();

        // Get user info
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          }
        );

        const userInfo = await userInfoResponse.json();

        // Store integration record
        const user = await prisma.user.findFirst();

        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: "google-classroom",
              providerAccountId: userInfo.id,
            },
          },
          create: {
            userId: user?.id || "1",
            type: "oauth",
            provider: "google-classroom",
            providerAccountId: userInfo.id,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
          },
          update: {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
          },
        });

        return NextResponse.json({
          message: "Classroom OAuth completed",
          hasTokens: true,
          userId: user?.id || "1",
        });
      } catch (error) {
        logger.error("Classroom OAuth callback error", error);
        return NextResponse.json(
          { error: "Failed to process OAuth callback" },
          { status: 500 }
        );
      }
    }

    default:
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
  }
}