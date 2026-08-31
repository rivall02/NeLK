import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env, hasGeminiConfigured } from "@/lib/env";
import { storageService } from "@/lib/storage";
import { extractScheduleWithAI } from "@/lib/ai";
import { logger } from "@/lib/logger";
import { auth } from "@/auth";

// Allowed image mime types for upload
const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Allowed document mime types
const ALLOWED_DOC_MIME_TYPES = [
  "application/pdf",
  "text/plain",
];

export async function POST(request: Request) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size (max 10MB for processing)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File terlalu besar. Maksimal 10MB." }, { status: 400 });
    }

    // Validate mime type
    const allowedMimes = [...ALLOWED_IMAGE_MIME_TYPES, ...ALLOWED_DOC_MIME_TYPES];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json({
        error: `Tipe file ${file.type} tidak didukung untuk ekstraksi jadwal.`
      }, { status: 400 });
    }

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to storage
    const stored = await storageService.saveFile(buffer, file.name, file.type);

    // Extract text content based on file type
    let documentText = "";
    
    if (file.type === "application/pdf") {
      try {
        const pdfParse = (await import("pdf-parse")) as any;
        const data = await pdfParse.default(buffer);
        documentText = data.text || "";
      } catch (e) {
        logger.warn("PDF parsing failed for schedule extraction", { filename: file.name });
      }
    } else if (file.type.startsWith("text/")) {
      documentText = buffer.toString("utf-8");
    } else if (file.type.startsWith("image/")) {
      // Convert image to base64 data URL for AI vision
      const base64 = buffer.toString("base64");
      documentText = `data:${file.type};base64,${base64}`;
    }

    if (!documentText || documentText.length < 50) {
      return NextResponse.json({ error: "Tidak dapat mengekstrak teks dari file." }, { status: 400 });
    }

    // Check if AI is configured
    if (!hasGeminiConfigured()) {
      // Fallback: just store the file and return warning
      return NextResponse.json({
        message: "File berhasil diupload, tetapi AI belum dikonfigurasi untuk mengekstrak jadwal.",
        storedKey: stored.storageKey,
        requiresAI: true,
        extractedEvents: [],
      });
    }

    // Extract schedule with AI
    let extractedEvents: any[] = [];
    try {
      extractedEvents = await extractScheduleWithAI(documentText);
      logger.info("Schedule extracted from file", {
        userId: session.user.id,
        file: file.name,
        eventCount: extractedEvents.length,
      });
    } catch (aiError) {
      logger.error("AI extraction failed for schedule", aiError);
      // Still return the stored file but with extraction error
      return NextResponse.json({
        message: "File berhasil diupload, tetapi gagal mengekstrak jadwal.",
        storedKey: stored.storageKey,
        extractionError: true,
        extractedEvents: [],
      });
    }

    return NextResponse.json({
      message: "File berhasil diproses",
      storedKey: stored.storageKey,
      extractedEvents,
      eventCount: extractedEvents.length,
    });

  } catch (error) {
    logger.error("Schedule upload error", error);
    return NextResponse.json({
      error: "Gagal memproses file",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

// Preview endpoint - returns extracted events without saving
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
  }

  try {
    // Fetch content from URL
    const response = await fetch(url);
    const content = await response.text();

    // Extract schedule with AI
    const extracted = await extractScheduleWithAI(content);

    return NextResponse.json({
      extractedEvents: extracted,
    });
  } catch (error) {
    logger.error("Schedule preview error", error);
    return NextResponse.json({
      error: "Gagal mengekstrak jadwal",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}