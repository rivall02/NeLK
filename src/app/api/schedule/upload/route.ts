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
    
    // Fix mimeType for images (image/jpg -> image/jpeg)
    let mimeType = file.type;
    if (mimeType === "image/jpg") {
      mimeType = "image/jpeg";
    }
    
    // For text files, we can also pass text directly as fallback
    let textFallback = "";
    if (file.type.startsWith("text/")) {
      textFallback = buffer.toString("utf-8");
    }

    // Log for debugging
    logger.info("Upload file info:", { 
      fileName: file.name, 
      mimeType: mimeType, 
      originalMimeType: file.type,
      base64Length: base64Content.length,
      fileType: file.type,
    });

    // Extract schedule with AI
    let extractedEvents: any[] = [];
    let rawEvents: any[] = [];
    try {
      logger.info("Starting AI extraction...", { 
        mimeType, 
        base64Length: base64Content.length,
        fileType: file.type 
      });
      
      // For images, try with different approaches
      if (file.type.startsWith("image/")) {
        // Try gemini-3.6-flash first (recommended by Google)
        try {
          rawEvents = await extractScheduleWithAI({
            base64: base64Content,
            mimeType,
            textFallback: "",
          });
        } catch (visionError: unknown) {
          const errMsg = visionError instanceof Error ? visionError.message : String(visionError);
          logger.warn("Gemini Vision (with schema) failed, trying without schema:", { errorMessage: errMsg });
          
          // Fallback: try without strict schema
          const { GoogleGenerativeAI } = await import("@google/generative-ai");
          const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "");
          const model = genAI.getGenerativeModel({
            model: "gemini-3.6-flash",
            generationConfig: {
              responseMimeType: "application/json",
            },
          });
          
          // Format content correctly for Gemini Vision
          const contents = [
            {
              inlineData: {
                data: base64Content,
                mimeType: mimeType,
              },
            } as any,
            "Analisis foto jadwal berikut dan kembalikan JSON array. Lektur format JSON array yang valid.",
          ] as any;
          
          const result = await model.generateContent(contents);
          
          const text = result.response.text();
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          rawEvents = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        }
      } else {
        // For PDF, use standard extraction
        rawEvents = await extractScheduleWithAI({
          base64: base64Content,
          mimeType,
          textFallback,
        });
      }
      
      // Check if extraction returned anything
      if (!rawEvents || rawEvents.length === 0) {
        logger.warn("No events extracted from file", { fileName: file.name });
        return NextResponse.json({
          success: true,
          message: "File berhasil diupload, tetapi tidak ada jadwal yang dapat diekstrak dari gambar.",
          storedKey: stored.storageKey,
          extractedEvents: [],
          eventCount: 0,
          needsReview: true,
          suggestion: "Pastikan foto jadwal cukup jelas dan terbaca. Coba foto dengan kontras lebih baik.",
        });
      }
      
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