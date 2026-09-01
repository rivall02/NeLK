import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env, hasGeminiConfigured } from "@/lib/env";
import { storageService } from "@/lib/storage";
import { extractScheduleWithAI } from "@/lib/ai";
import { normalizeExtractedSchedule, type ExtractedSchedule } from "@/lib/scheduling/normalization";
import { validateExtractedSchedule } from "@/lib/scheduling/validator";
import { logger } from "@/lib/logger";
import { auth } from "@/auth";

// Removed strict image mime types to allow any image format

// Allowed document mime types
const ALLOWED_DOC_MIME_TYPES = [
  "application/pdf",
  "text/plain",
];

// Allowed image mime types
const ALLOWED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
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

    // Check if AI is configured
    if (!hasGeminiConfigured()) {
      return NextResponse.json({
        message: "File berhasil diupload, tetapi AI belum dikonfigurasi untuk mengekstrak jadwal.",
        storedKey: stored.storageKey,
        requiresAI: true,
        extractedEvents: [],
      });
    }

    // Convert file to base64 for Gemini Vision (works for PDF, images, etc.)
    const base64Content = buffer.toString("base64");

    // For text files, we can also pass text directly as fallback
    let textFallback = "";
    if (file.type.startsWith("text/")) {
      textFallback = buffer.toString("utf-8");
    }

    // Extract schedule with AI
    let extractedEvents: any[] = [];
    let rawEvents: any[] = [];
    try {
      logger.info("Starting AI extraction...", { mimeType: file.type, base64Length: base64Content.length });
      
      rawEvents = await extractScheduleWithAI({
        base64: base64Content,
        mimeType: file.type,
        textFallback,
      });
      
      logger.info("AI extraction returned", { rawCount: rawEvents.length, sample: rawEvents[0] });

      // Map AI output directly to extractedEvents
      // AI returns: { title, date, startTime, endTime, day?, description? }
      extractedEvents = rawEvents.map((item: any) => {
        let day = item.day || "";
        // Derive day from date if not provided
        if (!day && item.date) {
          const dateObj = new Date(item.date);
          if (!isNaN(dateObj.getTime())) {
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            day = days[dateObj.getDay()];
          }
        }
        return {
          title: item.title || item.name || "",
          date: item.date || "",
          startTime: item.startTime || "00:00",
          endTime: item.endTime || "23:59",
          day,
          description: item.description || "",
        };
      }).filter((e: any) => e.title && e.date);
      logger.info("Schedule extracted from file", {
        userId: session.user.id,
        file: file.name,
        eventCount: extractedEvents.length,
      });

      return NextResponse.json({
        success: true,
        message: extractedEvents.length > 0 ? "File berhasil diproses" : "Tidak ada jadwal yang dapat diekstrak.",
        storedKey: stored.storageKey,
        extractedEvents,
        eventCount: extractedEvents.length,
        needsReview: false,
      });
    } catch (aiError) {
      logger.error("AI extraction failed for schedule", aiError);
      // Still return the stored file but with extraction error
      return NextResponse.json({
        message: "File berhasil diupload, tetapi gagal mengekstrak jadwal. Error: " + (aiError instanceof Error ? aiError.message : String(aiError)),
        storedKey: stored.storageKey,
        extractionError: true,
        extractedEvents: [],
        needsReview: true,
      });
    }

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