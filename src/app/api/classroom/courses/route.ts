import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getValidGoogleToken } from "@/lib/classroom";

export async function GET() {
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
    const res = await fetch(
      "https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch courses" }, { status: res.status });
    }

    const data = await res.json();
    const courses = (data.courses || []).map((course: any) => ({
      id: course.id,
      name: course.name,
      section: course.section || null,
      description: course.description || null,
    }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Classroom courses fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
