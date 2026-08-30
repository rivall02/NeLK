import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { storageService } from "@/lib/storage";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc || doc.userId !== session.user.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const storageKey = doc.storageKey || (doc.fileUrl ? doc.fileUrl.replace("/uploads/", "") : null);
    if (!storageKey) {
      return NextResponse.json({ error: "Storage key missing for document" }, { status: 404 });
    }

    const fileBuffer = await storageService.readFile(storageKey);
    const mimeType = doc.mimeType || "application/pdf";
    const filename = doc.title || "document";

    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    logger.error("Download document failed", error);
    return NextResponse.json({ error: "Failed to download document" }, { status: 500 });
  }
}
